'use server';

import * as z from 'zod';
import { addModule, addQuestion, updateQuestion, deleteQuestion } from '@/lib/data-actions';
import { Module, Question } from '@/lib/types';
import { revalidatePath } from 'next/cache';

const moduleSchema = z.object({
  title: z.string().min(3, 'Judul harus minimal 3 karakter'),
  subjectId: z.string().min(1, 'Silakan pilih mata pelajaran'),
  gradeId: z.string().min(1, 'Silakan pilih tingkat kelas'),
  description: z.string().optional(),
});

export type FormState = {
  message: string;
  success: boolean;
  fields?: Record<string, string>;
  issues?: string[];
  data?: Module;
};

export async function createModuleAction(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const validated = moduleSchema.safeParse({
    title: formData.get('title'),
    subjectId: formData.get('subjectId'),
    gradeId: formData.get('gradeId'),
    description: formData.get('description'),
  });

  if (!validated.success) {
    const errors = validated.error.flatten();
    return {
      message: 'Validasi gagal',
      success: false,
      fields: errors.fieldErrors,
      issues: errors.formErrors,
    };
  }
  
  const { title, subjectId, gradeId, description } = validated.data;

  try {
    const newModule = await addModule({
      title,
      subjectId,
      gradeId,
      description: description || '',
    });

    revalidatePath('/dashboard/modules');
    return { 
      message: `Berhasil membuat modul "${newModule.title}".`,
      success: true,
      data: newModule,
    };

  } catch (error) {
    console.error(error);
    return { message: 'Terjadi kesalahan saat membuat modul.', success: false };
  }
}

const choiceSchema = z.object({
  id: z.string(),
  text: z.string().min(1, 'Teks pilihan tidak boleh kosong'),
});

const questionSchema = z.object({
  prompt: z.string().min(5, 'Prompt harus minimal 5 karakter'),
  choices: z.array(choiceSchema).min(2, 'Harus memiliki setidaknya 2 pilihan').max(4, 'Tidak boleh memiliki lebih dari 4 pilihan'),
  correctAnswer: z.string().min(1, 'Silakan pilih jawaban yang benar'),
  moduleId: z.string(),
  questionId: z.string().optional(),
});

export type QuestionFormState = {
  message: string;
  success: boolean;
  fields?: Record<string, string>;
  issues?: string[];
};

export async function saveQuestionAction(
  prevState: QuestionFormState,
  formData: FormData
): Promise<QuestionFormState> {

  const choiceEntries = Array.from(formData.entries())
    .filter(([key]) => key.startsWith('choices.'))
    .reduce<Record<string, { id: string; text: string }>>((acc, [key, value]) => {
      const match = key.match(/choices\.(\d+)\.(id|text)/);
      if (match) {
        const [, index, field] = match;
        if (!acc[index]) {
          acc[index] = { id: '', text: '' };
        }
        acc[index][field as 'id' | 'text'] = value as string;
      }
      return acc;
    }, {});

  const choices = Object.values(choiceEntries).filter(c => c.id || c.text);

  const validated = questionSchema.safeParse({
    prompt: formData.get('prompt'),
    choices: choices,
    correctAnswer: formData.get('correctAnswer'),
    moduleId: formData.get('moduleId'),
    questionId: formData.get('questionId'),
  });

  if (!validated.success) {
    const errors = validated.error.flatten();
    console.log(errors);
    return {
      message: 'Validasi gagal. Pastikan semua bidang diisi dengan benar.',
      success: false,
      fields: errors.fieldErrors,
      issues: errors.formErrors,
    };
  }

  const { moduleId, questionId, ...questionData } = validated.data;

  try {
    if (questionId) {
      // Update existing question
      await updateQuestion(moduleId, questionId, questionData);
      revalidatePath(`/dashboard/modules/${moduleId}`);
      return { message: 'Pertanyaan berhasil diperbarui!', success: true };
    } else {
      // Add new question
      await addQuestion(moduleId, questionData);
      revalidatePath(`/dashboard/modules/${moduleId}`);
      return { message: 'Pertanyaan berhasil ditambahkan!', success: true };
    }
  } catch (error) {
    console.error(error);
    return { message: 'Terjadi kesalahan.', success: false };
  }
}

export async function deleteQuestionAction(moduleId: string, questionId: string) {
    try {
        await deleteQuestion(moduleId, questionId);
        revalidatePath(`/dashboard/modules/${moduleId}`);
        return { message: 'Pertanyaan dihapus.', success: true };
    } catch (error) {
        return { message: 'Gagal menghapus pertanyaan.', success: false };
    }
}
