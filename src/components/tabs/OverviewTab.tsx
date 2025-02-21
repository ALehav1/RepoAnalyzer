import React from 'react';
import { RepositoryAnalysis } from '../../types/analysis';
import { Card, CardContent, CardHeader, CardTitle } from '../common/Card';
import { Star, GitFork, Calendar } from 'lucide-react';

interface OverviewTabProps {
  overview: RepositoryAnalysis['overview'];
  metadata: RepositoryAnalysis['metadata'];
}

export const OverviewTab: React.FC<OverviewTabProps> = ({ overview, metadata }) => {
  return (
    <div className="space-y-6 p-6">
      {/* Repository Info */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{metadata.name}</h1>
          <p className="mt-1 text-gray-600">{metadata.description}</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center text-gray-600">
            <Star className="w-5 h-5 mr-1" />
            <span>{metadata.stars}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <GitFork className="w-5 h-5 mr-1" />
            <span>{metadata.forks}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Calendar className="w-5 h-5 mr-1" />
            <span>{new Date(metadata.lastAnalyzed).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Purpose & Key Features */}
      <Card>
        <CardHeader>
          <CardTitle>Purpose & Key Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-900">Purpose</h3>
              <p className="mt-1 text-gray-600">{overview.purpose}</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Key Features</h3>
              <ul className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                {overview.keyFeatures.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-600 text-sm mr-2">
                      {index + 1}
                    </span>
                    <span className="text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Architecture */}
      <Card>
        <CardHeader>
          <CardTitle>Architecture Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-gray-600">{overview.architecture.description}</p>
            
            {overview.architecture.diagram && (
              <div className="mt-4">
                <img
                  src={overview.architecture.diagram}
                  alt="Architecture Diagram"
                  className="max-w-full rounded-lg border border-gray-200"
                />
              </div>
            )}

            <div>
              <h3 className="font-medium text-gray-900 mb-2">Key Components</h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {overview.architecture.components.map((component, index) => (
                  <li key={index} className="flex items-start">
                    <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-gray-100 text-gray-600 text-sm mr-2">
                      {index + 1}
                    </span>
                    <span className="text-gray-600">{component}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Technologies */}
      <Card>
        <CardHeader>
          <CardTitle>Technologies</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {overview.technologies.map((tech, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
              >
                {tech}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tags */}
      {metadata.tags.length > 0 && (
        <div className="p-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {metadata.tags.map((tag, index) => (
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
  );
};
