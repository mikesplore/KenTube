/**
 * Enhanced YouTube Statistics Service
 * Comprehensive YouTube Data API v3 integration for Kenyan content analysis
 */

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';

interface YouTubeVideo {
  id: string;
  title: string;
  channelTitle: string;
  viewCount: string;
  thumbnail: string;
  likeCount?: string;
  commentCount?: string;
  publishedAt?: string;
  duration?: string;
  description?: string;
  tags?: string[];
  categoryId?: string;
}

interface YouTubeChannel {
  id: string;
  title: string;
  subscriberCount: string;
  viewCount?: string;
  videoCount?: string;
  description?: string;
  customUrl?: string;
  publishedAt?: string;
  country?: string;
}

interface YouTubeComment {
  id: string;
  author: string;
  text: string;
  likeCount: string;
  publishedAt: string;
}

interface YouTubePlaylist {
  id: string;
  title: string;
  description: string;
  videoCount: string;
  channelTitle: string;
}

/**
 * Formats large numbers to readable format
 */
function formatCount(count: string | number): string {
  const num = typeof count === 'string' ? parseInt(count, 10) : count;
  if (num >= 1000000000) {
    return `${(num / 1000000000).toFixed(1)}B`;
  }
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(0)}K`;
  }
  return num.toString();
}

/**
 * Converts ISO 8601 duration to readable format
 */
function formatDuration(duration: string): string {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return duration;
  
  const hours = match[1] || '0';
  const minutes = match[2] || '0';
  const seconds = match[3] || '0';
  
  if (hours !== '0') {
    return `${hours}:${minutes.padStart(2, '0')}:${seconds.padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.padStart(2, '0')}`;
}

/**
 * 1. Search for trending videos in Kenya
 */
async function getTrendingVideos(maxResults: number = 10): Promise<YouTubeVideo[]> {
  if (!YOUTUBE_API_KEY) return [];

  try {
    const response = await fetch(
      `${YOUTUBE_API_BASE}/videos?` +
        new URLSearchParams({
          part: 'snippet,statistics,contentDetails',
          chart: 'mostPopular',
          regionCode: 'KE',
          maxResults: maxResults.toString(),
          key: YOUTUBE_API_KEY,
        })
    );

    if (!response.ok) {
      console.error('YouTube API error (trending):', response.statusText);
      // Return empty array instead of throwing - graceful degradation
      return [];
    }

    const data = await response.json();
    return data.items.map((item: any) => ({
      id: item.id,
      title: item.snippet.title,
      channelTitle: item.snippet.channelTitle,
      viewCount: item.statistics.viewCount,
      thumbnail: item.snippet.thumbnails.medium.url,
      likeCount: item.statistics.likeCount,
      commentCount: item.statistics.commentCount,
      duration: formatDuration(item.contentDetails.duration),
      publishedAt: item.snippet.publishedAt,
    }));
  } catch (error) {
    console.error('Error fetching trending videos:', error);
    return [];
  }
}

/**
 * 2. Search for videos by keyword
 */
async function searchVideosByKeyword(
  keyword: string,
  maxResults: number = 10,
  order: string = 'relevance'
): Promise<YouTubeVideo[]> {
  if (!YOUTUBE_API_KEY) return [];

  try {
    const searchResponse = await fetch(
      `${YOUTUBE_API_BASE}/search?` +
        new URLSearchParams({
          part: 'snippet',
          q: keyword,
          type: 'video',
          regionCode: 'KE',
          maxResults: maxResults.toString(),
          order: order,
          key: YOUTUBE_API_KEY,
        })
    );

    if (!searchResponse.ok) throw new Error(`YouTube API error: ${searchResponse.statusText}`);

    const searchData = await searchResponse.json();
    
    if (!searchData.items || searchData.items.length === 0) return [];

    const videoIds = searchData.items.map((item: any) => item.id.videoId).join(',');
    const statsResponse = await fetch(
      `${YOUTUBE_API_BASE}/videos?` +
        new URLSearchParams({
          part: 'snippet,statistics,contentDetails',
          id: videoIds,
          key: YOUTUBE_API_KEY,
        })
    );

    if (!statsResponse.ok) throw new Error(`YouTube API error: ${statsResponse.statusText}`);

    const statsData = await statsResponse.json();
    
    return statsData.items.map((item: any) => ({
      id: item.id,
      title: item.snippet.title,
      channelTitle: item.snippet.channelTitle,
      viewCount: item.statistics.viewCount,
      thumbnail: item.snippet.thumbnails.medium.url,
      likeCount: item.statistics.likeCount,
      commentCount: item.statistics.commentCount,
      duration: formatDuration(item.contentDetails.duration),
      publishedAt: item.snippet.publishedAt,
    }));
  } catch (error) {
    console.error('Error searching videos:', error);
    return [];
  }
}

/**
 * 3. Get video details by ID
 */
async function getVideoDetails(videoId: string): Promise<YouTubeVideo | null> {
  if (!YOUTUBE_API_KEY) return null;

  try {
    const response = await fetch(
      `${YOUTUBE_API_BASE}/videos?` +
        new URLSearchParams({
          part: 'snippet,statistics,contentDetails',
          id: videoId,
          key: YOUTUBE_API_KEY,
        })
    );

    if (!response.ok) throw new Error(`YouTube API error: ${response.statusText}`);

    const data = await response.json();
    
    if (!data.items || data.items.length === 0) return null;

    const item = data.items[0];
    return {
      id: item.id,
      title: item.snippet.title,
      channelTitle: item.snippet.channelTitle,
      viewCount: item.statistics.viewCount,
      thumbnail: item.snippet.thumbnails.high.url,
      likeCount: item.statistics.likeCount,
      commentCount: item.statistics.commentCount,
      duration: formatDuration(item.contentDetails.duration),
      publishedAt: item.snippet.publishedAt,
      description: item.snippet.description,
      tags: item.snippet.tags || [],
      categoryId: item.snippet.categoryId,
    };
  } catch (error) {
    console.error('Error getting video details:', error);
    return null;
  }
}

/**
 * 4. Search for channels
 */
async function searchChannelByName(channelName: string): Promise<YouTubeChannel | null> {
  if (!YOUTUBE_API_KEY) return null;

  try {
    const searchResponse = await fetch(
      `${YOUTUBE_API_BASE}/search?` +
        new URLSearchParams({
          part: 'snippet',
          q: channelName,
          type: 'channel',
          maxResults: '1',
          key: YOUTUBE_API_KEY,
        })
    );

    if (!searchResponse.ok) throw new Error(`YouTube API error: ${searchResponse.statusText}`);

    const searchData = await searchResponse.json();
    
    if (!searchData.items || searchData.items.length === 0) return null;

    const channelId = searchData.items[0].id.channelId;

    const channelResponse = await fetch(
      `${YOUTUBE_API_BASE}/channels?` +
        new URLSearchParams({
          part: 'snippet,statistics',
          id: channelId,
          key: YOUTUBE_API_KEY,
        })
    );

    if (!channelResponse.ok) throw new Error(`YouTube API error: ${channelResponse.statusText}`);

    const channelData = await channelResponse.json();
    
    if (!channelData.items || channelData.items.length === 0) return null;

    const channel = channelData.items[0];
    return {
      id: channel.id,
      title: channel.snippet.title,
      subscriberCount: channel.statistics.subscriberCount,
      viewCount: channel.statistics.viewCount,
      videoCount: channel.statistics.videoCount,
      description: channel.snippet.description,
      customUrl: channel.snippet.customUrl,
      publishedAt: channel.snippet.publishedAt,
      country: channel.snippet.country,
    };
  } catch (error) {
    console.error('Error searching for channel:', error);
    return null;
  }
}

/**
 * 5. Get channel's recent videos
 */
async function getChannelVideos(
  channelId: string,
  maxResults: number = 10
): Promise<YouTubeVideo[]> {
  if (!YOUTUBE_API_KEY) return [];

  try {
    const searchResponse = await fetch(
      `${YOUTUBE_API_BASE}/search?` +
        new URLSearchParams({
          part: 'snippet',
          channelId: channelId,
          type: 'video',
          order: 'date',
          maxResults: maxResults.toString(),
          key: YOUTUBE_API_KEY,
        })
    );

    if (!searchResponse.ok) throw new Error(`YouTube API error: ${searchResponse.statusText}`);

    const searchData = await searchResponse.json();
    
    if (!searchData.items || searchData.items.length === 0) return [];

    const videoIds = searchData.items.map((item: any) => item.id.videoId).join(',');
    const statsResponse = await fetch(
      `${YOUTUBE_API_BASE}/videos?` +
        new URLSearchParams({
          part: 'snippet,statistics,contentDetails',
          id: videoIds,
          key: YOUTUBE_API_KEY,
        })
    );

    if (!statsResponse.ok) throw new Error(`YouTube API error: ${statsResponse.statusText}`);

    const statsData = await statsResponse.json();
    
    return statsData.items.map((item: any) => ({
      id: item.id,
      title: item.snippet.title,
      channelTitle: item.snippet.channelTitle,
      viewCount: item.statistics.viewCount,
      thumbnail: item.snippet.thumbnails.medium.url,
      likeCount: item.statistics.likeCount,
      commentCount: item.statistics.commentCount,
      duration: formatDuration(item.contentDetails.duration),
      publishedAt: item.snippet.publishedAt,
    }));
  } catch (error) {
    console.error('Error getting channel videos:', error);
    return [];
  }
}

/**
 * 6. Get video comments
 */
async function getVideoComments(
  videoId: string,
  maxResults: number = 20
): Promise<YouTubeComment[]> {
  if (!YOUTUBE_API_KEY) return [];

  try {
    const response = await fetch(
      `${YOUTUBE_API_BASE}/commentThreads?` +
        new URLSearchParams({
          part: 'snippet',
          videoId: videoId,
          maxResults: maxResults.toString(),
          order: 'relevance',
          key: YOUTUBE_API_KEY,
        })
    );

    if (!response.ok) {
      if (response.status === 403) {
        console.warn('Comments are disabled for this video');
        return [];
      }
      throw new Error(`YouTube API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    return data.items.map((item: any) => ({
      id: item.id,
      author: item.snippet.topLevelComment.snippet.authorDisplayName,
      text: item.snippet.topLevelComment.snippet.textDisplay,
      likeCount: item.snippet.topLevelComment.snippet.likeCount,
      publishedAt: item.snippet.topLevelComment.snippet.publishedAt,
    }));
  } catch (error) {
    console.error('Error getting comments:', error);
    return [];
  }
}

/**
 * 7. Search for popular Kenyan channels
 */
async function getPopularKenyanChannels(maxResults: number = 20): Promise<YouTubeChannel[]> {
  if (!YOUTUBE_API_KEY) return [];

  try {
    const searchResponse = await fetch(
      `${YOUTUBE_API_BASE}/search?` +
        new URLSearchParams({
          part: 'snippet',
          q: 'Kenya',
          type: 'channel',
          regionCode: 'KE',
          maxResults: maxResults.toString(),
          order: 'relevance',
          key: YOUTUBE_API_KEY,
        })
    );

    if (!searchResponse.ok) throw new Error(`YouTube API error: ${searchResponse.statusText}`);

    const searchData = await searchResponse.json();
    
    if (!searchData.items || searchData.items.length === 0) return [];

    const channelIds = searchData.items.map((item: any) => item.id.channelId).join(',');

    const channelResponse = await fetch(
      `${YOUTUBE_API_BASE}/channels?` +
        new URLSearchParams({
          part: 'snippet,statistics',
          id: channelIds,
          key: YOUTUBE_API_KEY,
        })
    );

    if (!channelResponse.ok) throw new Error(`YouTube API error: ${channelResponse.statusText}`);

    const channelData = await channelResponse.json();
    
    return channelData.items
      .sort((a: any, b: any) => 
        parseInt(b.statistics.subscriberCount) - parseInt(a.statistics.subscriberCount)
      )
      .map((item: any) => ({
        id: item.id,
        title: item.snippet.title,
        subscriberCount: item.statistics.subscriberCount,
        viewCount: item.statistics.viewCount,
        videoCount: item.statistics.videoCount,
        description: item.snippet.description,
      }));
  } catch (error) {
    console.error('Error fetching popular channels:', error);
    return [];
  }
}

/**
 * 8. Search for music videos
 */
async function searchKenyanMusic(genre?: string, maxResults: number = 10): Promise<YouTubeVideo[]> {
  if (!YOUTUBE_API_KEY) return [];

  try {
    const query = genre ? `${genre} music Kenya` : 'Kenyan music';
    
    const searchResponse = await fetch(
      `${YOUTUBE_API_BASE}/search?` +
        new URLSearchParams({
          part: 'snippet',
          q: query,
          type: 'video',
          videoCategoryId: '10', // Music category
          regionCode: 'KE',
          maxResults: maxResults.toString(),
          order: 'viewCount',
          key: YOUTUBE_API_KEY,
        })
    );

    if (!searchResponse.ok) throw new Error(`YouTube API error: ${searchResponse.statusText}`);

    const searchData = await searchResponse.json();
    
    if (!searchData.items || searchData.items.length === 0) return [];

    const videoIds = searchData.items.map((item: any) => item.id.videoId).join(',');
    const statsResponse = await fetch(
      `${YOUTUBE_API_BASE}/videos?` +
        new URLSearchParams({
          part: 'snippet,statistics,contentDetails',
          id: videoIds,
          key: YOUTUBE_API_KEY,
        })
    );

    if (!statsResponse.ok) throw new Error(`YouTube API error: ${statsResponse.statusText}`);

    const statsData = await statsResponse.json();
    
    return statsData.items.map((item: any) => ({
      id: item.id,
      title: item.snippet.title,
      channelTitle: item.snippet.channelTitle,
      viewCount: item.statistics.viewCount,
      thumbnail: item.snippet.thumbnails.medium.url,
      likeCount: item.statistics.likeCount,
      duration: formatDuration(item.contentDetails.duration),
      publishedAt: item.snippet.publishedAt,
    }));
  } catch (error) {
    console.error('Error searching music:', error);
    return [];
  }
}

/**
 * 9. Compare multiple channels
 */
async function compareChannels(channelIds: string[]): Promise<any> {
  if (!YOUTUBE_API_KEY) return null;

  try {
    const response = await fetch(
      `${YOUTUBE_API_BASE}/channels?` +
        new URLSearchParams({
          part: 'snippet,statistics',
          id: channelIds.join(','),
          key: YOUTUBE_API_KEY,
        })
    );

    if (!response.ok) throw new Error(`YouTube API error: ${response.statusText}`);

    const data = await response.json();
    
    return {
      channels: data.items.map((item: any) => ({
        name: item.snippet.title,
        subscribers: formatCount(item.statistics.subscriberCount),
        subscriberCount: parseInt(item.statistics.subscriberCount),
        views: formatCount(item.statistics.viewCount),
        videos: item.statistics.videoCount,
      })),
      winner: data.items.reduce((prev: any, current: any) => 
        (parseInt(current.statistics.subscriberCount) > parseInt(prev.statistics.subscriberCount)) 
          ? current 
          : prev
      ).snippet.title,
    };
  } catch (error) {
    console.error('Error comparing channels:', error);
    return null;
  }
}

/**
 * 10. Get trending by category
 */
async function getTrendingByCategory(categoryId: string, maxResults: number = 10): Promise<YouTubeVideo[]> {
  if (!YOUTUBE_API_KEY) return [];

  try {
    const response = await fetch(
      `${YOUTUBE_API_BASE}/videos?` +
        new URLSearchParams({
          part: 'snippet,statistics,contentDetails',
          chart: 'mostPopular',
          regionCode: 'KE',
          videoCategoryId: categoryId,
          maxResults: maxResults.toString(),
          key: YOUTUBE_API_KEY,
        })
    );

    if (!response.ok) throw new Error(`YouTube API error: ${response.statusText}`);

    const data = await response.json();
    
    return data.items.map((item: any) => ({
      id: item.id,
      title: item.snippet.title,
      channelTitle: item.snippet.channelTitle,
      viewCount: item.statistics.viewCount,
      thumbnail: item.snippet.thumbnails.medium.url,
      likeCount: item.statistics.likeCount,
      duration: formatDuration(item.contentDetails.duration),
      publishedAt: item.snippet.publishedAt,
    }));
  } catch (error) {
    console.error('Error getting trending by category:', error);
    return [];
  }
}

/**
 * Main function to get YouTube statistics based on user query
 */
export async function getYoutubeStatistics(query: string): Promise<string> {
  console.log(`Fetching YouTube statistics for query: "${query}"`);

  if (!YOUTUBE_API_KEY) {
    return JSON.stringify({
      error: 'YouTube API key not configured',
      message: 'Please add YOUTUBE_API_KEY to your .env file.',
    }, null, 2);
  }

  try {
    const queryLower = query.toLowerCase();

    // Handle specific video/song queries (e.g., "beba by watendawili", "views for X")
    if (queryLower.includes('views') || queryLower.includes('how many') || queryLower.includes('by ')) {
      // Extract song/video name and artist
      let searchTerm = query
        .replace(/how many views (does|do|has|for)/gi, '')
        .replace(/views/gi, '')
        .replace(/have|has|get|show me/gi, '')
        .trim();

      // Add "Kenya" to ensure Kenyan results
      if (!searchTerm.toLowerCase().includes('kenya')) {
        searchTerm += ' Kenya';
      }

      // Search for the specific video
      const videos = await searchVideosByKeyword(searchTerm, 5, 'relevance');
      
      if (videos.length > 0) {
        const topVideo = videos[0];
        return JSON.stringify({
          videoInfo: {
            title: topVideo.title,
            channel: topVideo.channelTitle,
            views: formatCount(topVideo.viewCount),
            viewsRaw: topVideo.viewCount,
            likes: formatCount(topVideo.likeCount || '0'),
            comments: formatCount(topVideo.commentCount || '0'),
            duration: topVideo.duration,
            publishedAt: topVideo.publishedAt,
          },
          otherResults: videos.slice(1, 4).map(v => ({
            title: v.title,
            channel: v.channelTitle,
            views: formatCount(v.viewCount),
          })),
          dataSource: 'YouTube Data API v3 (Real-time)',
          searchTerm,
          query,
        }, null, 2);
      } else {
        // If no results, search without "Kenya" filter
        const fallbackVideos = await searchVideosByKeyword(
          query.replace(/how many views (does|do|has|for)/gi, '').replace(/views/gi, '').trim(),
          5,
          'relevance'
        );
        if (fallbackVideos.length > 0) {
          const topVideo = fallbackVideos[0];
          return JSON.stringify({
            videoInfo: {
              title: topVideo.title,
              channel: topVideo.channelTitle,
              views: formatCount(topVideo.viewCount),
              viewsRaw: topVideo.viewCount,
              likes: formatCount(topVideo.likeCount || '0'),
              comments: formatCount(topVideo.commentCount || '0'),
              duration: topVideo.duration,
              publishedAt: topVideo.publishedAt,
            },
            note: 'Result may not be from Kenya',
            dataSource: 'YouTube Data API v3 (Real-time)',
            query,
          }, null, 2);
        }
      }
    }

    // Handle compare queries
    if (queryLower.includes('compare') || queryLower.includes('vs')) {
      const channelNames = query
        .replace(/compare|vs|versus|and|channels?/gi, '')
        .split(/[,\s]+/)
        .filter(n => n.length > 2);

      if (channelNames.length >= 2) {
        const channels = await Promise.all(
          channelNames.map(name => searchChannelByName(name))
        );
        const validChannels = channels.filter(c => c !== null) as YouTubeChannel[];
        
        if (validChannels.length >= 2) {
          const comparison = await compareChannels(validChannels.map(c => c.id));
          return JSON.stringify({
            comparison,
            dataSource: 'YouTube Data API v3 (Real-time)',
            query,
          }, null, 2);
        }
      }
    }

    // Handle comment queries
    if (queryLower.includes('comment')) {
      const videoIdMatch = query.match(/[a-zA-Z0-9_-]{11}/);
      if (videoIdMatch) {
        const comments = await getVideoComments(videoIdMatch[0], 20);
        return JSON.stringify({
          comments: comments.slice(0, 10).map(c => ({
            author: c.author,
            text: c.text.substring(0, 200),
            likes: formatCount(c.likeCount),
          })),
          totalComments: comments.length,
          dataSource: 'YouTube Data API v3 (Real-time)',
          query,
        }, null, 2);
      }
    }

    // Handle category-based trending
    const categoryMap: { [key: string]: string } = {
      'comedy': '23',
      'gaming': '20',
      'music': '10',
      'news': '25',
      'sports': '17',
      'entertainment': '24',
      'education': '27',
    };

    for (const [key, categoryId] of Object.entries(categoryMap)) {
      if (queryLower.includes(key)) {
        const videos = await getTrendingByCategory(categoryId, 10);
        return JSON.stringify({
          category: key,
          trendingVideos: videos.slice(0, 5).map(v => ({
            title: v.title,
            channel: v.channelTitle,
            views: formatCount(v.viewCount),
            duration: v.duration,
          })),
          dataSource: 'YouTube Data API v3 (Real-time)',
          query,
        }, null, 2);
      }
    }

    // Handle music genre queries
    if (queryLower.includes('music')) {
      const genres = ['gospel', 'hip hop', 'reggae', 'gengetone', 'afrobeat'];
      const matchedGenre = genres.find(g => queryLower.includes(g));
      const musicVideos = await searchKenyanMusic(matchedGenre, 10);
      
      return JSON.stringify({
        musicTrends: {
          genre: matchedGenre || 'general',
          topVideos: musicVideos.slice(0, 5).map(v => ({
            title: v.title,
            channel: v.channelTitle,
            views: formatCount(v.viewCount),
            duration: v.duration,
          })),
        },
        dataSource: 'YouTube Data API v3 (Real-time)',
        query,
      }, null, 2);
    }

    // Handle channel queries
    if (queryLower.includes('channel') || queryLower.includes('subscriber')) {
      let channelName = query
        .replace(/how many (views|subscribers|videos) (does|do|has)/gi, '')
        .replace(/channel/gi, '')
        .replace(/have|has|get|show me|about/gi, '')
        .trim();

      const channelData = await searchChannelByName(channelName);
      
      if (channelData) {
        const recentVideos = await getChannelVideos(channelData.id, 5);
        
        return JSON.stringify({
          channelInfo: {
            name: channelData.title,
            id: channelData.id,
            subscribers: formatCount(channelData.subscriberCount),
            totalViews: formatCount(channelData.viewCount || '0'),
            videoCount: channelData.videoCount,
            description: channelData.description?.substring(0, 200),
          },
          recentVideos: recentVideos.map(v => ({
            title: v.title,
            views: formatCount(v.viewCount),
            duration: v.duration,
          })),
          dataSource: 'YouTube Data API v3 (Real-time)',
          query,
        }, null, 2);
      }
    }

    // Default: General trending data (avoiding quota-heavy channel search)
    const [trendingVideos, musicVideos] = await Promise.all([
      getTrendingVideos(10),
      searchKenyanMusic(undefined, 5),
    ]);

    // If both failed due to API issues, return a helpful message
    if (trendingVideos.length === 0 && musicVideos.length === 0) {
      return JSON.stringify({
        message: 'YouTube API quota reached or access restricted. Try searching for specific content instead.',
        suggestion: 'Search for specific Kenyan artists, songs, or channels to get results.',
        dataSource: 'YouTube Data API v3',
        regionCode: 'KE (Kenya)',
        query,
      }, null, 2);
    }

    const result: any = {
      dataSource: 'YouTube Data API v3 (Real-time)',
      regionCode: 'KE (Kenya)',
      query,
    };

    // Add trending videos if available
    if (trendingVideos.length > 0) {
      result.trendingVideos = trendingVideos.slice(0, 5).map(v => ({
        id: v.id,
        title: v.title,
        channel: v.channelTitle,
        views: formatCount(v.viewCount),
        likes: formatCount(v.likeCount || '0'),
        duration: v.duration,
      }));
    }

    // Add music trends if available
    if (musicVideos.length > 0) {
      result.musicTrends = {
        topVideos: musicVideos.slice(0, 3).map(v => ({
          title: v.title,
          channel: v.channelTitle,
          views: formatCount(v.viewCount),
        })),
      };
    }

    // Add viewership stats
    result.viewershipStats = {
      totalTrendingViews: trendingVideos.length > 0 
        ? formatCount(trendingVideos.reduce((sum, v) => sum + parseInt(v.viewCount, 10), 0))
        : '0',
      trendingVideosCount: trendingVideos.length,
      musicVideosFound: musicVideos.length,
    };

    return JSON.stringify(result, null, 2);
  } catch (error) {
    console.error('Error fetching YouTube statistics:', error);
    return JSON.stringify({
      error: 'Failed to fetch YouTube data',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      suggestion: 'The YouTube API may have rate limits or quota restrictions. Try searching for specific content or try again later.',
      dataSource: 'YouTube Data API v3',
    }, null, 2);
  }
}