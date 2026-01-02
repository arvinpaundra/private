'use server';

import * as z from 'zod';
import {
  addModule,
  deleteQuestion,
  replaceQuestionsForModule,
} from '@/lib/data-actions';
import { Module } from '@/lib/types';
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
    return {
      message: 'Terjadi kesalahan saat membuat modul.',
      success: false,
    };
  }
}

const choiceSchema = z.object({
  id: z.string(),
  text: z.string().min(1, 'Teks pilihan tidak boleh kosong'),
});

const questionSchema = z.object({
  id: z.string(),
  prompt: z.string().min(5, 'Isi pertanyaan harus minimal 5 karakter'),
  choices: z
    .array(choiceSchema)
    .min(2, 'Harus memiliki setidaknya 2 pilihan')
    .max(4, 'Tidak boleh lebih dari 4 pilihan'),
  correctAnswer: z.string().min(1, 'Silakan pilih jawaban yang benar'),
});

const questionsSchemaForAction = z.object({
  moduleId: z.string(),
  questions: z.array(questionSchema),
});

export type QuestionFormState = {
  message: string;
  success: boolean;
  fields?: Record<string, string>;
  issues?: string[];
};

export async function saveAllQuestionsAction(
  prevState: QuestionFormState,
  formData: FormData
): Promise<QuestionFormState> {
  const moduleId = formData.get('moduleId') as string;

  // Manually construct the questions array from FormData
  const questions: any[] = [];
  const questionIndices = new Set<string>();

  // First, find all unique question indices
  for (const key of formData.keys()) {
    const match = key.match(/^questions\.(\d+)\.id$/);
    if (match) {
      questionIndices.add(match[1]);
    }
  }

  // Now, build each question object
  for (const index of Array.from(questionIndices).sort()) {
    const questionId = formData.get(`questions.${index}.id`) as string;
    const prompt = formData.get(`questions.${index}.prompt`) as string;
    const correctAnswer = formData.get(
      `questions.${index}.correctAnswer`
    ) as string;

    // Build choices for this question
    const choices: any[] = [];
    const choiceIndices = new Set<string>();
    for (const key of formData.keys()) {
      const choiceMatch = key.match(
        `^questions\.${index}\.choices\.(\\d+)\.id$`
      );
      if (choiceMatch) {
        choiceIndices.add(choiceMatch[1]);
      }
    }

    for (const choiceIndex of Array.from(choiceIndices).sort()) {
      const choiceId = formData.get(
        `questions.${index}.choices.${choiceIndex}.id`
      );
      const choiceText = formData.get(
        `questions.${index}.choices.${choiceIndex}.text`
      );
      if (choiceId && choiceText !== null) {
        choices.push({ id: choiceId, text: choiceText });
      }
    }

    questions.push({
      id: questionId,
      prompt,
      choices,
      correctAnswer,
    });
  }

  const validated = questionsSchemaForAction.safeParse({
    moduleId,
    questions,
  });

  if (!validated.success) {
    console.log('Validation Errors:', validated.error.flatten());
    return {
      message: 'Validasi gagal. Silakan periksa semua kolom.',
      success: false,
      issues: validated.error.flatten().formErrors,
      fields: validated.error.flatten().fieldErrors as Record<string, string>,
    };
  }

  try {
    await replaceQuestionsForModule(
      validated.data.moduleId,
      validated.data.questions
    );
    revalidatePath(`/dashboard/modules/${validated.data.moduleId}`);
    return { message: 'Pertanyaan berhasil disimpan!', success: true };
  } catch (error) {
    console.error(error);
    return { message: 'Terjadi kesalahan saat menyimpan.', success: false };
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
