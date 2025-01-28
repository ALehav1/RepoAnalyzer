import React, { useState, useCallback, useMemo, useContext } from 'react';
import { Code2, GitFork, BookOpen, Save, X, Library, Settings, Package, Database, Layout } from 'lucide-react';
import { SavedRepo, SavedPattern } from '../types';
import { savePattern, loadSavedPatterns, deletePattern } from '../utils/patternManager';
import { SavedPatterns } from './SavedPatterns';
import { AppContext } from '../context/AppContext';
import { AnalysisProgress } from './AnalysisProgress';
import { CodeBlock } from './CodeBlock';
import { LoadingSpinner } from './LoadingSpinner';
import { getFileExtension } from '../utils/fileUtils';

// ... (keep existing interfaces)

export function RepoAnalysis({ savedRepos, onAnalyze }: RepoAnalysisProps) {
  const { 
    analysis, 
    analyzing,
    analysisUpdates,
    analysisProgress,
    error,
    selectedFile,
    fileExplanations
  } = useContext(AppContext);

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
        <h3 className="text-red-800 font-medium mb-2">Error</h3>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!analysis && !analyzing) {
    return null;
  }

  if (analyzing) {
    return (
      <div className="space-y-4">
        <LoadingSpinner message="Analyzing repository..." />
        <AnalysisProgress
          updates={analysisUpdates}
          progress={analysisProgress}
          error={error}
        />
      </div>
    );
  }

  // ... (keep existing state)

  // Enhanced pattern extraction
  const repoPatterns = useMemo(() => {
    const patterns: Record<string, Array<{ name: string; content: string; type: string }>> = {
      'architecture': [],
      'setup': [],
      'libraries': [],
      'patterns': [],
      'data-management': [],
      'ui-components': []
    };

    savedRepos.forEach(repo => {
      // Project Setup Patterns
      const packageJson = repo.fileStructure.find(f => f.path === 'package.json');
      if (packageJson?.content) {
        patterns['setup'].push({
          name: 'Project Dependencies',
          content: packageJson.content,
          type: 'Dependencies and Scripts'
        });
      }

      const configFiles = repo.fileStructure.filter(f => 
        f.path.includes('config') || 
        f.path.endsWith('.config.js') || 
        f.path.endsWith('.config.ts')
      );
      configFiles.forEach(file => {
        if (file.content) {
          patterns['setup'].push({
            name: `Configuration: ${file.path}`,
            content: file.content,
            type: 'Project Configuration'
          });
        }
      });

      // Architecture Patterns
      const srcDir = repo.fileStructure.find(f => f.path === 'src');
      if (srcDir?.children) {
        patterns['architecture'].push({
          name: 'Project Structure',
          content: JSON.stringify(srcDir.children.map(f => ({
            path: f.path,
            type: f.type
          })), null, 2),
          type: 'Directory Organization'
        });
      }

      // Library Usage Patterns
      repo.fileStructure.forEach(file => {
        if (file.content) {
          // State Management
          if (file.content.includes('createContext') || file.content.includes('useReducer')) {
            patterns['data-management'].push({
              name: 'State Management',
              content: file.content,
              type: 'Global State Patterns'
            });
          }

          // API Integration
          if (file.content.includes('fetch(') || file.content.includes('axios.')) {
            patterns['data-management'].push({
              name: 'API Integration',
              content: file.content,
              type: 'Data Fetching Patterns'
            });
          }

          // Component Patterns
          if (file.content.includes('export') && file.content.includes('function') && file.content.includes('return')) {
            patterns['ui-components'].push({
              name: file.path.split('/').pop()?.replace(/\.[^/.]+$/, '') || 'Component',
              content: file.content,
              type: 'Reusable Components'
            });
          }

          // Custom Hooks
          if (file.content.includes('function use') && file.content.includes('return')) {
            patterns['patterns'].push({
              name: file.path.split('/').pop()?.replace(/\.[^/.]+$/, '') || 'Custom Hook',
              content: file.content,
              type: 'Custom Hooks'
            });
          }
        }
      });

      // Library Analysis
      if (packageJson?.content) {
        const pkg = JSON.parse(packageJson.content);
        const allDeps = {
          ...pkg.dependencies,
          ...pkg.devDependencies
        };
        
        const categories = {
          'UI Libraries': ['react', 'vue', 'svelte', '@angular'],
          'State Management': ['redux', 'mobx', 'recoil', 'zustand'],
          'Routing': ['react-router', '@reach/router', 'vue-router'],
          'Data Fetching': ['axios', 'swr', 'react-query', '@tanstack/query'],
          'Testing': ['jest', 'vitest', '@testing-library', 'cypress'],
          'Build Tools': ['vite', 'webpack', 'rollup', 'esbuild']
        };

        Object.entries(categories).forEach(([category, keywords]) => {
          const matchedDeps = Object.entries(allDeps)
            .filter(([name]) => keywords.some(k => name.includes(k)));
          
          if (matchedDeps.length > 0) {
            patterns['libraries'].push({
              name: category,
              content: JSON.stringify(Object.fromEntries(matchedDeps), null, 2),
              type: 'Library Usage'
            });
          }
        });
      }
    });

    return patterns;
  }, [savedRepos]);

  const analysisOptions = [
    {
      id: 'architecture',
      label: 'Architecture',
      icon: Layout,
      options: ['Directory Organization', 'File Structure', 'Module Dependencies']
    },
    {
      id: 'setup',
      label: 'Project Setup',
      icon: Settings,
      options: ['Dependencies and Scripts', 'Project Configuration', 'Build Setup']
    },
    {
      id: 'libraries',
      label: 'Libraries & Tools',
      icon: Package,
      options: ['Library Usage', 'Development Tools', 'Build Tools']
    },
    {
      id: 'patterns',
      label: 'Code Patterns',
      icon: Code2,
      options: ['Custom Hooks', 'Higher-Order Components', 'Render Props']
    },
    {
      id: 'data-management',
      label: 'Data Management',
      icon: Database,
      options: ['Global State Patterns', 'Data Fetching Patterns', 'Caching Strategies']
    },
    {
      id: 'ui-components',
      label: 'UI Components',
      icon: Layout,
      options: ['Reusable Components', 'Layout Components', 'Form Components']
    }
  ];

  return (
    <div className="space-y-6">
      {/* Analysis Results */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Analysis Results</h2>
        
        {/* Repository Info */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium mb-4">Repository Overview</h3>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Name</dt>
              <dd className="mt-1">{analysis?.name}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Description</dt>
              <dd className="mt-1">{analysis?.description || 'No description available'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Languages</dt>
              <dd className="mt-1">
                {analysis?.languages?.join(', ') || 'Not specified'}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">License</dt>
              <dd className="mt-1">{analysis?.license || 'Not specified'}</dd>
            </div>
          </dl>
        </div>

        {/* Selected File */}
        {selectedFile && (
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium mb-4">Selected File</h3>
            <div className="space-y-4">
              {/* File explanation */}
              {fileExplanations[selectedFile] && (
                <div className="prose max-w-none mb-4">
                  <p>{fileExplanations[selectedFile]}</p>
                </div>
              )}
              
              {/* Code content */}
              {analysis?.fileContent ? (
                <CodeBlock
                  code={analysis.fileContent.content}
                  language={analysis.fileContent.metadata.language}
                  fileName={selectedFile}
                  showLineNumbers={true}
                />
              ) : (
                <LoadingSpinner message="Loading file content..." />
              )}
            </div>
          </div>
        )}

        {/* AI Analysis */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium mb-4">AI Analysis</h3>
          <div className="prose max-w-none">
            <p>{analysis?.aiAnalysis}</p>
          </div>
        </div>

        {/* Critical Analysis */}
        {analysis?.criticalAnalysis && (
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium mb-4">Critical Analysis</h3>
            <div className="prose max-w-none">
              <p>{analysis.criticalAnalysis}</p>
            </div>
          </div>
        )}

        {/* Code Examples */}
        {analysis?.codeExamples && analysis.codeExamples.length > 0 && (
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium mb-4">Code Examples</h3>
            <div className="space-y-4">
              {analysis.codeExamples.map((example, index) => (
                <div key={index} className="space-y-2">
                  <h4 className="font-medium text-gray-700">{example.title}</h4>
                  <CodeBlock
                    code={example.code}
                    language={example.language}
                    highlightLines={example.highlightLines}
                  />
                  {example.explanation && (
                    <p className="text-sm text-gray-600 mt-2">{example.explanation}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}