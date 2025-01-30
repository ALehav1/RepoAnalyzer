import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ScrollArea } from '../ui/scroll-area';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Search, Copy, Check } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface FileContent {
  path: string;
  content: string;
  language: string;
  size: number;
}

interface CodeViewerProps {
  files: FileContent[];
  onFileSelect?: (path: string) => void;
}

export function CodeViewer({ files, onFileSelect }: CodeViewerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFile, setSelectedFile] = useState<FileContent | null>(null);
  const [copied, setCopied] = useState(false);

  const filteredFiles = files.filter(file =>
    file.path.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFileSelect = (file: FileContent) => {
    setSelectedFile(file);
    onFileSelect?.(file.path);
  };

  const handleCopy = async () => {
    if (selectedFile) {
      await navigator.clipboard.writeText(selectedFile.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* File List */}
      <Card className="md:col-span-1">
        <CardHeader>
          <CardTitle>Files</CardTitle>
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
            <ScrollArea className="h-[600px]">
              <div className="space-y-1">
                {filteredFiles.map((file) => (
                  <Button
                    key={file.path}
                    variant={selectedFile?.path === file.path ? 'secondary' : 'ghost'}
                    className="w-full justify-start text-sm"
                    onClick={() => handleFileSelect(file)}
                  >
                    <span className="truncate">{file.path}</span>
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </div>
        </CardContent>
      </Card>

      {/* Code View */}
      <Card className="md:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>
            {selectedFile ? selectedFile.path.split('/').pop() : 'Select a file'}
          </CardTitle>
          {selectedFile && (
            <Button
              variant="outline"
              size="icon"
              onClick={handleCopy}
              className="h-8 w-8"
            >
              {copied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] w-full">
            {selectedFile ? (
              <SyntaxHighlighter
                language={selectedFile.language.toLowerCase()}
                style={oneDark}
                customStyle={{
                  margin: 0,
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                }}
                showLineNumbers
              >
                {selectedFile.content}
              </SyntaxHighlighter>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Select a file to view its contents
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
