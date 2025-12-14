import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Search, Upload } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function AppHeader() {
  return (
    <header className="sticky top-0 z-10 flex items-center h-16 px-4 bg-card border-b gap-4">
      <SidebarTrigger className="md:hidden" />
      <div className="hidden md:block w-full max-w-xs relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search channels, videos..."
          className="pl-8 bg-background"
        />
      </div>
      <div className="flex items-center gap-4 ml-auto">
        <Button variant="outline" size="sm">
            <Upload className="mr-2 h-4 w-4" />
            Submit Video
        </Button>
      </div>
    </header>
  );
}
