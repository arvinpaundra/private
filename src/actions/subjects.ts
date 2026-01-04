'use server';

import * as z from 'zod';
import { revalidatePath } from 'next/cache';
import { api, ApiError } from '@/lib/api-client';
import type { Subject } from '@/lib/types';
import { flattenFieldErrors } from '@/lib/form-utils';

const subjectSchema = z.object({
  name: z.string().min(2, 'Nama harus minimal 2 karakter'),
  description: z.string().optional(),
});

export type SubjectFormState = {
  message: string;
  success: boolean;
  fields?: Record<string, string>;
  issues?: string[];
};

export async function getSubjectsAction(keywords?: string): Promise<Subject[]> {
  try {
    const queryParams = keywords
      ? `?keywords=${encodeURIComponent(keywords)}`
      : '';
    return await api.get<Subject[]>(`/v1/subjects${queryParams}`);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new Error('Gagal mengambil data mata pelajaran.');
  }
}

export async function deleteSubjectAction(id: string): Promise<void> {
  try {
    await api.delete(`/v1/subjects/${id}`);
    revalidatePath('/dashboard/subjects');
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 404) {
        throw new Error('Mata pelajaran tidak ditemukan.');
      }
      throw new Error(error.message);
    }
    throw new Error('Gagal menghapus mata pelajaran.');
  }
}

export async function saveSubjectAction(
  subjectId: string | null,
  prevState: SubjectFormState,
  formData: FormData
): Promise<SubjectFormState> {
  const validated = subjectSchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description'),
  });

  if (!validated.success) {
    const errors = validated.error.flatten();
    return {
      message: 'Validasi gagal.',
      success: false,
      fields: flattenFieldErrors(errors.fieldErrors),
      issues: errors.formErrors,
    };
  }

  const { name, description } = validated.data;

  try {
    if (subjectId) {
      // Update
      await api.put<Subject>(`/v1/subjects/${subjectId}`, {
        name,
        description,
      });
      revalidatePath('/dashboard/subjects');
      return { message: 'Mata pelajaran berhasil diperbarui.', success: true };
    } else {
      // Create
      await api.post<Subject>('/v1/subjects', { name, description });
      revalidatePath('/dashboard/subjects');
      return { message: 'Mata pelajaran berhasil dibuat.', success: true };
    }
  } catch (error) {
    if (error instanceof ApiError) {
      // Map backend errors to user-friendly messages
      if (error.status === 400) {
        return {
          message: error.message || 'Data tidak valid.',
          success: false,
        };
      }
      if (error.status === 404) {
        return { message: 'Mata pelajaran tidak ditemukan.', success: false };
      }
      if (error.status === 409) {
        return {
          message: 'Mata pelajaran dengan nama yang sama sudah ada.',
          success: false,
        };
      }
      return { message: error.message, success: false };
    }
    return {
      message: 'Waduh, ada yang error nih! Coba lagi ya.',
      success: false,
    };
  }
}
