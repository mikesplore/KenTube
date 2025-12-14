import { appRoute } from '@genkit-ai/next';
import { answerKenyanYoutubeQuestionFlow } from '@/ai/flows/answer-kenyan-youtube-questions';

export const POST = appRoute(answerKenyanYoutubeQuestionFlow);
