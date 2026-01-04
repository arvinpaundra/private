'use server';

import * as z from 'zod';
import {
  Module,
  ModulesResponse,
  ModuleDetail,
  ChoiceInput,
  QuestionInput,
} from '@/lib/types';
import { revalidatePath } from 'next/cache';
import { api, ApiError } from '@/lib/api-client';
import { flattenFieldErrors } from '@/lib/form-utils';

export interface GetModulesParams {
  keyword?: string;
  grade_id?: string;
  subject_id?: string;
  page?: number;
  per_page?: number;
}

export async function getModulesAction(
  params: GetModulesParams = {}
): Promise<ModulesResponse> {
  try {
    const queryParams = new URLSearchParams();

    if (params.keyword) queryParams.append('keyword', params.keyword);
    if (params.grade_id && params.grade_id !== 'all')
      queryParams.append('grade_id', params.grade_id);
    if (params.subject_id && params.subject_id !== 'all')
      queryParams.append('subject_id', params.subject_id);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.per_page)
      queryParams.append('per_page', params.per_page.toString());

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/v1/modules?${queryString}` : '/v1/modules';

    return await api.get<ModulesResponse>(endpoint);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new Error('Gagal mengambil data modul.');
  }
}

export async function deleteModuleAction(slug: string): Promise<void> {
  try {
    await api.delete(`/v1/modules/${slug}`);
    revalidatePath('/dashboard/modules');
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 404) {
        throw new Error('Modul tidak ditemukan.');
      }
      throw new Error(error.message);
    }
    throw new Error('Gagal menghapus modul.');
  }
}

export async function toggleModulePublishAction(slug: string): Promise<void> {
  try {
    await api.patch(`/v1/modules/${slug}/publish`);
    revalidatePath('/dashboard/modules');
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 404) {
        throw new Error('Modul tidak ditemukan.');
      }
      throw new Error(error.message);
    }
    throw new Error('Gagal mengubah status publikasi modul.');
  }
}

export async function getModuleQuestionsBySlugAction(
  slug: string
): Promise<ModuleDetail> {
  try {
    return await api.get<ModuleDetail>(`/v1/modules/${slug}/questions`);
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 404) {
        throw new Error('Modul tidak ditemukan.');
      }
      throw new Error(error.message);
    }
    throw new Error('Gagal mengambil detail modul.');
  }
}

export async function getModuleBySlug(slug: string): Promise<Module> {
  try {
    return await api.get<Module>(`/v1/modules/${slug}`);
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 404) {
        throw new Error('Modul tidak ditemukan.');
      }
      throw new Error(error.message);
    }
    throw new Error('Gagal mengambil data modul.');
  }
}

const moduleSchema = z.object({
  title: z.string().min(3, 'Judul harus minimal 3 karakter'),
  subject_id: z.string().min(1, 'Silakan pilih mata pelajaran'),
  grade_id: z.string().min(1, 'Silakan pilih tingkat kelas'),
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
    subject_id: formData.get('subject_id'),
    grade_id: formData.get('grade_id'),
    description: formData.get('description'),
  });

  if (!validated.success) {
    const errors = validated.error.flatten();
    return {
      message: 'Validasi gagal',
      success: false,
      fields: flattenFieldErrors(errors.fieldErrors),
      issues: errors.formErrors,
    };
  }

  const { title, subject_id, grade_id, description } = validated.data;

  try {
    const result = await api.post<Module>('/v1/modules', {
      title,
      subject_id,
      grade_id,
      description,
    });

    revalidatePath('/dashboard/modules');
    return {
      message: `Modul "${title}" berhasil dibuat.`,
      success: true,
      data: result,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      // Map backend errors to user-friendly messages
      if (error.status === 400) {
        return { message: 'Data tidak valid.', success: false };
      }
      if (error.status === 404) {
        return { message: 'Modul tidak ditemukan.', success: false };
      }
      if (error.status === 409) {
        return {
          message: 'Modul dengan nama yang sama sudah ada.',
          success: false,
        };
      }
      return { message: error.message, success: false };
    }

    return { message: 'Gagal membuat modul.', success: false };
  }
}

const choiceSchemaForAction = z.object({
  id: z.string().optional(),
  content: z.string().min(1, 'Teks pilihan tidak boleh kosong'),
  is_correct_answer: z.boolean(),
});

const questionSchemaForAction = z.object({
  id: z.string().nullable().optional(),
  content: z.string(),
  slug: z.string().optional(),
  choices: z
    .array(choiceSchemaForAction)
    .min(2, 'Harus memiliki setidaknya 2 pilihan')
    .max(4, 'Tidak boleh lebih dari 4 pilihan')
    .refine(
      (choices) => choices.some((c) => c.is_correct_answer),
      'Setidaknya satu pilihan harus menjadi jawaban yang benar'
    ),
});

const questionsSchemaForAction = z.object({
  moduleSlug: z.string(),
  questions: z.array(questionSchemaForAction),
});

export type QuestionFormState = {
  message: string;
  success: boolean;
  fields?: Record<string, string>;
  issues?: string[];
  questions?: any[];
};

export async function saveAllQuestionsAction(
  prevState: QuestionFormState,
  formData: FormData
): Promise<QuestionFormState> {
  const moduleSlug = formData.get('moduleSlug') as string;

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

  // Build questions array
  for (const index of Array.from(questionIndices).sort()) {
    const questionId = formData.get(`questions.${index}.id`) as string;
    const content = formData.get(`questions.${index}.content`) as string;
    const slug = formData.get(`questions.${index}.slug`) as string;

    // Build choices for this question
    const choices: ChoiceInput[] = [];
    const choiceIndices = new Set<string>();
    for (const key of formData.keys()) {
      const choiceMatch = key.match(
        new RegExp(`^questions\\.${index}\\.choices\\.(\\d+)\\.id$`)
      );
      if (choiceMatch) {
        choiceIndices.add(choiceMatch[1]);
      }
    }

    for (const choiceIndex of Array.from(choiceIndices).sort()) {
      const choiceContent = formData.get(
        `questions.${index}.choices.${choiceIndex}.content`
      ) as string;

      const isCorrect =
        formData.get(
          `questions.${index}.choices.${choiceIndex}.is_correct_answer`
        ) === 'true';

      if (choiceContent !== null) {
        const choice: ChoiceInput = {
          content: choiceContent,
          is_correct_answer: isCorrect,
        };

        choices.push(choice);
      }
    }

    const question: QuestionInput = {
      content,
      choices,
    };

    if (questionId) {
      question.id = questionId;
    }

    questions.push(question);
  }

  const validated = questionsSchemaForAction.safeParse({
    moduleSlug,
    questions,
  });

  if (!validated.success) {
    const errors = validated.error.flatten();
    console.log('errors', errors);
    return {
      message: 'Validasi gagal. Silakan periksa semua kolom.',
      success: false,
      issues: errors.formErrors,
      fields: flattenFieldErrors(errors.fieldErrors),
      questions: questions,
    };
  }

  try {
    // Send the questions to the API
    await api.post(`/v1/modules/${moduleSlug}/questions`, {
      questions: validated.data.questions,
    });

    revalidatePath(`/dashboard/modules/${moduleSlug}`);
    return { message: 'Pertanyaan berhasil disimpan!', success: true };
  } catch (error) {
    if (error instanceof ApiError) {
      return { message: error.message, success: false, questions: questions };
    }
    return {
      message: 'Terjadi kesalahan saat menyimpan.',
      success: false,
      questions: questions,
    };
  }
}
