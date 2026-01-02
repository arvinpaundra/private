'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating a module summary.
 *
 * The flow takes module content as input and returns a GenAI-powered summary.
 * @fileOverview
 *
 * - `generateModuleSummary`: A function to generate a summary of a module's content.
 * - `GenerateModuleSummaryInput`: The input type for the `generateModuleSummary` function.
 * - `GenerateModuleSummaryOutput`: The output type for the `generateModuleSummary` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateModuleSummaryInputSchema = z.object({
  moduleContent: z
    .string()
    .describe('The content of the module to be summarized.'),
});
export type GenerateModuleSummaryInput = z.infer<
  typeof GenerateModuleSummaryInputSchema
>;

const GenerateModuleSummaryOutputSchema = z.object({
  summary: z.string().describe('The GenAI-powered summary of the module.'),
  progress: z.string().describe('A short, one-sentence summary of progress.')
});
export type GenerateModuleSummaryOutput = z.infer<
  typeof GenerateModuleSummaryOutputSchema
>;

export async function generateModuleSummary(
  input: GenerateModuleSummaryInput
): Promise<GenerateModuleSummaryOutput> {
  return generateModuleSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateModuleSummaryPrompt',
  input: {schema: GenerateModuleSummaryInputSchema},
  output: {schema: GenerateModuleSummaryOutputSchema},
  prompt: `You are an expert educator. Please provide a concise summary of the following module content for students:

  Module Content:
  {{moduleContent}}
  `,
});

const generateModuleSummaryFlow = ai.defineFlow(
  {
    name: 'generateModuleSummaryFlow',
    inputSchema: GenerateModuleSummaryInputSchema,
    outputSchema: GenerateModuleSummaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return {
      ...output!,
      progress: 'Generated a GenAI-powered summary of the module content.',
    };
  }
);
