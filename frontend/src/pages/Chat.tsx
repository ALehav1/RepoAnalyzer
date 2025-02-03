import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { useToast } from '../components/ui/use-toast';
import { Loader2, Send, ChevronDown } from 'lucide-react';
import { createChatMessage, getChatHistory } from '../api/client';
import type { ChatMessage } from '../api/types';
import { RepoSelector } from '../components/chat/RepoSelector';
import { ScrollArea } from '../components/ui/scroll-area';

interface Repo {
  repo_url: string;
  last_analyzed: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export default function Chat() {
  const [searchParams] = useSearchParams();
  const [allRepos, setAllRepos] = useState<Repo[]>([]);
  const [selectedRepos, setSelectedRepos] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showRepoSelector, setShowRepoSelector] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchRepos() {
      try {
        const data = await getChatHistory(selectedRepos[0]);
        setAllRepos(data.repos || []);
        
        // Handle repo from URL parameter
        const urlRepo = searchParams.get('repo');
        if (urlRepo) {
          setSelectedRepos([urlRepo]);
          setShowRepoSelector(false);
        } else {
          // By default, select all repos
          setSelectedRepos(data.repos.map((r: Repo) => r.repo_url));
        }
      } catch (e) {
        toast({
          title: 'Error',
          description: e instanceof Error ? e.message : 'Failed to fetch repos',
          variant: 'destructive',
        });
      }
    }
    fetchRepos();

    // Load chat history from localStorage
    const savedMessages = localStorage.getItem('chatHistory');
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    }
  }, [searchParams]);

  useEffect(() => {
    // Save messages to localStorage whenever they change
    localStorage.setItem('chatHistory', JSON.stringify(messages));
    // Scroll to bottom
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (selectedRepos.length === 0) {
      toast({
        title: 'Error',
        description: 'Please select at least one repository',
        variant: 'destructive',
      });
      return;
    }

    if (!query.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a question',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    const userMessage: Message = {
      role: 'user',
      content: query,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMessage]);
    setQuery('');

    try {
      const response = await createChatMessage(selectedRepos[0], query);
      const assistantMessage: Message = {
        role: 'assistant',
        content: response.response,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (e) {
      toast({
        title: 'Error',
        description: e instanceof Error ? e.message : 'Failed to get answer',
        variant: 'destructive',
      });
      // Remove the user message if the request failed
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  }

  function toggleRepoSelection(repoUrl: string) {
    setSelectedRepos(prev =>
      prev.includes(repoUrl)
        ? prev.filter(r => r !== repoUrl)
        : [...prev, repoUrl]
    );
  }

  function handleSelectAll() {
    const filteredRepos = allRepos
      .filter(repo => repo.repo_url.toLowerCase().includes(searchQuery.toLowerCase()))
      .map(repo => repo.repo_url);
    setSelectedRepos(filteredRepos);
  }

  function handleDeselectAll() {
    setSelectedRepos([]);
  }

  function clearHistory() {
    if (confirm('Are you sure you want to clear the chat history? This cannot be undone.')) {
      setMessages([]);
      localStorage.removeItem('chatHistory');
    }
  }

  return (
    <div className="container mx-auto p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Repo Selection */}
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-semibold">Repositories</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowRepoSelector(!showRepoSelector)}
              >
                <ChevronDown className={`h-4 w-4 transition-transform ${
                  showRepoSelector ? 'transform rotate-180' : ''
                }`} />
              </Button>
            </CardHeader>
            <CardContent>
              {showRepoSelector && (
                <RepoSelector
                  repos={allRepos}
                  selectedRepos={selectedRepos}
                  onToggleRepo={toggleRepoSelection}
                  onSelectAll={handleSelectAll}
                  onDeselectAll={handleDeselectAll}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                />
              )}
              <div className="mt-2 text-sm text-muted-foreground">
                {selectedRepos.length} repositories selected
              </div>
            </CardContent>
          </Card>

          {messages.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Chat History</CardTitle>
                <CardDescription>
                  Your chat history is saved locally
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={clearHistory}
                  className="w-full"
                >
                  Clear History
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Chat Interface */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Chat with Your Repositories</CardTitle>
            <CardDescription>
              Ask questions about {selectedRepos.length} selected repositories
            </CardDescription>
          </CardHeader>
          <CardContent>
            {messages.length > 0 ? (
              <ScrollArea className="h-[500px] pr-4 mb-4">
                <div className="space-y-4">
                  {messages.map((message, index) => (
                    <div key={index} className="space-y-2">
                      <div className="bg-muted p-3 rounded-lg">
                        <p className="font-medium">{message.role === 'user' ? 'You' : 'AI'}</p>
                        <p>{message.content}</p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p className="mb-2">No messages yet</p>
                <p className="text-sm">
                  Start by asking a question about your repositories
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="relative mt-4">
              <Textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask a question about the selected repositories..."
                className="min-h-[100px] pr-24"
                disabled={isLoading}
              />
              <Button 
                type="submit" 
                disabled={isLoading || selectedRepos.length === 0 || !query.trim()}
                className="absolute right-2 bottom-2"
                size="sm"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Thinking
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
