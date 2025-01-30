import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ScrollArea } from '../ui/scroll-area';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { ChevronRight, ChevronDown, Folder, File, Search } from 'lucide-react';

interface FileNode {
  path: string;
  type: 'file' | 'directory';
  size: number;
  language?: string;
  lastModified: string;
  children?: FileNode[];
}

interface RepoStructureProps {
  structure: FileNode[];
}

export function RepoStructure({ structure }: RepoStructureProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());

  const togglePath = (path: string) => {
    const newExpanded = new Set(expandedPaths);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedPaths(newExpanded);
  };

  const formatSize = (bytes: number) => {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  const renderNode = (node: FileNode, depth: number = 0) => {
    const isExpanded = expandedPaths.has(node.path);
    const isMatchingSearch = node.path.toLowerCase().includes(searchQuery.toLowerCase());
    const hasMatchingChildren = node.children?.some(child => 
      child.path.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (searchQuery && !isMatchingSearch && !hasMatchingChildren) {
      return null;
    }

    return (
      <div key={node.path}>
        <div
          className={`
            flex items-center gap-2 px-2 py-1 rounded-md hover:bg-accent
            ${depth > 0 ? 'ml-6' : ''}
            ${isMatchingSearch ? 'bg-accent/50' : ''}
          `}
        >
          {node.type === 'directory' ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5"
              onClick={() => togglePath(node.path)}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          ) : (
            <div className="w-5" />
          )}
          {node.type === 'directory' ? (
            <Folder className="h-4 w-4 text-blue-500" />
          ) : (
            <File className="h-4 w-4 text-gray-500" />
          )}
          <span className="flex-1 text-sm">
            {node.path.split('/').pop()}
          </span>
          {node.type === 'file' && (
            <>
              {node.language && (
                <span className="text-xs text-muted-foreground px-2 py-0.5 rounded-full bg-accent">
                  {node.language}
                </span>
              )}
              <span className="text-xs text-muted-foreground">
                {formatSize(node.size)}
              </span>
            </>
          )}
        </div>
        {node.type === 'directory' && isExpanded && node.children && (
          <div className="mt-1">
            {node.children.map(child => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Repository Structure</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-1">
              {structure.map(node => renderNode(node))}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}
