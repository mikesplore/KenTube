import { NextResponse } from 'next/server';

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';

interface YouTubeVideo {
  id: string;
  title: string;
  channelTitle: string;
  viewCount: string;
  thumbnail: string;
  likeCount?: string;
  publishedAt?: string;
}

/**
 * Formats large numbers to readable format
 */
function formatCount(count: string): string {
  const num = parseInt(count, 10);
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(0)}K`;
  }
  return count;
}

/**
 * Fetches genre-specific videos from YouTube
 */
async function fetchGenreVideos(genre: string): Promise<YouTubeVideo[]> {
  if (!YOUTUBE_API_KEY) {
    console.warn('YouTube API key not configured');
    return [];
  }

  try {
    // Search for genre-specific content
    const searchResponse = await fetch(
      `${YOUTUBE_API_BASE}/search?` +
        new URLSearchParams({
          part: 'snippet',
          q: genre,
          type: 'video',
          regionCode: 'KE',
          maxResults: '20',
          order: 'viewCount',
          key: YOUTUBE_API_KEY,
        })
    );

    if (!searchResponse.ok) {
      throw new Error(`YouTube API error: ${searchResponse.statusText}`);
    }

    const searchData = await searchResponse.json();
    
    if (!searchData.items || searchData.items.length === 0) {
      return [];
    }

    // Get video statistics
    const videoIds = searchData.items.map((item: any) => item.id.videoId).join(',');
    const statsResponse = await fetch(
      `${YOUTUBE_API_BASE}/videos?` +
        new URLSearchParams({
          part: 'snippet,statistics',
          id: videoIds,
          key: YOUTUBE_API_KEY,
        })
    );

    if (!statsResponse.ok) {
      throw new Error(`YouTube API error: ${statsResponse.statusText}`);
    }

    const statsData = await statsResponse.json();
    
    return statsData.items.map((item: any) => ({
      id: item.id,
      title: item.snippet.title,
      channelTitle: item.snippet.channelTitle,
      viewCount: formatCount(item.statistics.viewCount),
      thumbnail: item.snippet.thumbnails.medium.url,
      likeCount: item.statistics.likeCount ? formatCount(item.statistics.likeCount) : undefined,
      publishedAt: item.snippet.publishedAt,
    }));
  } catch (error) {
    console.error('Error fetching genre videos:', error);
    return [];
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const genre = searchParams.get('genre') || 'Kenyan content';

  try {
    const videos = await fetchGenreVideos(genre);
    
    // Extract unique channels
    const uniqueChannels = [...new Set(videos.map(v => v.channelTitle))];
    
    // Calculate total views (convert formatted back for calculation)
    const totalViewsRaw = videos.reduce((sum, v) => {
      const views = v.viewCount.replace(/[MK]/g, '');
      const multiplier = v.viewCount.includes('M') ? 1000000 : v.viewCount.includes('K') ? 1000 : 1;
      return sum + (parseFloat(views) * multiplier);
    }, 0);

    const stats = {
      totalVideos: videos.length,
      totalViews: formatCount(totalViewsRaw.toString()),
      topChannels: uniqueChannels.slice(0, 10),
      videos: videos.slice(0, 10),
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error in genre-stats API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch genre statistics' },
      { status: 500 }
    );
  }
}
