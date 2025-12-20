'use server';

import * as z from 'zod';
import { revalidatePath } from 'next/cache';
import { addGrade, updateGrade } from '@/lib/data-actions';

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
      fields: errors.fieldErrors,
      issues: errors.formErrors,
    };
  }

  const { name, description } = validated.data;

  try {
    if (gradeId) {
      // Update
      await updateGrade(gradeId, { name, description });
      revalidatePath('/dashboard/grades');
      return { message: 'Tingkat kelas berhasil diperbarui.', success: true };
    } else {
      // Create
      await addGrade({ name, description: description || '' });
      revalidatePath('/dashboard/grades');
      return { message: 'Tingkat kelas berhasil dibuat.', success: true };
    }
  } catch (error) {
    console.error(error);
    return { message: 'Terjadi kesalahan pada server.', success: false };
  }
}
