import { FC } from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { Search, CheckSquare, Square } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';

interface Repo {
  repo_url: string;
  last_analyzed: string;
}

interface RepoSelectorProps {
  repos: Repo[];
  selectedRepos: string[];
  onToggleRepo: (repoUrl: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const RepoSelector: FC<RepoSelectorProps> = ({
  repos,
  selectedRepos,
  onToggleRepo,
  onSelectAll,
  onDeselectAll,
  searchQuery,
  onSearchChange,
}) => {
  const filteredRepos = repos.filter(repo =>
    repo.repo_url.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const allSelected = filteredRepos.length > 0 && 
    filteredRepos.every(repo => selectedRepos.includes(repo.repo_url));

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={allSelected ? onDeselectAll : onSelectAll}
          className="flex-shrink-0"
        >
          {allSelected ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
        </Button>
        <div className="relative flex-grow">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search repositories..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <ScrollArea className="h-[400px] pr-4">
        <div className="space-y-2">
          {filteredRepos.map((repo) => (
            <div key={repo.repo_url} className="flex items-start space-x-2">
              <Checkbox
                id={repo.repo_url}
                checked={selectedRepos.includes(repo.repo_url)}
                onCheckedChange={() => onToggleRepo(repo.repo_url)}
              />
              <label
                htmlFor={repo.repo_url}
                className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                <div className="font-medium">
                  {repo.repo_url.split('github.com/')[1] || repo.repo_url}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Last analyzed: {new Date(repo.last_analyzed).toLocaleDateString()}
                </div>
              </label>
            </div>
          ))}

          {filteredRepos.length === 0 && (
            <div className="text-center py-4 text-sm text-muted-foreground">
              No repositories match your search
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
