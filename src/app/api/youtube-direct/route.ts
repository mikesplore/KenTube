import { NextRequest, NextResponse } from 'next/server';
import { getYoutubeStatistics } from '@/services/youtube-statistics';

export async function GET(req: NextRequest) {
  try {
    const q = req.nextUrl.searchParams.get('q') || 'Get current YouTube statistics for Kenya';
    const stats = await getYoutubeStatistics(q);
    const parsedStats = JSON.parse(stats);

    return NextResponse.json(parsedStats);
  } catch (error) {
    console.error('Error fetching YouTube stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch YouTube statistics' },
      { status: 500 }
    );
  }
}
