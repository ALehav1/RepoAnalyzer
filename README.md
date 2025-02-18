# RepoAnalyzer

A tool for analyzing code repositories and identifying common patterns.

## Table of Contents

1. [Recent Updates](#recent-updates)
2. [Project Structure](#project-structure)
3. [Configuration](#configuration)
4. [Key Features](#key-features)
5. [Error Handling](#error-handling)
6. [Performance](#performance)
7. [Testing](#testing)
8. [Type System](#type-system)
9. [Development](#development)
10. [Next Steps](#next-steps)
11. [Migration Guide](#migration-guide)
12. [Contributing](#contributing)
13. [License](#license)
14. [Prototype Development Plan](#prototype-development-plan)
15. [Comprehensive Testing Plan](#comprehensive-testing-plan)
16. [UI-First Development Plan](#ui-first-development-plan)

## Recent Updates

### Performance Optimizations (February 17, 2025)

#### Analysis Table Optimizations

1. **Virtualization**

   - Implemented react-window for efficient rendering
   - Only renders visible rows
   - Added overscan for smooth scrolling
   - Dynamic width handling

2. **Performance Monitoring**

   - Added FPS tracking
   - Memory usage monitoring
   - DOM node count tracking
   - Render time measurements
   - Automatic performance warnings

3. **Data Optimization**

   - Memoized expensive operations
   - Measured async operations
   - Optimized sorting and filtering
   - Reduced re-renders

4. **Memory Management**
   - Efficient cleanup
   - Resource monitoring
   - Optimized data transformations
   - Reduced memory footprint

#### Performance Utilities

```typescript
// Monitor component performance
usePerformanceMonitor({
  logToConsole: process.env.NODE_ENV === 'development',
  onMetricsUpdate: metrics => {
    // Handle performance metrics
  },
});

// Measure async operations
const result = await measureAsyncOperation(async () => {
  // Expensive operation
}, 'operation-name');
```

### Performance Regression Detection (February 17, 2025)

1. **Automatic Detection**

   ```typescript
   const report = performanceRegression.detectRegression('ComponentName', metrics);
   ```

   - Real-time regression detection
   - Baseline comparison
   - Trend analysis
   - Severity scoring

2. **Regression Metrics**

   ```typescript
   interface RegressionMetric {
     metric: string; // Performance metric
     baseline: number; // Baseline value
     current: number; // Current value
     change: number; // Absolute change
     changePercent: number; // Percentage change
     severity: 'critical' | 'warning' | 'info';
     timestamp: string; // Detection time
   }
   ```

3. **Regression Thresholds**

   ```typescript
   const THRESHOLDS = {
     renderTime: {
       critical: 50, // 50% increase
       warning: 25, // 25% increase
     },
     fps: {
       critical: -30, // 30% decrease
       warning: -15, // 15% decrease
     },
     memoryUsage: {
       critical: 50, // 50% increase
       warning: 25, // 25% increase
     },
   };
   ```

4. **Detection Features**

   - Baseline management
   - Historical trending
   - Moving averages
   - Regression scoring
   - Trend visualization

5. **Implementation**

   ```typescript
   // Set initial baseline
   performanceRegression.setBaseline('ComponentName', {
     renderTime: 100,
     fps: 60,
     memoryUsage: 50,
   });

   // Update baseline with better metrics
   performanceRegression.updateBaseline('ComponentName', {
     renderTime: 80, // Faster render
     fps: 60, // Same FPS
     memoryUsage: 40, // Lower memory
   });

   // Get regression history
   const history = performanceRegression.getRegressionHistory('ComponentName');
   ```

6. **Dashboard Integration**
   - Real-time monitoring
   - Regression alerts
   - Trend visualization
   - Historical comparison
   - Severity indicators

### Performance Optimization (February 17, 2025)

1. **Automatic Suggestions**

   ```typescript
   const suggestions = performanceOptimizer.analyzePerfomance('ComponentName');
   ```

   - Real-time optimization recommendations
   - Component-specific suggestions
   - Implementation examples
   - Impact estimates

2. **Suggestion Types**

   - Critical issues (red)
     - High render times
     - Memory leaks
     - Low FPS
   - Warnings (yellow)
     - Frequent re-renders
     - High memory usage
     - FPS drops
   - Improvements (blue)
     - Code splitting opportunities
     - Caching suggestions
     - Optimization patterns

3. **Performance Patterns**

   ```typescript
   interface PerformancePattern {
     type: string; // metric type
     frequency: number; // events per minute
     avgValue: number; // average metric value
     maxValue: number; // peak metric value
     timeRange: number; // analysis period
   }
   ```

4. **Common Optimizations**

   - Component memoization

   ```typescript
   const MemoizedComponent = React.memo(Component);
   ```

   - Value memoization

   ```typescript
   const memoizedValue = useMemo(() => compute(a, b), [a, b]);
   ```

   - Effect cleanup

   ```typescript
   useEffect(() => {
     // Setup
     return () => {
       // Cleanup
     };
   }, [deps]);
   ```

   - List virtualization

   ```typescript
   import { VirtualizedList } from 'react-window';
   ```

5. **Implementation Guide**
   - Each suggestion includes:
     - Issue description
     - Solution approach
     - Expected impact
     - Code example
     - Priority level

### Performance Monitoring and Logging (February 17, 2025)

#### Performance Thresholds

```typescript
// Performance error thresholds
render: {
  error: 1000, // ms
  warning: 500 // ms
},
fps: {
  error: 15,
  warning: 30
},
memory: {
  error: 200 * 1024 * 1024, // 200MB
  warning: 100 * 1024 * 1024 // 100MB
},
operation: {
  error: 500, // ms
  warning: 200 // ms
}
```

#### Performance Logging

1. **Error Types**

   - Render time exceeded
   - Low FPS
   - High memory usage
   - Slow operations

2. **Warning Types**

   - Slow operations
   - High memory consumption
   - Low FPS
   - DOM node count

3. **Logging Features**

   - Automatic performance monitoring
   - Error and warning tracking
   - Recent error history
   - Performance statistics
   - Memory cleanup

4. **Usage Example**

```typescript
// Monitor component performance
usePerformanceMonitor({
  componentName: 'ComponentName',
  logToConsole: process.env.NODE_ENV === 'development',
});

// Track async operations
const result = await measureAsyncOperation(
  async () => {
    // Expensive operation
  },
  'operation-name',
  'ComponentName'
);

// Get performance stats
const errorStats = performanceLogger.getErrorStats();
const warningStats = performanceLogger.getWarningStats();
```

#### Error Handling

1. **Automatic Logging**

   - Performance errors logged to console
   - Warning thresholds with notifications
   - Error history maintained
   - Statistics gathering

2. **Error Recovery**

   - Automatic cleanup of old entries
   - Resource monitoring
   - Performance optimization suggestions
   - Debug information collection

3. **Monitoring Dashboard**
   - Real-time performance metrics
   - Error and warning history
   - Component-specific stats
   - Trend analysis

### Performance Dashboard (February 17, 2025)

1. **Real-time Monitoring**

   ```typescript
   <PerformanceDashboard />
   ```

   - Live performance metrics
   - Component-specific tracking
   - Error and warning counts
   - Historical data visualization

2. **Dashboard Features**

   - FPS monitoring graph
   - Memory usage tracking
   - Render time analysis
   - Component selection
   - Time range filtering
   - Threshold indicators

3. **Metrics Display**

   - Line charts for trends
   - Summary statistics
   - Error/warning counts
   - Performance thresholds
   - Component comparison

4. **Time Ranges**

   - Last 5 minutes
   - Last 15 minutes
   - Last hour
   - Auto-updating data

5. **Integration**

   ```typescript
   // Add to layout
   <MainLayout>
     {showPerformance && <PerformanceDashboard />}
     <YourComponent />
   </MainLayout>
   ```

6. **Chart Types**
   - FPS over time
   - Memory usage trends
   - Render time patterns
   - Error frequency
   - Warning distribution

### Prototype Development Status

### ✅ All Phases Complete

1. **Core UI Components** ✓

   - Repository Form with validation
   - Repository List with grid layout
   - Navigation system
   - Analysis dashboard
   - Loading states
   - Error handling

2. **Mock Data Layer** ✓

   - Repository data structure
   - Analysis results
   - Progress tracking
   - Mock data provider

3. **User Flow Implementation** ✓

   - Repository management
   - Analysis tracking
   - Results viewing
   - State management hooks

4. **Polish and Refinement** ✓
   - Smooth dark mode transitions
   - Toast notifications
   - Responsive design
   - Error boundaries

### Project Structure

```
src/
├── components/
│   ├── repository/           # Repository components
│   ├── navigation/          # Navigation system
│   ├── layout/             # Layout components
│   └── common/             # Shared components
├── hooks/                  # Custom hooks
├── types/                 # TypeScript types
├── styles/               # Global styles
└── __tests__/           # Tests and mocks
```

### Key Features

1. **Repository Management**

   - URL validation
   - Status tracking
   - Progress indicators
   - Error handling

2. **Analysis Dashboard**

   - Real-time progress
   - Visual results
   - Interactive charts
   - Status updates

3. **User Experience**

   - Dark mode support
   - Responsive layout
   - Loading states
   - Toast notifications

4. **Development Features**
   - TypeScript support
   - Component testing
   - Mock data system
   - Error boundaries

### Next Steps

1. **Backend Integration**

   - API implementation
   - Real data flow
   - Authentication
   - Rate limiting

2. **Advanced Features**
   - Repository comparison
   - Trend analysis
   - Custom metrics
   - Export functionality

## Component Organization (February 15, 2025)

#### Component Directory Structure

```
src/
├── components/
│   ├── analysis/       # Analysis-related components
│   ├── category/       # Category management components
│   ├── debug/          # Debugging and development tools
│   ├── search/         # Search interface components
│   ├── ui/            # Core UI components
│   └── visualization/ # Data visualization components
```

#### Component Categories

1. **Analysis Components**

   - `AnalysisChart`: Displays code quality metrics
   - `AnalysisMetrics`: Shows detailed analysis data
   - `AnalysisResults`: Presents analysis findings

2. **Category Components**

   - `CategoryList`: Displays available categories
   - `CategoryFilter`: Filters content by category
   - `CategoryMetrics`: Shows category-specific metrics

3. **Debug Components**

   - `SearchDebug`: Debug interface for search functionality
   - `ErrorMetrics`: Displays error tracking information
   - `DebugPanel`: Main debugging interface

4. **Search Components**

   - `SearchInterface`: Main search UI component
   - `FuzzyMatchVisualizer`: Visualizes fuzzy match results
   - `SearchResults`: Displays search results

5. **UI Components**

   - `Button`: Reusable button component
   - `Input`: Form input components
   - `Modal`: Dialog and modal components

6. **Visualization Components**
   - `DistributionChart`: Shows data distribution
   - `Timeline`: Displays temporal data
   - `MetricsChart`: Visualizes metrics data
   - `DependencyGraph`: Shows code dependencies

#### Mock Component Organization

All mock components are organized in `src/__tests__/test-utils/mocks/components/` with the following structure:

```
mocks/
├── components/
│   ├── analysis/
│   │   └── index.tsx      # Analysis component mocks
│   ├── category/
│   │   └── index.tsx      # Category component mocks
│   ├── debug/
│   │   └── index.tsx      # Debug component mocks
│   ├── search/
│   │   └── index.tsx      # Search component mocks
│   ├── ui/
│   │   └── index.tsx      # UI component mocks
│   └── visualization/
│       └── index.tsx      # Visualization component mocks
└── data/
    ├── analysis/
    │   └── index.ts       # Analysis mock data
    ├── category/
    │   └── index.ts       # Category mock data
    └── search/
        └── index.ts       # Search mock data
```

#### Testing Guidelines

1. **Mock Organization**

   - Keep ALL mocks in `src/__tests__/test-utils/mocks/`
   - Separate by component type (analysis, category, etc.)
   - Export through index.ts files
   - Use TypeScript for type safety

2. **Component Testing**

   - Import mocks from central locations
   - Test success and error cases
   - Verify rendered content
   - Test state changes
   - Use ARIA roles/labels

3. **Best Practices**
   - No duplicate mock implementations
   - No inline mock data
   - No mixed test types
   - No implementation details
   - No hardcoded test data

### Pattern Explorer Improvements

- Enhanced pattern filtering with category and language support
- Added grid and list view options
- Implemented skeleton loading states
- Added search functionality with real-time filtering
- Improved UI with modern design patterns

### Component System Updates

- Standardized component interfaces across the application
- Added proper TypeScript types for all components
- Improved accessibility with ARIA attributes
- Enhanced error handling and loading states

### Layout System

- Implemented responsive layout with mobile support
- Added dark mode support via Tailwind
- Created consistent spacing and typography system
- Improved navigation with breadcrumbs

### UI Component System Migration

- Migrated from Mantine to Radix UI primitives with Tailwind CSS
- Implemented new component system with improved accessibility
- Added comprehensive error handling and loading states
- Updated all UI components with consistent styling

### MetricCard Component Improvements

- Enhanced tooltip functionality with proper portal rendering
- Improved accessibility with ARIA attributes and keyboard navigation
- Added comprehensive test coverage for all component features
- Implemented robust hover interactions using @testing-library/user-event

### Project Structure Improvements

- Consolidated test utilities into a single location
- Organized components into logical categories
- Standardized file naming conventions
- Updated documentation for better clarity

### Debug Component Improvements

- Enhanced ErrorMetrics component with better error filtering and acknowledgment
- Improved SearchComparison component with fuzzy match highlighting
- Added test coverage for debug components using test IDs
- Implemented proper error message display and dialog functionality
- Refactored DebugPanel to use Radix UI Tabs with proper ARIA roles
- Fixed component imports and paths for better maintainability

## Testing Improvements (February 14, 2025)

#### SearchComparison Component Tests

The SearchComparison component tests have been enhanced with the following improvements:

1. **Mock Export Function Organization**

   - Centralized mock functions in `src/__tests__/test-utils/mocks/search-components.tsx`
   - Export mock functions for reuse across test files
   - ```typescript
     // search-components.tsx
     export const mockExportToJSON = vi.fn();
     ```

   ```

   ```

2. **Component Test Coverage**

   - Selection controls and state management
   - View mode switching (grid/list)
   - Export functionality with proper data structure
   - Fuzzy match highlighting
   - Empty state handling

3. **Export Functionality Testing**

```typescript
// search-components.tsx
vi.mock('@/lib/export', () => ({
  exportToJSON: mockExportToJSON,
  exportToMarkdown: vi.fn(),
}));

it('exports selected results', () => {
  // Test verifies:
  // - Export button state (enabled/disabled)
  // - Export function called with correct data
  // - Proper data structure for export
});
```

4. **Best Practices Implemented**
   - Clear test descriptions
   - Proper mock cleanup between tests
   - Consistent test data structure
   - Comprehensive assertions
   - Reusable mock functions

## Analysis Component Updates (February 15, 2025)

#### AnalysisChart Component

The AnalysisChart component has been implemented with the following features:

1. **Core Functionality**

   - Displays code quality metrics with scores
   - Shows detected design patterns and their frequency
   - Uses grid layout for responsive display
   - Handles loading and error states

2. **API Integration**

   - Uses `analysisService.ts` for data fetching
   - Supports both repository URL and analysis ID
   - Proper error handling with `AnalysisError` class
   - Consistent error messages across components

3. **Component Structure**

```
src/
├── components/
│   └── analysis/
│       └── AnalysisChart.tsx    # Main chart component
├── services/
│   └── analysisService.ts       # API service for analysis data
└── hooks/
    └── useAnalysis.ts           # Data fetching hook
```

4. **Testing Infrastructure**

   - Component tests in `cypress/component/AnalysisChart.cy.tsx`
   - Uses centralized mocks from `src/__tests__/test-utils/mocks/`
   - Mock data in `analysis.ts`, `api.ts`, and `errors.ts`
   - Tests core functionality, loading, and error states
   - Accessibility and mobile tests prepared (currently skipped)

5. **Development Status**

   - Core functionality implemented
   - API integration complete
   - Basic test coverage
   - Mobile interactions (TODO)
   - Accessibility improvements (TODO)

6. **Next Steps**
   - Implement mobile-specific interactions
   - Add accessibility features
   - Enhance error handling with retry logic
   - Add performance monitoring
   - Implement caching for analysis results

## Loading State Implementation (February 15, 2025)

#### New Components

1. `AnalysisChartSkeleton.tsx`:
   - Provides loading placeholder UI
   - Uses Tailwind's animate-pulse for loading animation
   - Matches final layout to prevent layout shifts
   - Dark mode compatible with dark: classes

#### Component Updates

1. `AnalysisChart.tsx`:
   - Now uses AnalysisChartSkeleton for loading state
   - Improved loading state transitions
   - Better error handling structure

#### Test Structure

1. Core Test Cases:

```typescript
// Loading State
it('handles loading state', () => {
  // Tests skeleton UI visibility
  // Tests placeholder structure
  // Tests transition to loaded state
});

// Error State
it('handles error state', () => {
  // Tests error message display
  // Tests error message content
});

// Data Display
it('displays chart with correct data', () => {
  // Tests metrics display
  // Tests pattern display
});
```

2. Mobile & Accessibility Tests (Prepared):
   - Mobile interaction tests (currently skipped)
   - Accessibility tests (currently skipped)
   - Will be enabled after core functionality is complete

#### Next Steps

1. Error Handling:

   - Add retry button
   - Implement exponential backoff
   - Add error boundary

2. Performance:
   - Add request debouncing
   - Implement request cancellation
   - Set up caching

## Mock Organization

Our mocks are organized in `src/__tests__/test-utils/mocks/` with the following structure:

```
mocks/
├── data/               # Data mocks
│   ├── analysis.ts    # Analysis result data
│   ├── errors.ts      # Error message data
│   ├── logs.ts        # Log entry data
│   ├── metrics.ts     # Metrics data
│   └── patterns.ts    # Pattern data
├── services/          # Service mocks
│   ├── api.ts        # API response mocks
│   └── router.ts     # Router service mocks
├── ui/               # UI component mocks
│   ├── icons.tsx    # Icon component mocks
│   └── search.tsx   # Search component mocks
└── index.ts         # Central export point
```

### Mock Types and Usage

1. **Data Mocks** (`/data`)

   - Mock data structures matching production interfaces
   - Factory functions for generating test data
   - Consistent with API response formats
   - Used in both component and integration tests

2. **Service Mocks** (`/services`)

   - `api.ts`: API response mocks and fetch mock
   - `router.ts`: Next.js router mocks
   - Used for mocking external dependencies
   - Consistent error handling patterns

3. **UI Mocks** (`/ui`)
   - `icons.tsx`: SVG icon component mocks
   - `search.tsx`: Search component mocks
   - Used for complex component dependencies
   - Maintain component interfaces

### Import Guidelines

```typescript
// Always import from the centralized location
import { mockAnalysisData } from '@test-utils/mocks/data/analysis';
import { mockRouter } from '@test-utils/mocks/services/router';
import { Icons } from '@test-utils/mocks/ui/icons';
```

### Mock Data Guidelines

1. Use TypeScript interfaces
2. Keep mock data minimal
3. Use factory functions
4. Document deviations
5. Maintain consistency

## Tech Stack

### Core

- **Frontend Framework**: React with TypeScript
- **UI Components**: Radix UI primitives with Tailwind CSS
- **State Management**: React Context + Hooks
- **Build Tool**: Vite
- **Package Manager**: pnpm

### Testing

- **Unit Testing**: Jest + React Testing Library
- **E2E Testing**: Cypress + Playwright
- **Test Runner**: Vitest

### Code Quality

- **Linting**: ESLint
- **Formatting**: Prettier
- **Type Checking**: TypeScript
- **Git Hooks**: Husky + lint-staged

## Testing

### Test Structure

The project's test files are organized in `src/__tests__/` with the following structure:

```
src/__tests__/
├── e2e/                 # End-to-end tests
│   ├── components/      # Component E2E tests
│   ├── hooks/          # Hook E2E tests
│   └── services/       # Service E2E tests
├── integration/         # Integration tests
│   ├── components/     # Component integration tests
│   ├── hooks/         # Hook integration tests
│   └── services/      # Service integration tests
├── performance/        # Performance tests
│   ├── components/    # Component performance tests
│   ├── hooks/        # Hook performance tests
│   └── services/     # Service performance tests
└── test-utils/        # Testing utilities
    ├── mocks/        # Reusable mocks
    └── render.tsx    # Custom render utilities
```

### Test Setup

The project uses Vitest as the test runner with React Testing Library. Key setup files:

- `src/__tests__/setup.ts`: Global test setup and configuration
- `src/__tests__/test-utils/render.tsx`: Custom render functions with providers
- `src/__tests__/test-utils/mocks/`: Shared mock implementations

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage

# Run specific test file
pnpm test [test-file-pattern]

# Run tests in specific directory
pnpm test [directory-pattern]

# Run E2E tests
pnpm test:e2e

# Run performance tests
pnpm test:perf
```

### Testing Guidelines

### Frontend Testing

#### Event Testing

When testing React components that handle events (e.g., onChange, onFocus, onBlur), follow these guidelines:

1. **Use React Testing Library's Built-in Methods First**

   ```typescript
   import { render, screen, fireEvent } from '@testing-library/react';

   // Preferred approach
   fireEvent.change(input, { target: { value: 'test' } });
   fireEvent.focus(input);
   fireEvent.blur(input);
   ```

2. **For Complex User Interactions, Use `userEvent`**

   ```typescript
   import userEvent from '@testing-library/user-event';

   const user = userEvent.setup();
   await user.type(input, 'test');
   await user.tab();
   ```

3. **When Testing Event Handlers Directly, Use React Synthetic Events**

   ```typescript
   // Create a proper React synthetic event
   const syntheticEvent = {
     target: { value: 'test' },
     currentTarget: { value: 'test' },
     preventDefault: () => {},
     stopPropagation: () => {},
     nativeEvent: new Event('change'),
   } as React.ChangeEvent<HTMLInputElement>;

   // Call the handler directly
   handleChange(syntheticEvent);
   ```

4. **Avoid Native DOM Events**

   ```typescript
   // ❌ Don't use native DOM events
   const event = new Event('change');
   input.dispatchEvent(event);

   // ✅ Use React Testing Library's methods
   fireEvent.change(input, { target: { value: 'test' } });
   ```

#### Component Query Best Practices

1. **Query Priority (from most to least preferred)**:

   - `getByRole` - Most accessible and recommended
   - `getByLabelText` - Good for form fields
   - `getByPlaceholderText` - Acceptable for search fields
   - `getByText` - Good for buttons and headings
   - `getByTestId` - Last resort, use only when necessary

2. **Handle Hidden Elements**:

   ```typescript
   // For inputs that might be hidden (e.g., password fields)
   screen.getByRole('textbox', { hidden: true });
   ```

3. **Multiple Query Methods**:
   ```typescript
   // Use logical OR for flexible queries
   const input = screen.getByRole('textbox') || screen.getByDisplayValue('');
   ```

### Common Testing Patterns

#### Form Components

```typescript
describe('Form Component', () => {
  it('submits form data correctly', async () => {
    const handleSubmit = vi.fn();
    render(<Form onSubmit={handleSubmit} />);

    // Fill out form fields
    await userEvent.type(screen.getByLabelText('Username'), 'testuser');
    await userEvent.type(screen.getByLabelText('Password'), 'password123');

    // Submit form
    await userEvent.click(screen.getByRole('button', { name: /submit/i }));

    // Verify submission
    expect(handleSubmit).toHaveBeenCalledWith({
      username: 'testuser',
      password: 'password123'
    });
  });
});
```

#### Async Components

```typescript
describe('Async Component', () => {
  it('handles loading and success states', async () => {
    render(<AsyncComponent />);

    // Check loading state
    expect(screen.getByRole('progressbar')).toBeInTheDocument();

    // Wait for content
    await screen.findByRole('article');

    // Verify loading is done
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });
});
```

#### MetricCard Components

```typescript
describe('MetricCard Component', () => {
  it('displays metric value and label', () => {
    render(<MetricCard value={42} label="Test Metric" />);

    // Verify metric value
    expect(screen.getByText('42')).toBeInTheDocument();

    // Verify metric label
    expect(screen.getByText('Test Metric')).toBeInTheDocument();
  });
});
```

#### Tooltip Components

```typescript
describe('Component with Tooltip', () => {
  it('displays tooltip content on hover', async () => {
    // Set up userEvent for better interaction simulation
    const user = userEvent.setup();

    // Render component with necessary providers
    render(
      <TooltipProvider>
        <ComponentWithTooltip />
      </TooltipProvider>
    );

    // Find the tooltip trigger
    const trigger = screen.getByTestId('tooltip-trigger');

    // Simulate hover
    await user.hover(trigger);

    // Wait for and verify tooltip content
    await waitFor(() => {
      const tooltip = screen.getByTestId('tooltip-content');
      expect(tooltip).toHaveTextContent('Expected tooltip content');
    });
  });
});
```

Key points for testing tooltips:

1. Always wrap components with necessary providers (e.g., `TooltipProvider`)
2. Use `@testing-library/user-event` for hover interactions
3. Use `waitFor` to handle asynchronous tooltip rendering
4. Add appropriate test IDs to tooltip trigger and content
5. Consider portal rendering when testing tooltips

### Setting Up the Test Environment

1. Install dependencies:

```bash
pnpm install
```

2. Build the project:

```bash
pnpm build
```

### Running Tests

#### Quick Start

Run all tests:

```bash
pnpm test
```

#### Specific Test Types

1. Unit Tests:

```bash
# Run all unit tests
pnpm test:unit

# Run specific unit test file
pnpm test src/__tests__/unit/components/ui/Button.test.tsx

# Run tests in watch mode
pnpm test:watch
```

2. Component Tests:

```bash
# Run all component tests
pnpm test:components

# Run tests for specific component
pnpm test src/__tests__/unit/components/<ComponentName>.test.tsx
```

3. Integration Tests:

```bash
pnpm test:integration
```

4. E2E Tests:

```bash
pnpm test:e2e
```

### Test Coverage

Generate and view test coverage report:

```bash
# Generate coverage report
pnpm test:coverage

# Open coverage report in browser
pnpm test:coverage:open
```

### Writing Tests

#### Component Test Template

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@test-utils/render';
import { ComponentName } from '@/components/path/to/Component';

describe('ComponentName', () => {
  it('renders successfully', () => {
    render(<ComponentName />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('handles user interactions', async () => {
    const { user } = render(<ComponentName />);
    const button = screen.getByRole('button');
    await user.click(button);
    // Add assertions
  });
});
```

#### Testing Utilities

1. Custom Render:

```typescript
import { render } from '@test-utils/render';

// Includes setup for:
// - Custom user event instance
// - Common provider wrappers
// - Vitest mocks
const { user } = render(<Component />);
```

2. Common Matchers:

```typescript
// DOM matchers
expect(element).toBeInTheDocument();
expect(element).toHaveClass('class-name');
expect(element).toHaveAttribute('attr', 'value');

// Event handlers
expect(handleClick).toHaveBeenCalledTimes(1);
```

### Test Organization

Tests are organized following a co-located structure:

```
src/
├── components/
│   └── ComponentName/
│       ├── ComponentName.tsx
│       ├── ComponentName.test.tsx
│       └── __snapshots__/
├── __tests__/
│   └── test-utils/
│       └── mocks/
│           ├── data/               # Mock data files
│           ├── ui.tsx             # UI component mocks
│           └── api.ts            # API endpoint mocks
└── types/
    ├── analysis.ts               # Analysis-related types
    └── errors.ts                # Error-related types

cypress/
├── component/                   # Component test files
│   ├── AnalysisChart.cy.tsx
│   └── ...
└── support/
    ├── commands.ts             # Custom Cypress commands
    └── test-utils.ts          # Test utility functions
```

### Best Practices

1. **Pattern Creation**

   - Use clear, descriptive names
   - Provide comprehensive examples
   - Include detailed documentation
   - Set appropriate weights
   - Test with various codebases
   - **Focus on adaptability and reuse**
   - **Document adaptation requirements**
   - **Provide generalization guidelines**

2. **Pattern Management**

   - Version patterns appropriately
   - Document changes
   - Validate before sharing
   - Monitor pattern effectiveness
   - Update based on feedback
   - **Track adaptation success rates**
   - **Collect adaptation feedback**
   - **Update adaptation guides**

3. **Pattern Detection**
   - Set appropriate confidence thresholds
   - Handle edge cases
   - Provide clear feedback
   - Monitor performance
   - Log detection issues
   - **Identify adaptation opportunities**
   - **Suggest pattern generalizations**
   - **Flag implementation-specific patterns**

### Features

### Repository Management

- View all repositories in a grid layout
- Search repositories by name or description
- Filter repositories by status (All/Starred/Archived)
- Quick access to repository analysis
- Visual indicators for repository status

### Analysis Features

- Code quality metrics visualization
- Pattern detection and analysis
- Hotspot identification
- Actionable suggestions
- Detailed pattern instances

## Next Steps

1. Implement repository creation flow
2. Add repository analysis page
3. Create visualization components for metrics
4. Add pattern comparison functionality
5. Implement export features

## Project Structure

### Core Directories

1. `src/components/`: React components organized by feature and type
2. `src/hooks/`: Custom React hooks for shared logic
3. `src/lib/`: Utility functions and shared code
4. `src/pages/`: Page components and routing
5. `src/services/`: API and external service integrations
6. `src/styles/`: Global styles and theme configuration
7. `src/__tests__/`: Test files and test utilities

### Hooks Organization

Located in `src/hooks/`, our hooks are organized into the following categories:

1. **Data Management Hooks**

   - `usePatterns.ts`: Pattern data management
   - `useCategories.ts`: Category data management
   - `useRepository.ts`: Repository data management
   - `useSearch.ts`: Search functionality
   - `useUpdates.ts`: Update history management

2. **Pattern Analysis Hooks**

   - `usePatternAnalysis.ts`: Pattern analysis logic
   - `usePatternDependencies.ts`: Pattern dependency tracking
   - `usePatternImplementation.ts`: Pattern implementation details
   - `usePatternValidation.ts`: Pattern validation logic
   - `usePatternHistory.ts`: Pattern history tracking

3. **Testing and Development Hooks**

   - `usePatternMocks.ts`: Mock data for patterns
   - `usePatternSpies.ts`: Test spies for pattern operations
   - `usePatternTestData.ts`: Test data management
   - `usePatternTests.ts`: Test execution helpers
   - `useMockPatternData.ts`: Mock data generation

4. **Analytics and Monitoring**

   - `useErrorAnalytics.ts`: Error tracking
   - `usePatternAnalytics.ts`: Pattern usage analytics
   - `usePerformanceMonitor.ts`: Performance monitoring

5. **UI and State Management**

   - `useToast.ts`: Toast notifications
   - `useTheme.ts`: Theme management
   - `useMediaQuery.ts`: Responsive design helpers
   - `useActivityStorage.ts`: Activity state persistence

6. **API and Error Handling**
   - `useApiError.ts`: API error handling
   - `useRetryableQuery.ts`: Retryable API queries
   - `useRepoQueries.ts`: Repository-related queries

### Hook Usage Guidelines

1. **Naming Conventions**

   - Use camelCase for hook names
   - Prefix with 'use'
   - Be descriptive about functionality
   - Example: `usePatternAnalysis`, `useTheme`

2. **File Organization**

   - One hook per file
   - Group related hooks in subdirectories if needed
   - Keep test files in `__tests__/unit/hooks/`

3. **Documentation**

   - Include TypeScript interfaces
   - Document parameters and return values
   - Add usage examples
   - Explain side effects

4. **Testing**

   - Write unit tests for all hooks
   - Test error cases
   - Mock external dependencies
   - Test with different parameters

5. **Best Practices**
   - Keep hooks focused and single-purpose
   - Handle cleanup in useEffect
   - Memoize callbacks and values
   - Handle loading and error states

## UX Components and Organization

The RepoAnalyzer app uses a structured approach to UX components to ensure consistency, maintainability, and a smooth user experience:

### Core UX Components

1. **Loaders**

   - `ContentLoader.tsx`: Generic skeleton loader for content states
   - `RepositoryLoader.tsx`: Specific loader for repository components
   - `PatternLoader.tsx`: Specific loader for pattern components
   - `ComparisonLoader.tsx`: Specific loader for comparison views

2. **Error Handling**

   - `ErrorBoundary.tsx`: React error boundary for graceful error handling
   - Integrated with error analytics for tracking and debugging
   - Provides fallback UI with retry options

3. **Transitions**
   - `PageTransition.tsx`: Smooth transitions between routes
   - `ComponentTransition.tsx`: Configurable transitions for component mounting/unmounting
   - Supports fade, slide, and scale animations

### Component Organization

```
frontend/src/components/
├── common/
│   ├── errors/
│   │   └── ErrorBoundary.tsx
│   ├── loaders/
│   │   ├── ContentLoader.tsx
│   │   ├── RepositoryLoader.tsx
│   │   ├── PatternLoader.tsx
│   │   ├── ComparisonLoader.tsx
│   │   └── index.ts
│   └── transitions/
│       ├── PageTransition.tsx
│       └── ComponentTransition.tsx
├── repositories/
│   └── RepositoryDashboard.tsx
└── patterns/
    └── PatternDetailView.tsx
```

### UX Guidelines

1. **Loading States**

   - Use appropriate loader components for content states
   - Implement progressive loading for better perceived performance
   - Show skeleton loaders for content that takes >300ms to load

2. **Error Handling**

   - Wrap main components with ErrorBoundary
   - Provide clear error messages and recovery options
   - Error reporting functionality
   - Consistent error message format

3. **Transitions**

   - Keep transitions under 500ms
   - Use appropriate effects for context
   - Consider reduced motion preferences
   - Ensure smooth animations

4. **Component Best Practices**
   - Keep components focused and single-responsibility
   - Use compound components for complex UX patterns
   - Implement progressive enhancement
   - Follow accessibility guidelines

### Implementation Examples

```tsx
// Code splitting with retry mechanism
function RepositoryList() {
  const fetchRepositories = useRetry(
    async () => {
      const response = await api.getRepositories();
      return response.data;
    },
    {
      queueing: true,
      timeout: 5000,
      retryOnNetworkChange: true,
      onRetry: attempt => {
        analytics.logRetryAttempt(attempt);
      },
    }
  );

  return (
    <ErrorBoundary>
      {' '}
      // Global error boundary
      <ThemeProvider>
        <LoadingProvider>
          <RouterProvider router={router} /> // Route error boundary
          <Routes>
            <Route
              element={
                <ErrorBoundary>
                  {' '}
                  // Component error boundary
                  <ComponentPage />
                </ErrorBoundary>
              }
            />
          </Routes>
          <Toaster />
        </LoadingProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
```

### Implementation Examples

1. **Smart Navigation**

```tsx
function Navigation() {
  const { attachPrefetch } = usePrefetch(['/patterns', '/search']);

  return (
    <nav>
      <Link ref={el => attachPrefetch(el, '/patterns')}>Patterns</Link>
    </nav>
  );
}
```

2. **Resilient Data Fetching**

```tsx
function DataFetcher() {
  const fetchData = useRetry(
    async () => {
      const response = await api.getData();
      return response.data;
    },
    {
      queueing: true,
      timeout: 5000,
      retryOnNetworkChange: true,
      onRetry: attempt => {
        analytics.logRetryAttempt(attempt);
      },
    }
  );

  return (
    <div>
      <Button onClick={fetchData.execute}>Fetch Data</Button>
      {fetchData.loading && <Spinner />}
      {fetchData.error && (
        <div>
          Error: {fetchData.error.message}
          <Button onClick={fetchData.reset}>Try Again</Button>
        </div>
      )}
    </div>
  );
}
```

### Best Practices

1. **Prefetching**

   - Use low priority for non-critical resources
   - Consider user's data plan
   - Implement progressive enhancement
   - Monitor bandwidth usage

2. **Retry Mechanism**

   - Configure appropriate timeouts
   - Use error filtering
   - Implement proper cleanup
   - Monitor retry statistics

3. **Performance Monitoring**
   - Track success rates
   - Monitor execution times
   - Log retry patterns
   - Analyze failure causes

### Pattern Management Hooks

The application uses several hooks to manage patterns:

### Core Pattern Hooks

- `usePattern`: Manages operations for a single pattern (fetch/update/delete)
- `usePatterns`: Manages collection operations (list all, create new)

### Pattern Analysis Hooks

- `usePatternAnalysis`: Analyzes pattern structure and impact
- `usePatternAnalytics`: Tracks pattern usage and metrics
- `usePatternDependencies`: Manages pattern dependencies
- `usePatternHistory`: Tracks pattern version history
- `usePatternImplementation`: Handles pattern implementation details
- `usePatternSearch`: Provides pattern search functionality
- `usePatternValidation`: Validates pattern data and structure

### Pattern Testing Hooks

- `usePatternMocks`: Provides mock data for pattern testing
- `usePatternSpies`: Provides spy utilities for pattern testing
- `usePatternTestData`: Manages test data for patterns
- `usePatternTests`: Manages pattern test execution

## Error Boundary System

The application implements a comprehensive error boundary system with three layers of protection:

#### 1. Route Error Boundary

- Handles route-specific errors (404, 403, 500)
- Custom error pages for different error types
- Navigation options for recovery
- Development mode stack traces
- Located in `src/components/common/error/RouteErrorBoundary.tsx`

#### 2. Component Error Boundary

- Catches errors in component trees
- Prevents entire app from crashing
- Provides fallback UI
- Error reporting functionality
- Located in `src/components/common/error/ErrorBoundary.tsx`

#### 3. Global Error Boundary

- Top-level error catching
- Last line of defense
- Maintains app stability
- Error logging and reporting
- Applied in `App.tsx`

### Error Handling Implementation

```typescript
// Example of nested error boundaries
<ErrorBoundary> // Global error boundary
  <ThemeProvider>
    <LoadingProvider>
      <RouterProvider router={router} /> // Route error boundary
      <Routes>
        <Route
          element={
            <ErrorBoundary> // Component error boundary
              <ComponentPage />
            </ErrorBoundary>
          }
        />
      </Routes>
      <Toaster />
    </LoadingProvider>
  </ThemeProvider>
</ErrorBoundary>
```

### Error Recovery Strategies

1. Automatic Recovery

   - Retry mechanisms for transient errors
   - Automatic refresh for stale data
   - Cache fallback for offline scenarios

2. Manual Recovery

   - "Try Again" button for user-initiated retry
   - "Return Home" option for navigation
   - Clear error state on route change

3. Error Prevention
   - Input validation
   - Type checking
   - API error handling
   - Loading states

### Error Reporting

The error boundary system includes:

- Error logging to console
- Stack trace capture
- Error metadata collection
- Development mode debugging
- Production error filtering

### Pages Overview

#### Analysis Page (`/analysis/:id`)

- Repository analysis overview
- Key metrics dashboard
- Pattern detection results
- Contributor statistics
- Loading states and error handling

#### Pattern Details Page (`/patterns/:id`)

- Detailed pattern information
- Code examples with syntax highlighting
- Alternative patterns
- Usage metrics and impact analysis
- Loading states for each section

#### Search Page (`/search`)

- Pattern search functionality
- Real-time search results
- Loading states during search
- Error handling for failed searches

#### Compare Page (`/compare`)

- Repository comparison tool
- Metric visualization
- Loading states during comparison
- Error handling for failed comparisons

#### Settings Page (`/settings`)

- User preferences
- GitHub integration
- Analysis configuration
- Loading states for settings
- Error handling for save operations

### Loading States Implementation

Each page implements loading states using the following components:

- `WithLoadingAndError`: HOC for managing loading and error states
- `LoadingPlaceholder`: Skeleton loading UI for content
- `ErrorDisplay`: Error handling with retry functionality
- `Toast`: User feedback for actions and errors

### Error Handling Strategy

1. Component Level

   - Use `WithLoadingAndError` HOC
   - Show appropriate error messages
   - Provide retry functionality

2. Route Level

   - Error boundaries for route-specific errors
   - Fallback UI for critical failures
   - Navigation options for recovery

3. Global Level
   - Toast notifications for transient errors
   - Error logging and tracking
   - Consistent error message format

### Toast Notification System

Implemented using Radix UI with:

- Success/error/warning variants
- Automatic dismissal
- Action buttons when needed
- Accessible design
- Consistent positioning

### Component Structure

```
src/
├── components/
│   ├── common/
│   │   ├── error/
│   │   │   └── ErrorDisplay.tsx    # Consistent error presentation
│   │   ├── loading/
│   │   │   └── LoadingPlaceholder.tsx  # Loading state component
│   │   └── withLoadingAndError.tsx # HOC for loading/error states
│   └── ...
├── __tests__/
│   └── test-utils/
│       └── mocks/
│           ├── data/               # Mock data files
│           ├── ui.tsx             # UI component mocks
│           └── api.ts            # API endpoint mocks
└── types/
    ├── analysis.ts               # Analysis-related types
    └── errors.ts                # Error-related types

cypress/
├── component/                   # Component test files
│   ├── AnalysisChart.cy.tsx
│   └── ...
└── support/
    ├── commands.ts             # Custom Cypress commands
    └── test-utils.ts          # Test utility functions
```

### Loading States

- Use appropriate loader components for content states
- Implement progressive loading for better perceived performance
- Show skeleton loaders for content that takes >300ms to load
- Provide clear loading messages for long operations

### Error Handling

- Proper error boundaries at route level
- Consistent error messages with retry options
- Toast notifications for transient errors
- Detailed error logging for debugging

### Toast Notifications

- Success/error/warning variants
- Automatic dismissal
- Action support
- Accessible notifications

## Error Tracking System

The application uses Sentry for comprehensive error tracking and monitoring. This helps us identify, track, and fix issues before they affect users.

### Error Tracking Components

1. Error Service (`src/services/errorTracking.ts`)

   - Initializes Sentry configuration
   - Provides error capture utilities
   - Handles user context
   - Manages environment-specific behavior

2. Error Boundaries

   - Component Error Boundary (`src/components/common/error/ErrorBoundary.tsx`)
     - Catches component tree errors
     - Shows fallback UI
     - Reports to Sentry
   - Route Error Boundary (`src/components/common/error/RouteErrorBoundary.tsx`)
     - Handles routing errors
     - Custom error pages
     - Navigation recovery

3. Integration Points
   - Global error boundary in `App.tsx`
   - Route-level boundaries for each page
   - Component-level boundaries for critical features
   - API error tracking in services

### Configuration

1. Environment Variables

```env
REACT_APP_SENTRY_DSN=your-sentry-dsn
REACT_APP_SENTRY_ENVIRONMENT=production
```

2. Dependencies

```json
{
  "@sentry/react": "^7.64.0",
  "@sentry/tracing": "^7.64.0"
}
```

### Error Types and Handling

1. Component Errors

   - React rendering errors
   - State management errors
   - Props validation errors
   - Recovery: Fallback UI with retry option

2. Route Errors

   - 404 Not Found: Custom not found page
   - 403 Forbidden: Access denied page
   - 500 Server Error: Technical error page
   - Recovery: Navigation options

3. API Errors
   - Network failures: Retry with backoff
   - Response parsing errors: Error notification
   - Timeout errors: Retry with timeout increase

### Error Recovery Flow

1. Error Detection

   - Error occurs in component or route
   - Error boundary catches the error
   - Error details captured

2. Error Reporting

   - Error sent to Sentry
   - Error logged to console in development
   - User notified via toast

3. Recovery Options
   - Automatic retry for transient errors
   - Manual retry button
   - Return to home page
   - Report feedback option

### Development vs Production

1. Development Mode

   - Full error stack traces visible
   - Detailed error messages
   - Console logging enabled
   - No Sentry reporting

2. Production Mode
   - Sanitized error messages
   - Sentry error tracking
   - User feedback collection
   - Minimal error details exposed

## Core Testing Plan (February 17, 2025)

### 1. Repository Analysis Tests

```typescript
// RepositoryLoader.cy.tsx
describe('Repository Loading', () => {
  it('loads local repository successfully');
  it('validates repository structure');
  it('handles invalid repository path');
  it('shows appropriate loading states');
});
```

### 2. Analysis Table Tests

```typescript
// AnalysisTable.cy.tsx
describe('Analysis Table', () => {
  it('displays repository metrics correctly');
  it('sorts metrics by column');
  it('filters metrics by search');
  it('handles empty state');
  it('updates when new data arrives');
});
```

### 3. Navigation Tests

```typescript
// Navigation.cy.tsx
describe('Core Navigation', () => {
  it('navigates between main views');
  it('preserves state during navigation');
  it('handles invalid routes');
  it('shows active navigation state');
});
```

### 4. Data Flow Tests

```typescript
// DataFlow.cy.tsx
describe('Core Data Flow', () => {
  it('propagates repository data to components');
  it('updates components when data changes');
  it('maintains consistency across views');
  it('handles data loading states');
});
```

### Test Implementation Priority

1. Analysis Table Tests

   - Core display functionality
   - Basic user interactions
   - Data presentation

2. Repository Loading Tests

   - Basic repository validation
   - Loading process
   - Error states

3. Navigation Tests

   - Route changes
   - State preservation
   - Error handling

4. Data Flow Tests
   - Component updates
   - State management
   - Loading states
   - Error states

### Test Success Criteria

- All tests must pass with mock data
- Core user flows must be verified
- Loading and error states must be tested
- Basic interactions must work
- Data display must be accurate

### Not Included in Core Tests

- Performance metrics
- Advanced features
- Real API integration
- Complex user interactions
- Edge cases
- Accessibility (deferred)

## Test Organization Update (February 17, 2025)

#### Test Directory Structure

```
src/__tests__/
├── test-utils/
│   ├── mocks/
│   │   ├── ui/                 # UI component mocks (tabs, buttons, etc.)
│   │   │   ├── index.ts       # Exports all UI mocks
│   │   │   └── tabs.tsx       # Tab component mocks
│   │   ├── data/              # Mock data by feature
│   │   │   ├── patterns/      # Pattern-related mock data
│   │   │   └── metrics/       # Metrics-related mock data
│   │   └── services/          # Service mocks (API, state, etc.)
│   └── index.ts               # Exports test utilities and setup
└── unit/
    └── components/            # Component test files
```

#### Mock Implementation Strategy

1. **UI Component Mocks**:

   - Simple implementations focused on core functionality
   - Use data-testid for element selection
   - Maintain state for interactive components
   - Avoid unnecessary complexity

2. **Test Data Organization**:

   - Centralize mock data in dedicated files
   - Use factory functions for test data
   - Share mock data across related tests
   - Keep data structure consistent with production

3. **Test File Structure**:
   - Group related tests with describe blocks
   - Test core functionality first
   - Test user interactions
   - Test state changes and updates
   - Test error cases last

#### Recent Changes

- Moved UI mocks to dedicated directory
- Simplified tab component testing
- Removed accessibility testing until production data is ready
- Updated test assertions to focus on visibility and content
- Using userEvent for interactions

#### Next Steps

1. Move existing mocks to appropriate directories
2. Create index.ts files for each mock category
3. Update import paths in test files
4. Remove duplicate mock implementations

## Frontend Test Infrastructure

### Directory Structure

```
src/__tests__/
├── test-utils/
│   ├── mocks/
│   │   ├── ui.tsx          # UI component mocks (Card, Button, etc.)
│   │   ├── services.ts    # Service mocks (logger, API, etc.)
│   │   └── data.ts        # Mock data factories
│   ├── test-wrapper.tsx # Test wrapper with providers
│   └── setup.ts         # Test setup and configuration
└── unit/
    └── components/      # Component tests
```

### Testing Best Practices

1. Mock Organization

   - All mocks MUST be in `src/__tests__/test-utils/mocks/`
   - Separate by type (ui, services, data)
   - Export through index.ts files
   - Use TypeScript for type safety
   - No duplicate mock implementations
   - No inline mock data

2. Test File Structure

   ```typescript
   import { render, screen } from '@test-utils';
   import { userEvent } from '@testing-library/user-event';
   import { ComponentName } from '@/components';
   import { TestWrapper } from '@test-utils/test-wrapper';
   import { mockData } from '@test-utils/mocks/data';
   import { mockServices } from '@test-utils/mocks/services';

   describe('ComponentName', () => {
     beforeEach(() => {
       // Setup before each test
     });

     const renderComponent = (props = {}) => {
       return render(
         <TestWrapper>
           <ComponentName {...props} />
         </TestWrapper>
       );
     };

     it('renders correctly', () => {
       renderComponent();
       // Test rendering using ARIA roles
     });

     it('handles user interactions', async () => {
       renderComponent();
       // Test interactions using userEvent
     });

     it('meets accessibility requirements', async () => {
       const { container } = renderComponent();
       // Test ARIA roles and run axe
     });
   });
   ```

3. Component Testing Guidelines

   - Use ARIA roles for element selection
   - Test user interactions with userEvent
   - Verify rendered content
   - Test state changes
   - Use ARIA roles/labels
   - Test accessibility with axe

4. Mock Data Management

   - Keep mock data in `src/__tests__/test-utils/mocks/data/`
   - Use factory functions for test data
   - Follow production TypeScript interfaces
   - Document data structure

5. Test Organization

   - Group related tests with describe blocks
   - Use clear test descriptions
   - One assertion per test when possible
   - Keep tests focused and isolated

6. Error Testing
   - Test error boundaries
   - Verify error messages
   - Test recovery paths
   - Mock error scenarios

### Recently Updated Tests

1. LogViewer Test

   - Added TestWrapper integration
   - Moved logger mocks to services
   - Added accessibility testing
   - Improved error handling coverage
   - Using userEvent for interactions

2. ErrorMetrics Test
   - Using ARIA roles for selection
   - Added accessibility tests
   - Better test organization
   - Improved mock data structure
   - Using userEvent for interactions

### Next Steps

1. Continue updating remaining test files:

   - MetricsVisualization
   - PatternViewer
   - SearchInterface

2. Add missing test coverage:

   - Error boundaries
   - Loading states
   - Edge cases

3. Improve documentation:
   - Add more examples
   - Document common patterns
   - Create troubleshooting guide

## Performance Test Scenarios (February 17, 2025)

1. **Large Dataset Tests**

   ```typescript
   // Test with various dataset sizes
   mockDatasets.small; // 100 rows
   mockDatasets.medium; // 1,000 rows
   mockDatasets.large; // 10,000 rows
   mockDatasets.extreme; // 100,000 rows
   ```

2. **Performance Metrics**

   - Initial render time (target: <1000ms)
   - Sort operation time (target: <100ms)
   - Filter operation time (target: <100ms)
   - Scroll performance (target: <200ms)
   - Memory usage (<100MB for extreme datasets)

3. **Edge Case Scenarios**

   ```typescript
   // Test specific data patterns
   generateTestDataset('sorted'); // Pre-sorted data
   generateTestDataset('reverse'); // Reverse sorted
   generateTestDataset('duplicates'); // Duplicate values
   generateTestDataset('long-names'); // Long text content
   ```

4. **Test Coverage**

   - Large dataset rendering
   - Sorting performance
   - Filter operations
   - Scrolling behavior
   - Window resizing
   - Column visibility
   - Memory management
   - Extreme data handling

5. **Performance Monitoring**
   ```typescript
   // Monitor real-time metrics
   usePerformanceMonitor({
     logToConsole: true,
     onMetricsUpdate: metrics => {
       // Track FPS, memory, DOM nodes
     },
   });
   ```

## Mock Files and Their Purposes

1. **Analysis Mocks**

   - `src/__tests__/test-utils/mocks/services/analysisService.ts`: Service-level mocks for analysis API
     - `mockAnalysisService`: Mock service with analyze, getPatterns, and getMetrics functions
     - `mockAnalysisResult`: Base analysis result data
     - `mockPatterns`: Pattern instance data
     - `mockMetrics`: Code quality metrics data

2. **Pattern Mocks**

   - `src/__tests__/test-utils/mocks/patternExamples.ts`: Pattern-specific mock data
     - `mockPatternData`: Single pattern example with full metadata
     - `mockAnalysisResult`: Simplified analysis result focused on patterns

3. **Analysis Data**

   - `src/__tests__/test-utils/mocks/analysisData.ts`: Unit test mock data
     - `mockMetrics`: Detailed metrics data
     - `mockAnalysisResult`: Full analysis result structure

4. **Import Guidelines**

   ```typescript
   // Always import from the centralized location
   import { mockAnalysisService } from '@test-utils/mocks/services';
   import { mockPatternData } from '@test-utils/mocks/data/patterns';
   import { mockMetrics } from '@test-utils/mocks/data/metrics';
   ```

5. **Usage in Tests**

   ```typescript
   describe('AnalysisComponent', () => {
     beforeEach(() => {
       // Use the mock service
       vi.mock('@/services/analysis', () => mockAnalysisService);
     });

     it('displays analysis results', () => {
       render(<AnalysisComponent />);
       // Test implementation
     });
   });
   ```

6. **Mock Data Guidelines**

   - Keep mock data separate from test files
   - Use factory functions for test data
   - Follow production TypeScript interfaces
   - Document any deviations from production data structure
   - Maintain backward compatibility when updating mocks

7. **Deprecation Notes**
   - Direct usage of mock objects is deprecated
   - Use factory functions from `@test-utils/mocks/data/analysis` instead
   - Old mock exports will be removed in future updates

## Component Testing Learnings (February 17, 2025)

#### Key Testing Insights

1. **Test Data Management**

   - Keep mock data in centralized location (`src/__tests__/test-utils/mocks/data/`)
   - Use consistent data structure across tests
   - Avoid inline mock data
   - Document data structure deviations

2. **Component Test Structure**

   ```typescript
   describe('ComponentName', () => {
     beforeEach(() => {
       // Setup before each test
     });

     const renderComponent = (props = {}) => {
       return render(
         <TestWrapper>
           <ComponentName {...props} />
         </TestWrapper>
       );
     };

     it('renders correctly', () => {
       renderComponent();
       // Test rendering using ARIA roles
     });

     it('handles user interactions', async () => {
       renderComponent();
       // Test interactions using userEvent
     });

     it('meets accessibility requirements', async () => {
       const { container } = renderComponent();
       // Test ARIA roles and run axe
     });
   });
   ```

3. **Common Testing Patterns**

   - Test loading states with proper visibility
   - Test sorting in both directions
   - Test pagination with correct data
   - Test error states and recovery
   - Test empty states

4. **Testing Gotchas**
   - Ensure loading states are visible before assertions
   - Handle async operations properly
   - Test both ascending and descending sorts
   - Verify data transformations
   - Check component state after interactions

## Next Steps for Working Prototype

1. **Backend Integration**

   - [ ] Connect frontend to backend API
   - [ ] Implement proper error handling
   - [ ] Add retry logic for failed requests
   - [ ] Add request caching

2. **Authentication**

   - [ ] Add login/signup flow
   - [ ] Implement session management
   - [ ] Add protected routes
   - [ ] Handle token refresh

3. **Data Management**

   - [ ] Implement proper state management
   - [ ] Add data persistence
   - [ ] Handle offline mode
   - [ ] Add data sync

4. **User Experience**

   - [ ] Add loading indicators
   - [ ] Improve error messages
   - [ ] Add success notifications
   - [ ] Implement undo/redo

5. **Testing**

   - [ ] Add end-to-end tests
   - [ ] Add integration tests
   - [ ] Add performance tests
   - [ ] Add API mocking

6. **Deployment**

   - [ ] Setup CI/CD pipeline
   - [ ] Add environment configurations
   - [ ] Setup monitoring
   - [ ] Add logging

7. **Documentation**
   - [ ] Add API documentation
   - [ ] Add setup instructions
   - [ ] Add deployment guide
   - [ ] Add contribution guide

## Current Status

1. **Completed Features**

   - Basic component structure
   - Component unit tests
   - Performance optimizations
   - Error handling
   - Loading states
   - Data sorting and filtering
   - Pagination

2. **In Progress**

   - Backend integration
   - Authentication flow
   - State management
   - End-to-end testing

3. **Upcoming**
   - Deployment setup
   - CI/CD pipeline
   - Documentation
   - Performance monitoring

## Prototype Development Plan {#prototype-development-plan}

### Current Priority: Frontend Prototype with Mock Data

#### Phase 1: Core UI Components ⏳

1. **Update Project Structure**

   ```
   src/
   ├── components/
   │   ├── repository/           # New directory
   │   │   ├── RepositoryForm.tsx
   │   │   ├── RepositoryList.tsx
   │   │   └── RepositoryCard.tsx
   │   ├── navigation/          # New directory
   │   │   ├── MainNav.tsx
   │   │   └── NavLink.tsx
   │   └── layout/             # Existing
   │       └── MainLayout.tsx  # Update with navigation
   ```

2. **Component Implementation Order**

   a. **RepositoryForm** (`src/components/repository/RepositoryForm.tsx`)

   ```typescript
   interface RepositoryFormProps {
     onSubmit: (url: string) => void;
     isLoading?: boolean;
   }
   ```

   - URL validation regex: `/^https?:\/\/(github\.com|gitlab\.com|bitbucket\.org)\/[\w-]+\/[\w-]+$/`
   - Error states: Invalid URL, Empty URL
   - Loading state during submission

   b. **RepositoryList** (`src/components/repository/RepositoryList.tsx`)

   ```typescript
   interface RepositoryListProps {
     repositories: Repository[];
     onSelect: (id: string) => void;
   }
   ```

   - Use existing Card component
   - Add status badges
   - Add last analyzed time

   c. **Navigation** (`src/components/navigation/MainNav.tsx`)

   ```typescript
   interface NavItem {
     path: string;
     label: string;
     icon: React.ReactNode;
   }
   ```

   - Home (Repository List)
   - Analysis Dashboard
   - Settings (placeholder)

   d. **Analysis Results View** (Update existing `AnalysisDashboard.tsx`)

   - Add repository metadata
   - Integrate with AnalysisChart
   - Add filtering controls

#### Phase 2: Mock Data Layer 🔄

1. **Mock Data Structure** (`src/__tests__/test-utils/mocks/data/`)

   ```
   data/
   ├── repositories.ts      # Repository list data
   ├── analysis.ts         # Analysis results (existing)
   ├── progress.ts         # Analysis progress states
   └── errors.ts          # Error state examples
   ```

2. **Type Definitions** (`src/types/`)

   ```typescript
   // repository.ts
   interface Repository {
     id: string;
     url: string;
     name: string;
     status: 'pending' | 'running' | 'completed' | 'error';
     lastAnalyzed?: string;
     metrics?: AnalysisMetrics;
     error?: {
       code: string;
       message: string;
       details?: unknown;
     };
   }

   // progress.ts
   interface AnalysisProgress {
     repositoryId: string;
     status: 'pending' | 'running' | 'completed' | 'error';
     progress: number;
     currentTask?: string;
     remainingTime: number;
     startTime: string;
     endTime?: string;
   }
   ```

3. **Mock Data Examples**
   ```typescript
   // Mock repositories
   export const mockRepositories: Repository[] = [
     {
       id: '1',
       url: 'https://github.com/facebook/react',
       name: 'react',
       status: 'completed',
       lastAnalyzed: '2025-02-17T12:00:00Z',
       metrics: mockAnalysisMetrics, // existing
     },
     {
       id: '2',
       url: 'https://github.com/vercel/next.js',
       name: 'next.js',
       status: 'running',
       progress: 45,
     },
   ];
   ```

#### Phase 3: User Flow Implementation 🔄

1. **Repository Management Flow**

   ```typescript
   // src/hooks/useRepositoryManagement.ts
   interface UseRepositoryManagement {
     repositories: Repository[];
     addRepository: (url: string) => Promise<void>;
     removeRepository: (id: string) => Promise<void>;
     getRepository: (id: string) => Repository | undefined;
   }
   ```

2. **Analysis Flow**

   ```typescript
   // src/hooks/useAnalysisFlow.ts
   interface UseAnalysisFlow {
     startAnalysis: (repoId: string) => Promise<void>;
     cancelAnalysis: (repoId: string) => Promise<void>;
     getProgress: (repoId: string) => AnalysisProgress;
     getResults: (repoId: string) => AnalysisResult | undefined;
   }
   ```

3. **Progress Tracking**
   - Use existing AnalysisProgress component
   - Add progress notifications
   - Implement cancel functionality

#### Phase 4: Polish and Refinement 🔄

1. **Loading States**
   - Use existing LoadingProvider
   - Add Skeleton components for:
     - Repository list
     - Analysis dashboard
     - Charts
2. **Error Handling**

   - Use existing ErrorBoundary
   - Add error states for:
     - Invalid repository
     - Analysis failure
     - Network issues

3. **Styling**
   - Use existing Tailwind classes
   - Ensure dark mode support
   - Add responsive layouts
   - Add transitions

### Development Guidelines

1. File Location Rules:

   - All new components go in appropriate subdirectory under `src/components/`
   - All mock data goes in `src/__tests__/test-utils/mocks/data/`
   - All types go in `src/types/`
   - All hooks go in `src/hooks/`

2. Testing Rules:

   - Component tests in `cypress/component/`
   - Use existing mock data where possible
   - Test all error states
   - Test loading states

3. Code Style Rules:
   - Use TypeScript for all new files
   - Use functional components
   - Use hooks for state management
   - Follow existing naming conventions

### Definition of Done

For each component:

- [ ] TypeScript types defined
- [ ] Component implemented
- [ ] Mock data created
- [ ] Basic styling applied
- [ ] Loading states implemented
- [ ] Error states implemented
- [ ] Component tests written
- [ ] Integrated with parent components

For the prototype:

- [ ] All components working together
- [ ] Mock data flow working
- [ ] All user flows testable
- [ ] Navigation working
- [ ] Responsive design working
- [ ] Dark mode working

## Comprehensive Testing Plan (February 17, 2025)

### Test Infrastructure Setup

#### 1. Complete Test Directory Structure

```
src/
└── __tests__/
    ├── components/
    │   ├── analysis/
    │   │   ├── AnalysisProgress.cy.tsx
    │   │   └── AnalysisTable.cy.tsx
    │   ├── repository/
    │   │   ├── RepositoryCard.cy.tsx
    │   │   └── RepositoryList.cy.tsx
    │   └── common/
    │       ├── ErrorBoundary.cy.tsx
    │       └── Skeleton.cy.tsx
    ├── fixtures/
    │   ├── analysis/
    │   │   ├── progress-states.json     ✓
    │   │   └── results.json            ✓
    │   └── repository/
    │       ├── valid-repos.json        ✓
    │       └── invalid-repos.json      ✓
    └── test-utils/
        ├── mocks/
        │   ├── data/                   ✓
        │   ├── services/               ✓
        │   └── ui/                     ✓
        ├── factories/
        │   ├── createRepository.ts     ✓
        │   └── createAnalysis.ts       ✓
        ├── helpers/
        │   └── mountWithProviders.tsx  ✓
        └── setup.ts                        ✓
```

#### 2. Test Data Organization

1. **Fixtures**

   - Static test data in JSON format
   - Multiple scenarios per feature
   - Edge cases and error states
   - Typed with TypeScript interfaces

2. **Mock Services**

   ```typescript
   // api.ts
   export const mockApiClient = {
     analyze: cy.stub(),
     getProgress: cy.stub(),
     getResults: cy.stub(),
   };

   // cache.ts
   export const mockCache = {
     get: cy.stub(),
     set: cy.stub(),
     clear: cy.stub(),
   };
   ```

3. **Factory Functions**
   ```typescript
   // createRepository.ts
   export function createRepository(
     overrides?: Partial<Repository>,
     state: 'pending' | 'running' | 'completed' | 'error' = 'pending'
   ): Repository {
     return {
       id: Date.now().toString(),
       url: 'https://github.com/test/repo',
       name: 'test-repo',
       status: state,
       ...overrides,
     };
   }
   ```

#### 3. Component Test Patterns

1. **Analysis Components**

   ```typescript
   // AnalysisProgress.cy.tsx
   describe('AnalysisProgress', () => {
     beforeEach(() => {
       // Reset API mocks
       mockApiClient.getProgress.reset();

       // Mount with providers
       cy.mount(
         <TestProviders>
           <AnalysisProgress repositoryId="123" />
         </TestProviders>
       );
     });

     it('shows loading state initially', () => {
       cy.get('[data-testid="progress-skeleton"]').should('exist');
     });

     it('updates progress in real-time', () => {
       // Simulate progress updates
       mockApiClient.getProgress
         .onFirstCall().resolves({ progress: 25 })
         .onSecondCall().resolves({ progress: 50 });

       // Verify progress updates
       cy.get('[data-testid="progress-bar"]')
         .should('have.attr', 'aria-valuenow', '25')
         .should('have.attr', 'aria-valuenow', '50');
     });
   });
   ```

2. **Repository Components**
   ```typescript
   // RepositoryForm.cy.tsx
   describe('RepositoryForm', () => {
     it('validates repository URL', () => {
       // Test URL validation
       cy.get('[data-testid="url-input"]').type('invalid-url');
       cy.get('[data-testid="submit-button"]').should('be.disabled');
       cy.get('[data-testid="validation-error"]').should('be.visible');
     });
   });
   ```

#### 4. API Layer Testing

1. **Request/Response Testing**

   ```typescript
   describe('API Client', () => {
     it('handles network errors', () => {
       // Simulate network error
       cy.intercept('/api/analyze', {
         forceNetworkError: true,
       });

       // Verify error handling
       cy.get('[data-testid="error-message"]').should('contain', 'Network error');
     });
   });
   ```

2. **Cache Layer Testing**

   ```typescript
   describe('Cache Layer', () => {
     it('caches successful responses', () => {
       // Make initial request
       cy.intercept('/api/results').as('results');
       cy.get('[data-testid="fetch-button"]').click();
       cy.wait('@results');

       // Verify cache hit
       cy.get('[data-testid="fetch-button"]').click();
       cy.get('@results.all').should('have.length', 1);
     });
   });
   ```

### Implementation Checklist

#### Phase 1: Infrastructure

- [ ] Set up test directory structure
- [ ] Create test fixtures
- [ ] Implement factory functions
- [ ] Set up API mocks
- [ ] Configure cache mocks

#### Phase 2: Component Tests

- [ ] Analysis component tests
- [ ] Repository component tests
- [ ] Common component tests
- [ ] Integration tests

#### Phase 3: Service Layer Tests

- [ ] API client tests
- [ ] Cache layer tests
- [ ] Error handling tests
- [ ] Progress tracking tests

#### Phase 4: Integration Tests

- [ ] Full user flow tests
- [ ] State management tests
- [ ] Error recovery tests
- [ ] Performance tests

### Success Criteria

1. **Test Coverage**

   - Components: 100%
   - Services: 100%
   - User flows: 100%
   - Error handling: 100%

2. **Test Quality**

   - No flaky tests
   - Fast execution
   - Clear failure messages
   - Maintainable code

3. **Documentation**
   - Test patterns documented
   - Setup instructions clear
   - Maintenance guide complete
   - Examples provided

## Testing Implementation Plan (February 17, 2025)

### Current State

1. **Existing Test Coverage**

   ```
   cypress/component/__tests__/
   ├── hooks/
   │   ├── useAnalysisFlow.cy.tsx       ✓
   │   └── useRepositoryManagement.cy.tsx ✓
   ├── mocks/
   │   └── MockDataProvider.cy.tsx      ✓
   ├── navigation/
   │   ├── MainNav.cy.tsx               ✓
   │   └── NavLink.cy.tsx               ✓
   └── repository/
       ├── RepositoryCard.cy.tsx        ✓
       ├── RepositoryError.cy.tsx       ✓
       ├── RepositoryForm.cy.tsx        ✓
       └── RepositoryList.cy.tsx        ✓
   ```

2. **Test Infrastructure**

   ```
   src/__tests__/
   ├── fixtures/
   │   ├── analysis/
   │   │   ├── progress-states.json     ✓
   │   │   └── results.json            ✓
   │   └── repository/
   │       ├── valid-repos.json        ✓
   │       └── invalid-repos.json      ✓
   ├── test-utils/
   │   ├── factories/
   │   │   ├── createRepository.ts     ✓
   │   │   └── createAnalysis.ts       ✓
   │   ├── helpers/
   │   │   └── mountWithProviders.tsx  ✓
   │   └── mocks/
   │       ├── data/                   ✓
   │       ├── services/               ✓
   │       └── ui/                     ✓
   └── setup.ts                        ✓
   ```

3. **Components Requiring Tests**
   ```
   src/components/
   ├── analysis/
   │   ├── AnalysisChart.tsx           □
   │   ├── AnalysisProgress.tsx        □
   │   ├── AnalysisTable.tsx           □
   │   └── AnalysisMetrics.tsx         □
   ├── common/
   │   ├── ErrorBoundary.tsx           □
   │   ├── LoadingProvider.tsx         □
   │   ├── ToastProvider.tsx           □
   │   └── Card.tsx                    □
   └── layout/
       ├── Container.tsx               □
       ├── MainLayout.tsx              □
       └── ResponsiveGrid.tsx          □
   ```

### Implementation Phases

#### Phase 1: Test Infrastructure Validation (Current)

1. **Audit Existing Tests**

   - Review test patterns
   - Verify utility usage
   - Document coverage
   - Identify gaps

2. **Fixture Consolidation**
   - Review existing fixtures
   - Remove duplicates
   - Standardize formats
   - Update documentation

#### Phase 2: Core Component Tests

1. **Repository Components**

   - [x] RepositoryForm
   - [ ] RepositoryList
   - [ ] RepositoryCard
   - [ ] RepositoryError

2. **Analysis Components**

   - [ ] AnalysisProgress
   - [ ] AnalysisChart
   - [ ] AnalysisTable
   - [ ] AnalysisMetrics
   - [ ] AnalysisDashboard

3. **Common Components**
   - [ ] ErrorBoundary
   - [ ] LoadingProvider
   - [ ] ToastProvider
   - [ ] Card
   - [ ] Progress

#### Phase 3: Layout and Navigation

1. **Layout Components**

   - [ ] Container
   - [ ] MainLayout
   - [ ] ResponsiveGrid

2. **Navigation Components**
   - [ ] MainNav
   - [ ] NavLink

#### Phase 4: Integration Tests

1. **User Flows**

   - [ ] Repository submission
   - [ ] Analysis tracking
   - [ ] Error recovery
   - [ ] Navigation

2. **State Management**
   - [ ] Repository states
   - [ ] Analysis states
   - [ ] Loading states
   - [ ] Error states

#### Phase 5: Documentation and Cleanup

1. **Documentation**

   - [ ] Test patterns
   - [ ] Coverage report
   - [ ] Examples
   - [ ] README updates

2. **Cleanup**
   - [ ] Remove duplicates
   - [ ] Standardize patterns
   - [ ] Verify coverage
   - [ ] Update types

### Success Criteria

1. **Coverage Requirements**

   - Components: 100%
   - User flows: 100%
   - Error handling: 100%
   - Loading states: 100%

2. **Quality Standards**

   - No flaky tests
   - Clear patterns
   - Documented approach
   - Maintainable code

3. **Test Organization**
   - Consistent structure
   - Clear naming
   - Proper grouping
   - Reusable utilities

### Current Focus

Phase 1: Test Infrastructure Validation

- Auditing existing test files
- Documenting current coverage
- Planning necessary updates
- Preparing for core component tests

## UI-First Development Plan (February 18, 2025)

### Core Objectives

1. Analyze repositories to understand:

   - What the repository is trying to achieve
   - How it implements its objectives
   - Key architectural decisions and their rationale
   - Notable implementation patterns

2. Build a knowledge base of:
   - Implementation approaches
   - Architectural decisions
   - Reusable patterns
   - Solution strategies

### Implementation Strategy

#### Phase 1: Repository Analysis UI

1. **Entry Point** (`/components/analysis/input/`)

   - Keep: Existing URL input infrastructure
   - Modify: Add objective analysis fields
   - New Component: `RepositoryObjectiveForm.tsx`

   ```typescript
   interface RepositoryObjective {
     primaryObjective: string; // What the repo aims to achieve
     keyComponents: {
       name: string; // Component name
       purpose: string; // What it does
       approach: string; // How it does it
     }[];
   }
   ```

2. **Analysis Display** (`/components/analysis/results/`)

   - Repurpose existing tabs structure
   - New Layout:
     - Objectives Tab (what the repo aims to achieve)
     - Implementation Tab (how it achieves its goals)
     - Patterns Tab (notable implementation approaches)
     - Chat Tab (Q&A about implementation details)

3. **Pattern Library** (`/components/patterns/`)
   - Simple pattern saving interface
   - Pattern categorization by:
     - Problem solved
     - Implementation approach
     - Technical solution

#### Files to Modify

1. **Keep and Modify**:

   - `/components/analysis/input/RepositoryEntryPoint.tsx`
   - `/components/analysis/results/AnalysisResults.tsx`
   - `/components/analysis/tabs/*`

2. **Create New**:

   - `/components/analysis/input/RepositoryObjectiveForm.tsx`
   - `/components/analysis/results/ObjectivesView.tsx`
   - `/components/patterns/PatternCapture.tsx`

3. **Remove/Ignore for Now**:
   - Performance monitoring components
   - Accessibility implementations
   - Complex error handling
   - Advanced visualization components

#### Mock Data Structure

```typescript
interface MockAnalysisData {
  objectives: {
    primary: string;
    components: Array<{
      name: string;
      purpose: string;
      approach: string;
    }>;
  };
  implementation: {
    architecture: string;
    keyDecisions: Array<{
      decision: string;
      rationale: string;
    }>;
  };
  patterns: Array<{
    name: string;
    problem: string;
    solution: string;
    codeReference: string;
  }>;
}
```

### Development Guidelines

1. **Focus Areas**

   - UI flow and user experience
   - Mock data integration
   - Basic component functionality
   - Simple state management

2. **Avoid For Now**

   - Complex performance optimizations
   - Accessibility implementations
   - Advanced error handling
   - Complex visualizations
   - Extensive test coverage

3. **Leverage Existing**

   - Radix UI components
   - Basic routing setup
   - Component structure
   - State management patterns

4. **Key Learnings from Current Implementation**
   - Keep component structure flat
   - Use simple prop drilling for now
   - Avoid premature optimization
   - Focus on functional UI first
   - Use basic error boundaries
   - Implement simple loading states

### Implementation Order

1. **Week 1: Entry Point**

   - Repository URL input
   - Basic objective form
   - Simple validation

2. **Week 2: Analysis Display**

   - Objectives tab
   - Implementation tab
   - Basic pattern display

3. **Week 3: Pattern Library**

   - Pattern saving interface
   - Simple categorization
   - Basic search

4. **Week 4: Integration**
   - Connect components
   - Add mock data
   - Basic error handling
   - Simple loading states

### Success Criteria

- Working UI with mock data
- Clear objective analysis flow
- Basic pattern capture
- Simple search functionality

### Non-Goals for This Phase

- Advanced performance optimization
- Complex visualizations
- Extensive error handling
- Accessibility features
- Complex state management
- Comprehensive testing
