'use server';
/**
 * @fileOverview Dynamically generates question prompts and answers based on the learning content for each module.
 *
 * - generateQuestionPrompts - A function that handles the question generation process.
 * - GenerateQuestionPromptsInput - The input type for the generateQuestionPrompts function.
 * - GenerateQuestionPromptsOutput - The return type for the generateQuestionPrompts function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateQuestionPromptsInputSchema = z.object({
  moduleContent: z
    .string()
    .describe('The learning content for the module.'),
  numberOfQuestions: z
    .number()
    .default(3)
    .describe('The number of questions to generate.'),
});
export type GenerateQuestionPromptsInput = z.infer<
  typeof GenerateQuestionPromptsInputSchema
>;

const GenerateQuestionPromptsOutputSchema = z.object({
  questions: z.array(
    z.object({
      prompt: z.string().describe('The question prompt.'),
      answer: z.string().describe('The answer to the question.'),
    })
  ),
});
export type GenerateQuestionPromptsOutput = z.infer<
  typeof GenerateQuestionPromptsOutputSchema
>;

export async function generateQuestionPrompts(
  input: GenerateQuestionPromptsInput
): Promise<GenerateQuestionPromptsOutput> {
  return generateQuestionPromptsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateQuestionPromptsPrompt',
  input: {schema: GenerateQuestionPromptsInputSchema},
  output: {schema: GenerateQuestionPromptsOutputSchema},
  prompt: `You are an expert educator specializing in generating questions based on learning content.

  You will generate {{numberOfQuestions}} questions and answers based on the following learning content:

  Learning Content: {{{moduleContent}}}

  Ensure that the questions are relevant and engaging, and that the answers are accurate.
  Return the questions and answers as a JSON array.

  Format:
  {
    "questions": [
      {
        "prompt": "Question 1",
        "answer": "Answer 1"
      },
      {
        "prompt": "Question 2",
        "answer": "Answer 2"
      }
    ]
  }
  `,
});

const generateQuestionPromptsFlow = ai.defineFlow(
  {
    name: 'generateQuestionPromptsFlow',
    inputSchema: GenerateQuestionPromptsInputSchema,
    outputSchema: GenerateQuestionPromptsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
