'use server';

import { generateModuleSummary } from '@/ai/flows/generate-module-summary';

export async function generateSummaryAction(moduleDescription: string): Promise<{summary: string | null}> {
  if (!moduleDescription) {
    return { summary: null };
  }

  try {
    const result = await generateModuleSummary({ moduleContent: moduleDescription });
    return { summary: result.summary };
  } catch (error) {
    console.error('Gagal menghasilkan ringkasan:', error);
    return { summary: 'Tidak dapat menghasilkan ringkasan saat ini.' };
  }
}
