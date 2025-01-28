import { FC } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import { Copy } from 'lucide-react';
import { useToast } from '../ui/use-toast';

interface ChatMessageProps {
  content: string;
  role: 'user' | 'assistant';
  timestamp: string;
}

export const ChatMessage: FC<ChatMessageProps> = ({ content, role, timestamp }) => {
  const { toast } = useToast();

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

  return (
    <div
      className={cn(
        'flex flex-col space-y-2 p-4 rounded-lg',
        role === 'user'
          ? 'bg-primary text-primary-foreground ml-12'
          : 'bg-muted mr-12'
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">
          {role === 'user' ? 'You' : 'Assistant'}
        </span>
        <span className="text-xs opacity-70">
          {new Date(timestamp).toLocaleTimeString()}
        </span>
      </div>
      <div className="prose prose-sm dark:prose-invert max-w-none">
        <ReactMarkdown
          components={{
            code({ node, inline, className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || '');
              const code = String(children).replace(/\n$/, '');

              if (!inline && match) {
                return (
                  <div className="relative group">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => copyToClipboard(code)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <SyntaxHighlighter
                      {...props}
                      style={vscDarkPlus}
                      language={match[1]}
                      PreTag="div"
                      customStyle={{
                        margin: 0,
                        borderRadius: '0.375rem',
                      }}
                    >
                      {code}
                    </SyntaxHighlighter>
                  </div>
                );
              }
              return (
                <code className={cn('bg-muted px-1.5 py-0.5 rounded-md', className)} {...props}>
                  {children}
                </code>
              );
            },
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
};
