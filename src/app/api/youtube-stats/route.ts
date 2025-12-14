import { NextRequest, NextResponse } from 'next/server';
import { getYoutubeStatistics } from '@/services/youtube-statistics';
import { answerKenyanYoutubeQuestion } from '@/ai/flows/answer-kenyan-youtube-questions';

export async function GET(req: NextRequest) {
  try {
    const q = req.nextUrl.searchParams.get('q') || 'Get current YouTube statistics for Kenya';
    const stats = await getYoutubeStatistics(q);
    const parsedStats = JSON.parse(stats);

    // Get AI-generated response from Gemini
    let aiAnswer = '';
    try {
      const aiResult = await answerKenyanYoutubeQuestion({ question: q });
      aiAnswer = aiResult.answer;
    } catch (e) {
      console.warn('Gemini flow failed, continuing with stats only:', e);
    }

    return NextResponse.json({
      aiAnswer,
      ...parsedStats,
    });
  } catch (error) {
    console.error('Error fetching YouTube stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch YouTube statistics' },
      { status: 500 }
    );
  }
}

