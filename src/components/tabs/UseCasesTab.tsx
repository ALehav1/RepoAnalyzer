import React from 'react';
import { AIUseCase } from '../../types/analysis';
import { Card, CardContent, CardHeader, CardTitle } from '../common/Card';

interface UseCasesTabProps {
  useCases: AIUseCase[];
}

export const UseCasesTab: React.FC<UseCasesTabProps> = ({ useCases }) => {
  return (
    <div className="space-y-6 p-6">
      <h2 className="text-xl font-bold text-gray-900">AI Use Cases</h2>
      
      <div className="grid grid-cols-1 gap-6 p-6">
        {useCases.map(useCase => (
          <Card key={useCase.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>{useCase.name}</CardTitle>
                  <span className="inline-block mt-1 px-2 py-1 text-sm rounded-full bg-blue-100 text-blue-800">
                    {useCase.type}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-600">{useCase.description}</p>

                {/* Implementation Details */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Implementation</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700">Architecture</h4>
                      <p className="mt-1 text-sm text-gray-600">{useCase.implementation.architecture}</p>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-700">Key Features</h4>
                      <ul className="mt-1 space-y-1">
                        {useCase.implementation.keyFeatures.map((feature, index) => (
                          <li key={index} className="text-sm text-gray-600">
                            • {feature}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Code Examples */}
                    {useCase.implementation.codeExamples.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700">Code Examples</h4>
                        <div className="mt-2 space-y-3">
                          {useCase.implementation.codeExamples.map((example, index) => (
                            <div key={index} className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">{example.file}</span>
                                <span className="text-xs text-gray-500">{example.description}</span>
                              </div>
                              <pre className="bg-gray-800 text-gray-100 rounded-md p-3 text-sm overflow-x-auto">
                                <code>{example.snippet}</code>
                              </pre>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Tags */}
                {useCase.tags.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {useCase.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
