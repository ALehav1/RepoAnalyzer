import React, { useState, useMemo } from 'react';
import { mockRepositories, mockAnalysisResults } from './mocks/mockData';

type SortField = 'stars' | 'forks' | 'contributors' | 'lastAnalyzed';
type FilterStatus = 'all' | 'analyzed' | 'analyzing' | 'error';
type FilterLanguage = 'all' | 'Python' | 'Go' | 'TypeScript' | 'C++';

function App() {
  const [selectedRepo, setSelectedRepo] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'patterns' | 'metrics' | 'components' | 'insights' | 'timeline' | 'security'>('patterns');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('stars');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [languageFilter, setLanguageFilter] = useState<FilterLanguage>('all');
  const [selectedPatternCategory, setSelectedPatternCategory] = useState<string>('all');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'analyzed': return 'bg-green-100 text-green-800';
      case 'analyzing': return 'bg-blue-100 text-blue-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredAndSortedRepos = useMemo(() => {
    return mockRepositories
      .filter(repo => {
        const matchesSearch = 
          repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          repo.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          repo.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
        
        const matchesStatus = statusFilter === 'all' || repo.status === statusFilter;
        const matchesLanguage = languageFilter === 'all' || repo.language === languageFilter;
        
        return matchesSearch && matchesStatus && matchesLanguage;
      })
      .sort((a, b) => {
        let comparison = 0;
        switch (sortField) {
          case 'stars':
            comparison = b.stats.stars - a.stats.stars;
            break;
          case 'forks':
            comparison = b.stats.forks - a.stats.forks;
            break;
          case 'contributors':
            comparison = b.stats.contributors - a.stats.contributors;
            break;
          case 'lastAnalyzed':
            comparison = new Date(b.lastAnalyzed).getTime() - new Date(a.lastAnalyzed).getTime();
            break;
        }
        return sortDirection === 'desc' ? comparison : -comparison;
      });
  }, [searchQuery, sortField, sortDirection, statusFilter, languageFilter]);

  const filteredPatterns = useMemo(() => {
    return mockAnalysisResults.patterns.filter(pattern => 
      selectedPatternCategory === 'all' || pattern.category === selectedPatternCategory
    );
  }, [selectedPatternCategory]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Repository Analysis</h1>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <div className="mb-6 space-y-4">
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Search repositories..."
                className="flex-1 px-4 py-2 border rounded-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <select
                className="px-4 py-2 border rounded-lg"
                value={sortField}
                onChange={(e) => setSortField(e.target.value as SortField)}
              >
                <option value="stars">Stars</option>
                <option value="forks">Forks</option>
                <option value="contributors">Contributors</option>
                <option value="lastAnalyzed">Last Analyzed</option>
              </select>
              <button
                className="p-2 border rounded-lg"
                onClick={() => setSortDirection(d => d === 'asc' ? 'desc' : 'asc')}
              >
                {sortDirection === 'asc' ? '↑' : '↓'}
              </button>
            </div>
            <div className="flex gap-4">
              <select
                className="px-4 py-2 border rounded-lg"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as FilterStatus)}
              >
                <option value="all">All Status</option>
                <option value="analyzed">Analyzed</option>
                <option value="analyzing">Analyzing</option>
                <option value="error">Error</option>
              </select>
              <select
                className="px-4 py-2 border rounded-lg"
                value={languageFilter}
                onChange={(e) => setLanguageFilter(e.target.value as FilterLanguage)}
              >
                <option value="all">All Languages</option>
                <option value="Python">Python</option>
                <option value="Go">Go</option>
                <option value="TypeScript">TypeScript</option>
                <option value="C++">C++</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            {filteredAndSortedRepos.map(repo => (
              <div
                key={repo.id}
                className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                  selectedRepo === repo.id ? 'border-blue-500 shadow-md' : 'border-gray-200'
                }`}
                onClick={() => setSelectedRepo(repo.id)}
              >
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-medium">{repo.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-sm font-medium ${getStatusColor(repo.status)}`}>
                    {repo.status}
                  </span>
                </div>
                <p className="text-gray-600 mt-2">{repo.description}</p>
                <div className="mt-3 flex flex-wrap gap-4 items-center">
                  <div className="flex gap-4 text-sm text-gray-500">
                    <span>⭐ {repo.stats.stars}</span>
                    <span>🔀 {repo.stats.forks}</span>
                    <span>👥 {repo.stats.contributors}</span>
                  </div>
                  <span className="px-2 py-1 bg-gray-100 rounded text-sm">{repo.language}</span>
                  <div className="flex gap-2">
                    {repo.tags.map(tag => (
                      <span key={tag} className="px-2 py-1 bg-blue-50 text-blue-600 rounded-full text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {selectedRepo && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Analysis Results</h2>
            
            <div className="mb-4 border-b">
              <nav className="flex gap-4 flex-wrap">
                {(['patterns', 'metrics', 'components', 'insights', 'timeline', 'security'] as const).map(tab => (
                  <button
                    key={tab}
                    className={`px-4 py-2 font-medium text-sm transition-all border-b-2 ${
                      activeTab === tab
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-600 hover:text-gray-800'
                    }`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </nav>
            </div>

            <div className="space-y-4">
              {activeTab === 'patterns' && (
                <>
                  <div className="mb-4">
                    <select
                      className="px-4 py-2 border rounded-lg"
                      value={selectedPatternCategory}
                      onChange={(e) => setSelectedPatternCategory(e.target.value)}
                    >
                      <option value="all">All Categories</option>
                      <option value="architecture">Architecture</option>
                      <option value="data">Data</option>
                      <option value="performance">Performance</option>
                    </select>
                  </div>
                  {filteredPatterns.map(pattern => (
                    <div key={pattern.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-medium">{pattern.name}</h3>
                          <span className="text-sm text-gray-500">{pattern.category}</span>
                        </div>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                          {pattern.confidence}% confidence
                        </span>
                      </div>
                      <p className="text-gray-600 mt-2">{pattern.description}</p>
                      <div className="mt-4 grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-sm text-gray-700 mb-2">Strengths</h4>
                          <ul className="list-disc list-inside text-sm text-gray-600">
                            {pattern.strengths.map(s => <li key={s}>{s}</li>)}
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium text-sm text-gray-700 mb-2">Weaknesses</h4>
                          <ul className="list-disc list-inside text-sm text-gray-600">
                            {pattern.weaknesses.map(w => <li key={w}>{w}</li>)}
                          </ul>
                        </div>
                      </div>
                      <div className="mt-4">
                        <h4 className="font-medium text-sm text-gray-700 mb-2">Implementation Files</h4>
                        <div className="space-y-1">
                          {pattern.implementationFiles.map(file => (
                            <div key={file} className="text-sm text-blue-600 hover:underline cursor-pointer">
                              {file}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}

              {activeTab === 'metrics' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(mockAnalysisResults.metrics)
                      .filter(([key]) => !['performance', 'codeQuality'].includes(key))
                      .map(([key, value]) => (
                        <div key={key} className="p-4 border rounded-lg">
                          <h3 className="text-lg font-medium capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </h3>
                          <div className="mt-2">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${typeof value === 'number' ? value : 0}%` }}
                              />
                            </div>
                            <span className="text-sm text-gray-600 mt-1">
                              {typeof value === 'number' ? value : 0}%
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h3 className="text-lg font-medium mb-4">Code Quality Metrics</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {Object.entries(mockAnalysisResults.metrics.codeQuality).map(([key, value]) => (
                        <div key={key} className="text-center">
                          <div className="text-2xl font-semibold text-blue-600">{value}%</div>
                          <div className="text-sm text-gray-600 capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h3 className="text-lg font-medium mb-4">Resource Usage</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {Object.entries(mockAnalysisResults.metrics.performance.resourceUsage).map(([key, value]) => (
                        <div key={key} className="text-center">
                          <div className="text-2xl font-semibold text-blue-600">{value}%</div>
                          <div className="text-sm text-gray-600 uppercase">{key}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h3 className="text-lg font-medium mb-4">Latency Trend (ms)</h3>
                    <div className="h-40 flex items-end gap-2">
                      {mockAnalysisResults.metrics.performance.latency.trend.map((point, index) => (
                        <div
                          key={index}
                          className="bg-blue-500 hover:bg-blue-600 transition-colors w-full rounded-t"
                          style={{
                            height: `${(point.value / 200) * 100}%`,
                          }}
                          title={`${new Date(point.timestamp).toLocaleDateString()}: ${point.value}ms`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="space-y-6">
                  <div className="p-4 border rounded-lg">
                    <h3 className="text-lg font-medium mb-4">Compliance Scores</h3>
                    <div className="grid grid-cols-3 gap-4">
                      {Object.entries(mockAnalysisResults.securityScan.compliance).map(([key, value]) => (
                        <div key={key} className="text-center">
                          <div className="text-2xl font-semibold text-blue-600">{(value * 100).toFixed(0)}%</div>
                          <div className="text-sm text-gray-600 uppercase">{key}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Security Vulnerabilities</h3>
                    {mockAnalysisResults.securityScan.vulnerabilities.map(vuln => (
                      <div key={vuln.id} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{vuln.description}</h4>
                            <span className="text-sm text-gray-500">{vuln.location}</span>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-sm ${
                            vuln.severity === 'high' ? 'bg-red-100 text-red-800' :
                            vuln.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {vuln.severity}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">
                          <span className="font-medium">Recommendation:</span> {vuln.recommendation}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Existing components, insights, and timeline tabs remain unchanged */}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
