'use server';

import { api, ApiError } from '@/lib/api-client';
import type { ModuleWithSubmissions, QuestionFromAPI } from '@/lib/types';

export async function getSubmissionsAction(): Promise<ModuleWithSubmissions[]> {
  try {
    return await api.get<ModuleWithSubmissions[]>('/v1/submissions');
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new Error('Gagal mengambil data pengumpulan.');
  }
}

export async function createSubmissionAction(
  moduleSlug: string,
  studentName: string
): Promise<{ code: string; first_question_slug: string }> {
  try {
    return await api.post<{ code: string; first_question_slug: string }>(
      `/v1/modules/${moduleSlug}/submissions`,
      { student_name: studentName }
    );
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new Error('Gagal memulai modul.');
  }
}

export async function getQuestionAction(
  moduleSlug: string,
  questionSlug: string
): Promise<QuestionFromAPI> {
  try {
    return await api.get<QuestionFromAPI>(
      `/v1/modules/${moduleSlug}/questions/${questionSlug}`
    );
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new Error('Gagal mengambil pertanyaan.');
  }
}

export interface SubmitAnswerResponse {
  is_correct: boolean;
  correct_choice_id: string;
  correct_choice_content: string;
  next_question_slug: string | null;
}

export async function submitAnswerAction(
  moduleSlug: string,
  submissionCode: string,
  questionSlug: string,
  choiceId: string
): Promise<SubmitAnswerResponse> {
  try {
    return await api.post<SubmitAnswerResponse>(
      `/v1/modules/${moduleSlug}/submissions/${submissionCode}/answers`,
      {
        question_slug: questionSlug,
        choice_id: choiceId,
      }
    );
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new Error('Gagal mengirim jawaban.');
  }
}

export interface FinalizeSubmissionResponse {
  student_name: string;
  score: number;
  total: number;
  status: string;
}

export async function finalizeSubmissionAction(
  moduleSlug: string,
  submissionCode: string
): Promise<FinalizeSubmissionResponse> {
  try {
    return await api.patch<FinalizeSubmissionResponse>(
      `/v1/modules/${moduleSlug}/submissions/${submissionCode}/finalize`
    );
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new Error('Gagal menyelesaikan kuis.');
  }
}
