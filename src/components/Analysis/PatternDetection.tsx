import React, { useState } from 'react';
import { analyzePatterns } from '../../api/client';
import { Pattern } from '../../types/patterns';
import { LoadingSpinner } from '../LoadingSpinner';
import { ErrorMessage } from '../ErrorMessage';
import { CodeBlock } from '../CodeBlock';
import { FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface PatternDetectionProps {
  filePath: string;
}

export const PatternDetection: React.FC<PatternDetectionProps> = ({ filePath }) => {
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPattern, setSelectedPattern] = useState<Pattern | null>(null);

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await analyzePatterns(filePath);
      setPatterns(response.patterns);
      if (response.patterns.length > 0) {
        setSelectedPattern(response.patterns[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze patterns');
    } finally {
      setLoading(false);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-500';
    if (confidence >= 0.6) return 'text-yellow-500';
    return 'text-red-500';
  };

  const renderComplexityChart = (pattern: Pattern) => {
    const data = [
      { name: 'Cyclomatic', value: pattern.context.complexity },
      { name: 'Dependencies', value: pattern.context.dependencies.length },
      { name: 'Methods', value: pattern.context.methods.length },
    ];

    return (
      <div className="h-64 w-full">
        <ResponsiveContainer>
          <LineChart data={data}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke="#4F46E5" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  };

  const renderPatternCard = (pattern: Pattern) => (
    <div
      key={`${pattern.name}-${pattern.line_number}`}
      className={`mb-4 p-4 bg-white rounded-lg shadow cursor-pointer transition-all ${
        selectedPattern?.name === pattern.name ? 'ring-2 ring-blue-500' : ''
      }`}
      onClick={() => setSelectedPattern(pattern)}
    >
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold flex items-center">
          {pattern.confidence >= 0.8 ? (
            <FaCheckCircle className="text-green-500 mr-2" />
          ) : (
            <FaExclamationTriangle className="text-yellow-500 mr-2" />
          )}
          {pattern.name}
        </h3>
        <span className={`text-sm ${getConfidenceColor(pattern.confidence)}`}>
          {(pattern.confidence * 100).toFixed(1)}% confidence
        </span>
      </div>
      
      <p className="text-sm text-gray-600">Line {pattern.line_number}</p>
    </div>
  );

  const renderPatternDetails = (pattern: Pattern) => (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-xl font-bold mb-4">Pattern Details</h3>
      
      <div className="mb-6">
        <h4 className="font-medium mb-2">Complexity Analysis</h4>
        {renderComplexityChart(pattern)}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <h4 className="font-medium mb-2">Dependencies</h4>
          <div className="bg-gray-50 p-4 rounded-lg">
            {pattern.context.dependencies.map((dep, index) => (
              <div key={index} className="mb-2 last:mb-0 flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                <span className="text-gray-700">{dep}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h4 className="font-medium mb-2">Methods</h4>
          <div className="bg-gray-50 p-4 rounded-lg">
            {pattern.context.methods.map((method, index) => (
              <div key={index} className="mb-2 last:mb-0">
                <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                  {method}
                </code>
              </div>
            ))}
          </div>
        </div>
      </div>

      {pattern.context.related_patterns && pattern.context.related_patterns.length > 0 && (
        <div className="mt-6">
          <h4 className="font-medium mb-2">Related Patterns</h4>
          <div className="flex flex-wrap gap-2">
            {pattern.context.related_patterns.map((related, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
              >
                {related}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="col-span-1 space-y-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Pattern Detection</h2>
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? <LoadingSpinner /> : 'Analyze'}
          </button>
        </div>

        {error && <ErrorMessage message={error} />}

        <div className="space-y-4">
          {patterns.length > 0 ? (
            patterns.map(pattern => renderPatternCard(pattern))
          ) : (
            <p className="text-gray-500 text-center py-8">
              {loading ? 'Analyzing patterns...' : 'Click "Analyze" to start detection'}
            </p>
          )}
        </div>
      </div>

      <div className="col-span-2">
        {selectedPattern ? (
          renderPatternDetails(selectedPattern)
        ) : (
          <div className="bg-white rounded-lg shadow p-6 flex items-center justify-center h-full">
            <p className="text-gray-500">Select a pattern to view details</p>
          </div>
        )}
      </div>
    </div>
  );
};
