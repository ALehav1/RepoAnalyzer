import React from 'react';
import { User, Bot } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { ChatMessage as ChatMessageType } from '../types';

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mx-4`}>
      <div
        className={`max-w-[85%] rounded-lg p-4 flex gap-3 ${
          isUser
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100'
        }`}
      >
        <div className="flex-shrink-0 mt-1">
          {isUser ? (
            <User className="w-5 h-5" />
          ) : (
            <Bot className="w-5 h-5" />
          )}
        </div>
        <div className={`prose prose-sm max-w-none overflow-hidden break-words ${isUser ? 'prose-invert' : ''}`}>
          <ReactMarkdown>{message.content}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}