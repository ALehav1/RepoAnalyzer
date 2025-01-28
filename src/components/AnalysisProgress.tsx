import React from 'react';
import { Loader2 } from 'lucide-react';
import { AnalysisUpdate } from '../hooks/useAnalysisStream';

interface AnalysisProgressProps {
  updates: AnalysisUpdate[];
  progress: number;
  error: string | null;
}

export function AnalysisProgress({ updates, progress, error }: AnalysisProgressProps) {
  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Analysis Progress</h3>
        <span className="text-sm text-gray-500">{Math.round(progress * 100)}%</span>
      </div>
      
      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div 
          className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      {/* Status updates */}
      <div className="space-y-2 max-h-40 overflow-y-auto">
        {updates.map((update, index) => (
          <div 
            key={index}
            className={`flex items-center gap-2 text-sm ${
              update.status === 'error' ? 'text-red-600' :
              update.status === 'complete' ? 'text-green-600' :
              'text-gray-600'
            }`}
          >
            {update.status !== 'complete' && update.status !== 'error' && (
              <Loader2 className="w-4 h-4 animate-spin" />
            )}
            <span>{update.message}</span>
          </div>
        ))}
      </div>

      {/* Error message */}
      {error && (
        <div className="text-sm text-red-600">
          {error}
        </div>
      )}
    </div>
  );
}
