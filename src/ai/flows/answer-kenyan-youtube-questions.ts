'use server';
/**
 * @fileOverview A flow to answer questions about Kenyan YouTube trends and statistics.
 *
 * - answerKenyanYoutubeQuestion - A function that handles answering questions about Kenyan YouTube trends and statistics.
 * - AnswerKenyanYoutubeQuestionInput - The input type for the answerKenyanYoutubeQuestion function.
 * - AnswerKenyanYoutubeQuestionOutput - The return type for the answerKenyanYoutubeQuestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {getYoutubeStatistics} from '@/services/youtube-statistics';

const AnswerKenyanYoutubeQuestionInputSchema = z.object({
  question: z.string().describe('The question about Kenyan YouTube trends and statistics.'),
});
export type AnswerKenyanYoutubeQuestionInput = z.infer<typeof AnswerKenyanYoutubeQuestionInputSchema>;

const AnswerKenyanYoutubeQuestionOutputSchema = z.object({
  answer: z.string().describe('The answer to the question about Kenyan YouTube trends and statistics.'),
});
export type AnswerKenyanYoutubeQuestionOutput = z.infer<typeof AnswerKenyanYoutubeQuestionOutputSchema>;

export async function answerKenyanYoutubeQuestion(input: AnswerKenyanYoutubeQuestionInput): Promise<AnswerKenyanYoutubeQuestionOutput> {
  return answerKenyanYoutubeQuestionFlow(input);
}

const youtubeStatisticsTool = ai.defineTool({
  name: 'getYoutubeStatistics',
  description: 'Retrieves Kenyan YouTube statistics based on the user question.',
  inputSchema: z.object({
    query: z.string().describe('The user question to guide the statistics retrieval.'),
  }),
  outputSchema: z.string(),
}, async (input) => {
  // Call the YouTube statistics service to get the data
  return await getYoutubeStatistics(input.query);
});

const prompt = ai.definePrompt({
  name: 'answerKenyanYoutubeQuestionPrompt',
  input: {schema: AnswerKenyanYoutubeQuestionInputSchema},
  output: {schema: AnswerKenyanYoutubeQuestionOutputSchema},
  tools: [youtubeStatisticsTool],
  prompt: `You are an expert on Kenyan YouTube trends and statistics. Use the available tools to answer the user's question accurately and comprehensively.\n\nQuestion: {{{question}}}`,
});

const answerKenyanYoutubeQuestionFlow = ai.defineFlow(
  {
    name: 'answerKenyanYoutubeQuestionFlow',
    inputSchema: AnswerKenyanYoutubeQuestionInputSchema,
    outputSchema: AnswerKenyanYoutubeQuestionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
