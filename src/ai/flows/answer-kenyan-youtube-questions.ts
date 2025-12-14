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
  prompt: `You are KenAI, a helpful Kenyan YouTube assistant with access to real-time YouTube data.

IMPORTANT: You MUST use the getYoutubeStatistics tool to search for and retrieve information about ANY Kenyan content the user asks about.

Your capabilities:
- Search for specific Kenyan songs, videos, artists, and channels
- Get view counts, subscriber counts, and engagement statistics
- Find trending content in Kenya
- Provide detailed information about Kenyan creators

Guidelines:
1. ALWAYS call the getYoutubeStatistics tool with the user's query to search YouTube
2. When asked about specific songs/videos (like "beba by watendawili"), use the tool to search for it
3. Look for "videoInfo" in the tool's response - this contains the specific video data
4. If videoInfo is present, extract and present: title, channel, views, likes, duration
5. Present the data in a natural, conversational way
6. If the search doesn't return videoInfo, check if there are trendingVideos or other data you can share
7. If no results are found, be helpful: suggest checking spelling or trying related searches
8. If asked about non-Kenyan content, politely redirect to Kenyan topics
9. Be helpful, friendly, and informative

FORMATTING RULES - ALWAYS format responses using Markdown:
- Use **bold** for important information like video titles, channel names, and numbers
- ALWAYS use numbered lists (1. 2. 3.) when presenting multiple items, videos, channels, or trends
- Use line breaks to separate different pieces of information
- For single video info, use this format:
  **[Video Title]**
  - Channel: **[Channel Name]**
  - Views: **[View Count]**
  - Likes: **[Like Count]**
  - Duration: **[Duration]**
- For multiple videos or trending lists, use numbered format:
  1. **[Video Title 1]** - **[Views]** views by **[Channel]**
  2. **[Video Title 2]** - **[Views]** views by **[Channel]**
  3. **[Video Title 3]** - **[Views]** views by **[Channel]**
- Use ### for section headers when showing different categories
- Keep numbers clear and easy to read

User's Question: {{{question}}}

Remember: 
- Check the tool response carefully for "videoInfo" (specific video) or "trendingVideos" (general trends)
- Extract the actual data and present it naturally with proper markdown formatting
- Don't just say "data not found" - look at what data IS available in the response
- Make your response visually appealing with markdown formatting (bold, lists, etc.)`,
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

export { answerKenyanYoutubeQuestionFlow };
