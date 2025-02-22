import React, { useState } from 'react';
import { ImplementationPattern } from '../../types/analysis';
import { Card, CardContent, CardHeader, CardTitle } from '../common/Card';

interface PatternsTabProps {
  patterns: ImplementationPattern[];
}

export const PatternsTab: React.FC<PatternsTabProps> = ({ patterns }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBenefits, setSelectedBenefits] = useState<string[]>([]);

  const allBenefits = Array.from(
    new Set(patterns.flatMap(p => p.benefits))
  ).sort();

  const filteredPatterns = patterns.filter(pattern => {
    const matchesSearch = searchQuery === '' || 
      pattern.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pattern.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesBenefits = selectedBenefits.length === 0 ||
      selectedBenefits.every(benefit => pattern.benefits.includes(benefit));

    return matchesSearch && matchesBenefits;
  });

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between p-6">
        <h2 className="text-xl font-bold text-gray-900">Implementation Patterns</h2>
        <span className="text-sm text-gray-500">
          {filteredPatterns.length} pattern{filteredPatterns.length !== 1 ? 's' : ''} found
        </span>
      </div>

      {/* Search & Filter */}
      <div className="space-y-4 p-6">
        <div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search patterns..."
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Benefits
          </label>
          <div className="flex flex-wrap gap-2">
            {allBenefits.map(benefit => (
              <button
                key={benefit}
                onClick={() => {
                  setSelectedBenefits(prev =>
                    prev.includes(benefit)
                      ? prev.filter(b => b !== benefit)
                      : [...prev, benefit]
                  );
                }}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  selectedBenefits.includes(benefit)
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                {benefit}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Pattern List */}
      <div className="grid grid-cols-1 gap-6 p-6">
        {filteredPatterns.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No patterns found matching your criteria.
          </div>
        ) : (
          filteredPatterns.map(pattern => (
            <Card key={pattern.id}>
              <CardHeader>
                <CardTitle>{pattern.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-gray-600">{pattern.description}</p>

                  {/* Benefits */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Benefits</h3>
                    <ul className="space-y-1">
                      {pattern.benefits.map((benefit, index) => (
                        <li key={index} className="text-sm text-gray-600">
                          • {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Considerations */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Considerations</h3>
                    <ul className="space-y-1">
                      {pattern.considerations.map((consideration, index) => (
                        <li key={index} className="text-sm text-gray-600">
                          • {consideration}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Code Reference */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Code Reference</h3>
                    <div className="bg-gray-50 rounded p-3 text-sm text-gray-600">
                      <div>File: {pattern.codeReference.file}</div>
                      <div>Lines: {pattern.codeReference.startLine}-{pattern.codeReference.endLine}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
