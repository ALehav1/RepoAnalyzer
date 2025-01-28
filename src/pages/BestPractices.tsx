import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { useToast } from '../components/ui/use-toast';
import { Loader2, Copy, Search, Tag, Filter, Share2, Bookmark } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { ScrollArea } from '../components/ui/scroll-area';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';

interface BestPractice {
  id: string;
  repo_url: string;
  chunk_text: string;
  best_practice_reason: string;
  generalization_potential: boolean;
  generalization_ideas: string;
  tags: string[];
  bookmarked?: boolean;
}

interface FilterState {
  hasGeneralization: boolean;
  isBookmarked: boolean;
  selectedTags: string[];
}

export default function BestPractices() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [practices, setPractices] = useState<BestPractice[]>([]);
  const [filteredPractices, setFilteredPractices] = useState<BestPractice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    hasGeneralization: false,
    isBookmarked: false,
    selectedTags: [],
  });
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchPractices() {
      try {
        const res = await fetch('http://localhost:8001/api/best-practices');
        if (!res.ok) {
          throw new Error(`Server error: ${res.status}`);
        }
        const data = await res.json();
        
        // Get repo from URL if present
        const urlRepo = searchParams.get('repo');
        let practices = data.practices || [];
        
        if (urlRepo) {
          practices = practices.filter((p: BestPractice) => p.repo_url === urlRepo);
        }

        // Add bookmarked state from localStorage
        const bookmarked = JSON.parse(localStorage.getItem('bookmarkedPractices') || '[]');
        practices = practices.map((p: BestPractice) => ({
          ...p,
          bookmarked: bookmarked.includes(p.id),
          tags: p.tags || ['general'], // Ensure tags exist
        }));

        setPractices(practices);
        
        // Extract unique tags
        const tags = Array.from(new Set(practices.flatMap(p => p.tags)));
        setAvailableTags(tags);

      } catch (e) {
        toast({
          title: 'Error',
          description: e instanceof Error ? e.message : 'Failed to fetch best practices',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    }
    fetchPractices();
  }, [searchParams]);

  useEffect(() => {
    let filtered = [...practices];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.chunk_text.toLowerCase().includes(query) ||
          p.best_practice_reason.toLowerCase().includes(query) ||
          p.repo_url.toLowerCase().includes(query)
      );
    }

    // Apply other filters
    if (filters.hasGeneralization) {
      filtered = filtered.filter((p) => p.generalization_potential);
    }
    if (filters.isBookmarked) {
      filtered = filtered.filter((p) => p.bookmarked);
    }
    if (filters.selectedTags.length > 0) {
      filtered = filtered.filter((p) =>
        p.tags.some((tag) => filters.selectedTags.includes(tag))
      );
    }

    setFilteredPractices(filtered);
  }, [searchQuery, filters, practices]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: 'Copied to clipboard',
        description: 'The code has been copied to your clipboard.',
      });
    } catch (err) {
      toast({
        title: 'Failed to copy',
        description: 'Please try copying manually.',
        variant: 'destructive',
      });
    }
  };

  const toggleBookmark = (id: string) => {
    setPractices((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, bookmarked: !p.bookmarked } : p
      )
    );

    // Update localStorage
    const bookmarked = practices
      .filter((p) => (p.id === id ? !p.bookmarked : p.bookmarked))
      .map((p) => p.id);
    localStorage.setItem('bookmarkedPractices', JSON.stringify(bookmarked));
  };

  const sharePractice = async (practice: BestPractice) => {
    try {
      const shareData = {
        title: 'Best Practice from ' + practice.repo_url,
        text: `${practice.best_practice_reason}\n\nCode:\n${practice.chunk_text}`,
        url: window.location.href,
      };
      
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(
          `${shareData.title}\n\n${shareData.text}\n\n${shareData.url}`
        );
        toast({
          title: 'Copied to clipboard',
          description: 'Share link has been copied to your clipboard.',
        });
      }
    } catch (err) {
      toast({
        title: 'Failed to share',
        description: 'Please try sharing manually.',
        variant: 'destructive',
      });
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ctrl/Cmd + F for search
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        document.querySelector<HTMLInputElement>('#search-input')?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Best Practices Library</h1>
            <p className="text-muted-foreground">
              {filteredPractices.length} practices found
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="search-input"
                placeholder="Search practices..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 w-[200px]"
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuCheckboxItem
                  checked={filters.hasGeneralization}
                  onCheckedChange={(checked) =>
                    setFilters((prev) => ({ ...prev, hasGeneralization: checked }))
                  }
                >
                  Has Generalization
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={filters.isBookmarked}
                  onCheckedChange={(checked) =>
                    setFilters((prev) => ({ ...prev, isBookmarked: checked }))
                  }
                >
                  Bookmarked
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Tag className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {availableTags.map((tag) => (
                  <DropdownMenuCheckboxItem
                    key={tag}
                    checked={filters.selectedTags.includes(tag)}
                    onCheckedChange={(checked) =>
                      setFilters((prev) => ({
                        ...prev,
                        selectedTags: checked
                          ? [...prev.selectedTags, tag]
                          : prev.selectedTags.filter((t) => t !== tag),
                      }))
                    }
                  >
                    {tag}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {filteredPractices.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-6">
                <p className="text-muted-foreground">No practices found</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Try adjusting your search or filters
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <ScrollArea className="h-[calc(100vh-200px)]">
            <div className="space-y-6 pr-4">
              {filteredPractices.map((bp) => (
                <Card key={bp.id} className="relative group">
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">
                          From {bp.repo_url.split('/').pop()}
                        </h3>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleBookmark(bp.id)}
                          >
                            <Bookmark
                              className={`h-4 w-4 ${
                                bp.bookmarked ? 'fill-current' : ''
                              }`}
                            />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => sharePractice(bp)}
                          >
                            <Share2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="relative">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => copyToClipboard(bp.chunk_text)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <SyntaxHighlighter
                          language="typescript"
                          style={vscDarkPlus}
                          customStyle={{
                            margin: 0,
                            borderRadius: '0.375rem',
                          }}
                        >
                          {bp.chunk_text}
                        </SyntaxHighlighter>
                      </div>

                      <div>
                        <h4 className="font-semibold">Why this is a best practice:</h4>
                        <p className="mt-1 text-muted-foreground">
                          {bp.best_practice_reason}
                        </p>
                      </div>

                      {bp.generalization_potential && (
                        <div>
                          <h4 className="font-semibold">How to apply this elsewhere:</h4>
                          <p className="mt-1 text-muted-foreground">
                            {bp.generalization_ideas}
                          </p>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2">
                        {bp.tags.map((tag) => (
                          <Badge key={tag} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  );
}
