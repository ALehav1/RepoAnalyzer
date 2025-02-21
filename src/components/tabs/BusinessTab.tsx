import React from 'react';
import { RepositoryAnalysis } from '../../mocks/repository';
import { Card, CardContent, CardHeader, CardTitle } from '../common/Card';

interface BusinessTabProps {
  objectives: RepositoryAnalysis['objectives'];
  patterns: RepositoryAnalysis['patterns'];
}

export const BusinessTab: React.FC<BusinessTabProps> = ({ objectives, patterns }) => {
  return (
    <div className="space-y-6 p-6">
      <h2 className="text-xl font-bold mb-4">Business Objectives</h2>
      <div className="space-y-4">
        {objectives.map(objective => (
          <Card key={objective.id}>
            <CardHeader>
              <CardTitle>{objective.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mt-1">{objective.description}</p>

              {/* Related Patterns */}
              <div className="mt-3">
                <h4 className="text-sm font-medium text-gray-700">Related Patterns:</h4>
                <div className="mt-2 space-y-2">
                  {objective.relatedPatterns.map(patternId => {
                    const pattern = patterns.find(p => p.id === patternId);
                    if (!pattern) return null;
                    return (
                      <div key={patternId} className="bg-gray-50 p-2 rounded">
                        <div className="font-medium text-gray-800">{pattern.name}</div>
                        <div className="text-sm text-gray-600">{pattern.description}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* AI Findings */}
              {objective.aiFindings && objective.aiFindings.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700">AI Findings:</h4>
                  <div className="mt-2 space-y-3">
                    {objective.aiFindings.map(finding => (
                      <div
                        key={finding.id}
                        className={`p-3 rounded ${
                          finding.severity === 'critical' ? 'bg-red-50 border border-red-200' :
                          finding.severity === 'high' ? 'bg-orange-50 border border-orange-200' :
                          finding.severity === 'medium' ? 'bg-yellow-50 border border-yellow-200' :
                          'bg-green-50 border border-green-200'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h5 className="font-medium text-gray-900">{finding.title}</h5>
                            <p className="mt-1 text-sm text-gray-600">{finding.description}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`text-xs px-2 py-1 rounded ${
                              finding.severity === 'critical' ? 'bg-red-100 text-red-800' :
                              finding.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                              finding.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {finding.severity}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded ${
                              finding.status === 'open' ? 'bg-blue-100 text-blue-800' :
                              finding.status === 'in-progress' ? 'bg-purple-100 text-purple-800' :
                              finding.status === 'resolved' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {finding.status.replace('-', ' ')}
                            </span>
                          </div>
                        </div>
                        {finding.location && (
                          <div className="mt-2 text-sm">
                            <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                              {finding.location.file}:{finding.location.startLine}-{finding.location.endLine}
                            </code>
                          </div>
                        )}
                        <div className="mt-2 text-xs text-gray-500">
                          Confidence: {Math.round(finding.confidence * 100)}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
