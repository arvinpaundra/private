'use server';

import * as z from 'zod';
import { createSession, deleteSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Kata sandi diperlukan'),
});

const registerSchema = z.object({
    name: z.string().min(2, 'Nama harus minimal 2 karakter'),
    email: z.string().email('Alamat email tidak valid'),
    password: z.string().min(8, 'Kata sandi harus minimal 8 karakter'),
});

export async function login(prevState: any, formData: FormData) {
  const validated = loginSchema.safeParse(Object.fromEntries(formData));

  if (!validated.success) {
    return { error: 'Data formulir tidak valid.' };
  }

  const { email, password } = validated.data;

  // In a real app, you'd verify credentials against a database
  if (email === 'admin@example.com' && password === 'admin') {
    const user = { id: 'user-1', name: 'Admin User', email: 'admin@example.com' };
    await createSession(user);
    // Redirect is handled on client-side for better UX
    return { success: true };
  }

  return { error: 'Email atau kata sandi tidak valid.' };
}

export async function register(prevState: any, formData: FormData) {
    const validated = registerSchema.safeParse(Object.fromEntries(formData));

    if (!validated.success) {
      return { error: 'Data formulir tidak valid.' };
    }

    const { name, email, password } = validated.data;

    console.log('Mendaftarkan pengguna:', { name, email });
    // In a real app, you'd create a new user in the database.
    // For this demo, we'll just log it and simulate success.

    // Automatically log in the user after registration
    const user = { id: `user-${Math.random()}`, name, email };
    await createSession(user);

    return { success: true };
}


export async function logout() {
  await deleteSession();
  redirect('/login');
}
