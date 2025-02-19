// Mock repository data with diverse scenarios
export const mockRepositories = [
  {
    id: '1',
    name: 'AI Model Framework',
    url: 'https://github.com/example/ai-framework',
    description: 'A production-ready framework for deploying AI models with monitoring and scaling capabilities',
    status: 'analyzed',
    lastAnalyzed: new Date().toISOString(),
    stats: {
      stars: 1200,
      forks: 350,
      contributors: 45
    },
    language: 'Python',
    tags: ['ai', 'ml', 'framework']
  },
  {
    id: '2',
    name: 'Data Pipeline Service',
    url: 'https://github.com/example/data-pipeline',
    description: 'Scalable data processing pipeline with real-time analytics',
    status: 'analyzing',
    lastAnalyzed: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    stats: {
      stars: 890,
      forks: 220,
      contributors: 28
    },
    language: 'Go',
    tags: ['data-processing', 'analytics']
  },
  {
    id: '3',
    name: 'ML Ops Dashboard',
    url: 'https://github.com/example/mlops-dashboard',
    description: 'Comprehensive dashboard for monitoring ML models in production',
    status: 'error',
    lastAnalyzed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    stats: {
      stars: 567,
      forks: 89,
      contributors: 15
    },
    language: 'TypeScript',
    tags: ['dashboard', 'monitoring']
  },
  {
    id: '4',
    name: 'Neural Network Library',
    url: 'https://github.com/example/neural-net-lib',
    description: 'High-performance neural network implementations in C++',
    status: 'analyzed',
    lastAnalyzed: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    stats: {
      stars: 2100,
      forks: 450,
      contributors: 60
    },
    language: 'C++',
    tags: ['neural-networks', 'performance']
  }
];

export const mockAnalysisResults = {
  patterns: [
    {
      id: '1',
      name: 'Model-Service Separation',
      category: 'architecture',
      description: 'Clear separation between model logic and service layer',
      confidence: 95,
      strengths: [
        'Improved maintainability',
        'Better testing isolation',
        'Easier deployment'
      ],
      weaknesses: [
        'Additional complexity',
        'More boilerplate code'
      ],
      implementationFiles: [
        'src/models/base.py',
        'src/services/model_service.py'
      ]
    },
    {
      id: '2',
      name: 'Data Pipeline Pattern',
      category: 'data',
      description: 'Efficient data processing pipeline implementation',
      confidence: 88,
      strengths: [
        'High throughput',
        'Good error handling',
        'Scalable design'
      ],
      weaknesses: [
        'Complex error recovery',
        'Resource intensive'
      ],
      implementationFiles: [
        'src/pipeline/processor.py',
        'src/pipeline/stages.py'
      ]
    },
    {
      id: '3',
      name: 'Caching Strategy',
      category: 'performance',
      description: 'Intelligent caching of model predictions',
      confidence: 92,
      strengths: [
        'Reduced latency',
        'Lower compute costs',
        'Better user experience'
      ],
      weaknesses: [
        'Cache invalidation complexity',
        'Memory usage'
      ],
      implementationFiles: [
        'src/cache/model_cache.py',
        'src/cache/strategy.py'
      ]
    }
  ],
  metrics: {
    testCoverage: 87,
    codeMaintainability: 92,
    technicalDebt: 15,
    codeQuality: {
      complexity: 82,
      duplication: 95,
      documentation: 88,
      maintainability: 90
    },
    performance: {
      resourceUsage: {
        cpu: 65,
        memory: 78,
        disk: 45,
        network: 52
      },
      latency: {
        trend: [
          { timestamp: '2025-02-18T00:00:00Z', value: 120 },
          { timestamp: '2025-02-18T04:00:00Z', value: 115 },
          { timestamp: '2025-02-18T08:00:00Z', value: 125 },
          { timestamp: '2025-02-18T12:00:00Z', value: 118 },
          { timestamp: '2025-02-18T16:00:00Z', value: 110 },
          { timestamp: '2025-02-18T20:00:00Z', value: 105 }
        ]
      }
    }
  },
  securityScan: {
    compliance: {
      gdpr: 0.95,
      hipaa: 0.88,
      pci: 0.92
    },
    vulnerabilities: [
      {
        id: 'vuln-1',
        severity: 'high',
        description: 'Outdated dependency with known vulnerabilities',
        location: 'requirements.txt',
        recommendation: 'Update tensorflow to version 2.5.0 or higher'
      },
      {
        id: 'vuln-2',
        severity: 'medium',
        description: 'Insecure model serialization',
        location: 'src/models/serializer.py',
        recommendation: 'Implement signature verification for model artifacts'
      },
      {
        id: 'vuln-3',
        severity: 'low',
        description: 'Logging contains sensitive information',
        location: 'src/utils/logger.py',
        recommendation: 'Implement proper log sanitization'
      }
    ]
  },
  components: [
    {
      id: 'comp-1',
      name: 'Model Trainer',
      type: 'Service',
      purpose: 'Handles model training and validation',
      location: 'src/training',
      dependencies: ['DataLoader', 'ModelRegistry', 'MetricsCollector'],
      issues: []
    }
  ],
  insights: [
    {
      id: 'insight-1',
      type: 'pattern',
      title: 'Effective Error Handling',
      description: 'The codebase implements comprehensive error handling patterns',
      impact: 'high',
      recommendation: 'Consider adding circuit breakers for external service calls'
    }
  ],
  timeline: [
    {
      date: '2025-02-18T20:00:00Z',
      event: 'Major Architecture Update',
      changes: {
        added: ['Service Layer', 'Caching System'],
        removed: ['Old API Gateway'],
        modified: ['Config Management']
      }
    }
  ]
};
