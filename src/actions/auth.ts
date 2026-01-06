'use server';

import * as z from 'zod';
import { createSession, deleteSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { api, ApiError } from '@/lib/api-client';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Kata sandi diperlukan'),
});

const registerSchema = z.object({
  name: z.string().min(3, 'Nama harus minimal 3 karakter'),
  email: z.string().email('Alamat email tidak valid'),
  password: z.string().min(8, 'Kata sandi harus minimal 8 karakter'),
});

export async function login(_: any, formData: FormData) {
  const validated = loginSchema.safeParse(Object.fromEntries(formData));

  if (!validated.success) {
    return { error: 'Data formulir tidak valid.' };
  }

  const { email, password } = validated.data;

  try {
    // Send credentials to backend verification
    const response = await api.post<{ user_id: string; access_token: string }>(
      '/v1/auth/login',
      {
        email,
        password,
      }
    );

    // Create session with backend token
    await createSession(response.access_token);

    return { success: true };
  } catch (error) {
    if (error instanceof ApiError) {
      // Map backend errors to user-friendly messages
      if (error.status === 400) {
        return { error: 'Email atau kata sandi tidak valid.' };
      }
      return { error: error.message };
    }
    return { error: 'Waduh, ada yang error nih! Coba lagi ya.' };
  }
}

export async function register(_: any, formData: FormData) {
  const validated = registerSchema.safeParse(Object.fromEntries(formData));

  if (!validated.success) {
    return { error: 'Data formulir tidak valid.' };
  }

  const { name, email, password } = validated.data;

  try {
    // Send registration data to backend
    await api.post('/v1/auth/register', {
      fullname: name,
      email,
      password,
    });

    return { success: true };
  } catch (error) {
    if (error instanceof ApiError) {
      // Map backend errors to user-friendly messages
      if (error.status === 409) {
        return { error: 'Email sudah terdaftar.' };
      }
      if (error.status === 400) {
        return { error: error.message || 'Data tidak valid.' };
      }
      return { error: error.message };
    }
    return { error: 'Oops, server lagi ngambek! Coba lagi nanti ya.' };
  }
}

export async function logout() {
  await deleteSession();
  redirect('/login');
}
