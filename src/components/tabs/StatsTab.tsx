import React from 'react';
import { AnalysisStats } from '../../types/analysis';
import { Card, CardContent, CardHeader, CardTitle } from '../common/Card';

interface StatsTabProps {
  stats: AnalysisStats;
  aiConfig?: {
    modelTypes: string[];
    serviceTypes: string[];
    patterns: string[];
    depth: number;
  };
}

export const StatsTab: React.FC<StatsTabProps> = ({ stats, aiConfig }) => {
  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>AI Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-700">Model Types</h3>
              <div className="mt-1 space-y-1">
                {aiConfig?.modelTypes.map(type => (
                  <div key={type} className="text-sm text-gray-600">
                    {type}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-700">Service Types</h3>
              <div className="mt-1 space-y-1">
                {aiConfig?.serviceTypes.map(type => (
                  <div key={type} className="text-sm text-gray-600">
                    {type}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-700">Integration Patterns</h3>
              <div className="mt-1 space-y-1">
                {aiConfig?.patterns.map(pattern => (
                  <div key={pattern} className="text-sm text-gray-600">
                    {pattern}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-700">Analysis Depth</h3>
              <div className="mt-1 text-sm text-gray-600">
                Level {aiConfig?.depth} of 5
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>AI Findings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-700">By Severity</h3>
              <div className="mt-2 space-y-2">
                {Object.entries(stats.findings.bySeverity).map(([severity, count]) => (
                  <div key={severity} className="flex justify-between items-center">
                    <span className="text-sm capitalize">{severity}</span>
                    <span className={`text-sm font-medium px-2 py-1 rounded ${
                      severity === 'critical' ? 'bg-red-100 text-red-800' :
                      severity === 'high' ? 'bg-orange-100 text-orange-800' :
                      severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-700">By Status</h3>
              <div className="mt-2 space-y-2">
                {Object.entries(stats.findings.byStatus).map(([status, count]) => (
                  <div key={status} className="flex justify-between items-center">
                    <span className="text-sm capitalize">{status.replace('-', ' ')}</span>
                    <span className="text-sm font-medium bg-gray-100 px-2 py-1 rounded">
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pattern Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-700">Pattern Types</h3>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {Object.entries(stats.patterns.byType).map(([type, count]) => (
                  <div key={type} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                    <span className="text-sm">{type}</span>
                    <span className="text-sm font-medium">{count}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-700">Coverage</h3>
              <div className="mt-2">
                <div className="flex items-center">
                  <div className="flex-1">
                    <div className="h-2 bg-gray-200 rounded-full">
                      <div
                        className="h-2 bg-blue-500 rounded-full"
                        style={{ width: `${stats.patterns.coverage}%` }}
                      />
                    </div>
                  </div>
                  <span className="ml-2 text-sm font-medium text-gray-700">
                    {stats.patterns.coverage}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Objectives Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-gray-50 p-4 rounded">
                <div className="text-2xl font-bold text-gray-900">{stats.objectives.total}</div>
                <div className="text-sm text-gray-600">Total</div>
              </div>
              <div className="bg-green-50 p-4 rounded">
                <div className="text-2xl font-bold text-green-600">{stats.objectives.completed}</div>
                <div className="text-sm text-green-600">Completed</div>
              </div>
              <div className="bg-yellow-50 p-4 rounded">
                <div className="text-2xl font-bold text-yellow-600">{stats.objectives.inProgress}</div>
                <div className="text-sm text-yellow-600">In Progress</div>
              </div>
              <div className="bg-gray-50 p-4 rounded">
                <div className="text-2xl font-bold text-gray-600">{stats.objectives.pending}</div>
                <div className="text-sm text-gray-600">Pending</div>
              </div>
            </div>
            <div>
              <div className="h-2 bg-gray-200 rounded-full">
                <div
                  className="h-2 bg-green-500 rounded-l"
                  style={{
                    width: `${(stats.objectives.completed / stats.objectives.total) * 100}%`
                  }}
                />
                <div
                  className="h-2 bg-yellow-500"
                  style={{
                    width: `${(stats.objectives.inProgress / stats.objectives.total) * 100}%`,
                    marginLeft: `${(stats.objectives.completed / stats.objectives.total) * 100}%`
                  }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
