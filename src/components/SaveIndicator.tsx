import React, { useState, useEffect } from 'react';
import { Save } from 'lucide-react';

interface SaveIndicatorProps {
  show: boolean;
  type?: 'repo' | 'analysis' | 'explanations' | 'chat';
  repoName?: string;
}

export function SaveIndicator({ show, type = 'repo', repoName }: SaveIndicatorProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [show]);

  if (!visible) return null;

  const getMessage = () => {
    switch (type) {
      case 'repo':
        return `Saving repository${repoName ? ` "${repoName}"` : ''} to local storage`;
      case 'analysis':
        return `Saving analysis for${repoName ? ` "${repoName}"` : ' repository'} to local storage`;
      case 'explanations':
        return `Saving file explanations for${repoName ? ` "${repoName}"` : ' repository'} to local storage`;
      case 'chat':
        return `Saving chat history for${repoName ? ` "${repoName}"` : ' repository'} to local storage`;
      default:
        return 'Saving to local storage';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-md shadow-lg flex items-center gap-2 z-50 animate-fade-in">
      <Save className="w-4 h-4 animate-pulse" />
      <span>{getMessage()}</span>
    </div>
  );
}