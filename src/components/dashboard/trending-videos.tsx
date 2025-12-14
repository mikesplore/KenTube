import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, TrendingUp, Youtube } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const trendingVideos = [
  { id: 'v1', title: 'Sauti Sol - "Midnight Train"', channel: 'Sauti Sol', views: '1.2M', imageId: 'trending-video-1' },
  { id: 'v2', title: 'Top 5 Places to Visit in Nairobi', channel: 'Kenya Travel Vlogs', views: '800K', imageId: 'trending-video-2' },
  { id: 'v3', title: 'Hilarious Kenyan Skit Compilation', channel: 'Crazy Kennar', views: '2.5M', imageId: 'trending-video-3' },
];

export default function TrendingVideos() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <TrendingUp className="text-primary" />
            <span>Trending Videos</span>
        </CardTitle>
        <CardDescription>Top performing videos in Kenya right now.</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {trendingVideos.map((video) => {
            const image = PlaceHolderImages.find(p => p.id === video.imageId);
            return (
              <li key={video.id} className="flex items-center gap-4">
                <div className="relative w-32 h-20 rounded-md overflow-hidden">
                  {image ? (
                     <Image
                      src={image.imageUrl}
                      alt={image.description}
                      width={128}
                      height={80}
                      className="object-cover"
                      data-ai-hint={image.imageHint}
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                        <Youtube className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-sm leading-tight">{video.title}</h3>
                  <p className="text-xs text-muted-foreground">{video.channel}</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                    <Eye size={12} />
                    <span>{video.views}</span>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
