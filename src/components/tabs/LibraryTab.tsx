import React, { useState } from 'react';
import { RepositoryAnalysis } from '../../types/analysis';
import { Card, CardContent, CardHeader, CardTitle } from '../common/Card';
import { Star } from 'lucide-react';

interface LibraryTabProps {
  analysis: RepositoryAnalysis;
  metadata?: RepositoryAnalysis['libraryMetadata'];
}

export const LibraryTab: React.FC<LibraryTabProps> = ({ analysis, metadata }) => {
  const [collections, setCollections] = useState<string[]>(metadata?.collections || []);
  const [notes, setNotes] = useState(metadata?.notes || '');
  const [rating, setRating] = useState(metadata?.rating || 0);

  const handleSave = () => {
    // TODO: Implement save to library functionality
    console.log('Saving to library:', {
      collections,
      notes,
      rating,
      repository: analysis
    });
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Save to Library</h2>
        {metadata && (
          <span className="text-sm text-gray-500">
            Added {new Date(metadata.savedAt).toLocaleDateString()}
          </span>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Library Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Collections */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Collections</label>
              <div className="mt-1">
                <input
                  type="text"
                  placeholder="Add to collections (comma-separated)"
                  value={collections.join(', ')}
                  onChange={(e) => setCollections(e.target.value.split(',').map(s => s.trim()))}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Organize this repository into collections for easier access
              </p>
            </div>

            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Rating</label>
              <div className="mt-1 flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    onClick={() => setRating(value)}
                    className={`p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                      value <= rating ? 'text-yellow-400' : 'text-gray-300'
                    }`}
                  >
                    <Star className="w-6 h-6" />
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Notes</label>
              <div className="mt-1">
                <textarea
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add your notes about this repository..."
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Repository Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Key Features</h3>
              <ul className="mt-2 space-y-1">
                {analysis.overview.keyFeatures.map((feature, index) => (
                  <li key={index} className="text-sm text-gray-600">• {feature}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-900">AI Use Cases</h3>
              <ul className="mt-2 space-y-1">
                {analysis.aiUseCases.map((useCase, index) => (
                  <li key={index} className="text-sm text-gray-600">
                    • {useCase.name} ({useCase.type})
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-900">Technologies</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {analysis.overview.technologies.map((tech, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Save to Library
        </button>
      </div>
    </div>
  );
};
