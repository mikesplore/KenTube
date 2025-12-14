export async function getYoutubeStatistics(query: string): Promise<string> {
  console.log(`Mocking YouTube statistics for query: "${query}"`);

  const mockData = {
    trendingVideos: [
      { id: 'v1', title: 'Sauti Sol - "Midnight Train" (Official Video)', channel: 'Sauti Sol', views: '1.2M', imageId: 'trending-video-1' },
      { id: 'v2', title: 'Top 5 Places to Visit in Nairobi', channel: 'Kenya Travel Vlogs', views: '800K', imageId: 'trending-video-2' },
      { id: 'v3', title: 'Hilarious Kenyan Skit Compilation', channel: 'Crazy Kennar', views: '2.5M', imageId: 'trending-video-3' },
    ],
    topChannels: [
      { id: 'c1', name: 'Churchill Show', subscribers: '2.1M' },
      { id: 'c2', name: 'Njugush', subscribers: '1.5M' },
      { id: 'c3', name: 'Wabosha Maxine', subscribers: '850K' },
    ],
    musicTrends: {
      topGenre: 'Genge',
      risingArtist: "Nikita Kering'",
    },
    viewershipStats: {
      totalViewsLastMonth: '150M',
      averageViewDuration: '4:32',
      totalLikesLastMonth: '12.3M',
      totalCommentsLastMonth: '1.1M',
    },
  };

  await new Promise(resolve => setTimeout(resolve, 1000));

  return JSON.stringify(mockData, null, 2);
}
