import React, { useState, useCallback, useMemo } from 'react';
import { Code2, GitFork, BookOpen, Save, X, Library, Settings, Package, Database, Layout } from 'lucide-react';
import { SavedRepo, SavedPattern } from '../types';
import { savePattern, loadSavedPatterns, deletePattern } from '../utils/patternManager';
import { SavedPatterns } from './SavedPatterns';

// ... (keep existing interfaces)

export function RepoAnalysis({ savedRepos, onAnalyze }: RepoAnalysisProps) {
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

  // ... (keep rest of the component implementation)