'use server';

import * as z from 'zod';
import { revalidatePath } from 'next/cache';
import { addSubject, updateSubject } from '@/lib/data-actions';

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
      fields: errors.fieldErrors,
      issues: errors.formErrors,
    };
  }

  const { name, description } = validated.data;

  try {
    if (subjectId) {
      // Update
      await updateSubject(subjectId, { name, description });
      revalidatePath('/dashboard/subjects');
      return { message: 'Mata pelajaran berhasil diperbarui.', success: true };
    } else {
      // Create
      await addSubject({ name, description });
      revalidatePath('/dashboard/subjects');
      return { message: 'Mata pelajaran berhasil dibuat.', success: true };
    }
  } catch (error) {
    console.error(error);
    return { message: 'Terjadi kesalahan pada server.', success: false };
  }
}
