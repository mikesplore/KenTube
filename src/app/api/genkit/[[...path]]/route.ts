import { createApiHandler } from '@genkit-ai/next';
import '@/ai/flows/answer-kenyan-youtube-questions';

export const { GET, POST } = createApiHandler();
