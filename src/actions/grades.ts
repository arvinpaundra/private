'use server';

import * as z from 'zod';
import { revalidatePath } from 'next/cache';
import { api, ApiError } from '@/lib/api-client';
import type { Grade } from '@/lib/types';
import { flattenFieldErrors } from '@/lib/form-utils';

const gradeSchema = z.object({
  name: z.string().min(2, 'Nama harus minimal 2 karakter'),
  description: z.string().optional(),
});

export type GradeFormState = {
  message: string;
  success: boolean;
  fields?: Record<string, string>;
  issues?: string[];
};

export async function getGradesAction(keywords?: string): Promise<Grade[]> {
  try {
    const queryParams = keywords
      ? `?keywords=${encodeURIComponent(keywords)}`
      : '';
    return await api.get<Grade[]>(`/v1/grades${queryParams}`);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new Error('Gagal mengambil data tingkat kelas.');
  }
}

export async function deleteGradeAction(id: string): Promise<void> {
  try {
    await api.delete(`/v1/grades/${id}`);
    revalidatePath('/dashboard/grades');
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 404) {
        throw new Error('Tingkat kelas tidak ditemukan.');
      }
      throw new Error(error.message);
    }
    throw new Error('Gagal menghapus tingkat kelas.');
  }
}

export async function saveGradeAction(
  gradeId: string | null,
  prevState: GradeFormState,
  formData: FormData
): Promise<GradeFormState> {
  const validated = gradeSchema.safeParse({
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
    if (gradeId) {
      // Update
      await api.put<Grade>(`/v1/grades/${gradeId}`, { name, description });
      revalidatePath('/dashboard/grades');
      return { message: 'Tingkat kelas berhasil diperbarui.', success: true };
    } else {
      // Create
      await api.post<Grade>('/v1/grades', { name, description });
      revalidatePath('/dashboard/grades');
      return { message: 'Tingkat kelas berhasil dibuat.', success: true };
    }
  } catch (error) {
    if (error instanceof ApiError) {
      // Map backend errors to user-friendly messages
      if (error.status === 400) {
        return { message: error.message, success: false };
      }
      if (error.status === 404) {
        return { message: 'Tingkat kelas tidak ditemukan.', success: false };
      }
      if (error.status === 409) {
        return {
          message: 'Tingkat kelas dengan nama yang sama sudah ada.',
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
