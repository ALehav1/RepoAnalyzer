import React, { useEffect, useRef } from 'react';
import Prism from 'prismjs';
import 'prismjs/themes/prism.css';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-yaml';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-go';
import 'prismjs/components/prism-rust';
import 'prismjs/components/prism-java';
import 'prismjs/plugins/line-numbers/prism-line-numbers';
import 'prismjs/plugins/line-numbers/prism-line-numbers.css';
import 'prismjs/plugins/line-highlight/prism-line-highlight';
import 'prismjs/plugins/line-highlight/prism-line-highlight.css';

interface CodeBlockProps {
  code: string;
  language: string;
  highlightLines?: number[];
  showLineNumbers?: boolean;
  maxHeight?: string;
  fileName?: string;
  onCopy?: () => void;
}

const languageMap: Record<string, string> = {
  'py': 'python',
  'js': 'javascript',
  'jsx': 'jsx',
  'ts': 'typescript',
  'tsx': 'tsx',
  'json': 'json',
  'yaml': 'yaml',
  'yml': 'yaml',
  'md': 'markdown',
  'sh': 'bash',
  'bash': 'bash',
  'go': 'go',
  'rs': 'rust',
  'java': 'java',
};

export function CodeBlock({
  code,
  language,
  highlightLines = [],
  showLineNumbers = true,
  maxHeight = '400px',
  fileName,
  onCopy
}: CodeBlockProps) {
  const codeRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (codeRef.current) {
      Prism.highlightElement(codeRef.current);
    }
  }, [code, language]);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    onCopy?.();
  };

  const mappedLanguage = languageMap[language.toLowerCase()] || 'plaintext';
  const dataLine = highlightLines.join(',');

  return (
    <div className="relative rounded-lg overflow-hidden bg-gray-900">
      {/* File name header */}
      {fileName && (
        <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
          <span className="text-sm text-gray-300">{fileName}</span>
          <button
            onClick={handleCopy}
            className="text-gray-400 hover:text-white transition-colors"
            title="Copy code"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
              />
            </svg>
          </button>
        </div>
      )}

      {/* Code content */}
      <div
        className="overflow-auto"
        style={{ maxHeight }}
      >
        <pre className={`${showLineNumbers ? 'line-numbers' : ''} m-0`}>
          <code
            ref={codeRef}
            className={`language-${mappedLanguage}`}
            data-line={dataLine}
          >
            {code.trim()}
          </code>
        </pre>
      </div>
    </div>
  );
}
