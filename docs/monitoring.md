# Monitoring and Analytics Documentation

## Overview

The RepoAnalyzer application uses a comprehensive monitoring and analytics setup to track performance, errors, and user behavior. This helps us maintain high quality and improve user experience.

## Technologies Used

- **Sentry**: Error tracking and performance monitoring
- **Google Analytics**: User behavior and event tracking
- **Custom Monitoring Utilities**: Centralized monitoring functions

## Setup Instructions

1. Configure environment variables:
   ```env
   VITE_SENTRY_DSN=your-sentry-dsn
   VITE_GA_TRACKING_ID=your-ga-tracking-id
   ```

2. Initialize monitoring in your app:
   ```typescript
   import { initializeMonitoring } from './utils/monitoring';
   initializeMonitoring();
   ```

## Key Features

### Error Tracking

- Automatic error capturing with Sentry
- Custom error context and user information
- Development mode error logging
- Error boundary integration

### Performance Monitoring

- API call performance tracking
- Custom performance metrics
- Transaction tracing
- Resource timing

### User Analytics

- Event tracking
- User session tracking
- Feature usage analytics
- Error impact analysis

## Usage Examples

### Track Errors

```typescript
import { trackError } from './utils/monitoring';

try {
  // Your code
} catch (error) {
  trackError(error, {
    component: 'RepositoryAnalysis',
    action: 'analyzeRepository',
  });
}
```

### Track Events

```typescript
import { trackEvent } from './utils/monitoring';

trackEvent('repository_analyzed', {
  repoUrl: 'https://github.com/user/repo',
  analysisTime: 1500,
});
```

### Track API Calls

```typescript
import { trackApiCall } from './utils/monitoring';

const data = await trackApiCall(
  () => api.analyzeRepository(url),
  'analyzeRepository'
);
```

### Track Performance

```typescript
import { trackPerformance } from './utils/monitoring';

trackPerformance({
  name: 'analysis_complete_time',
  value: 1500,
  unit: 'ms',
});
```

## Best Practices

1. **Error Handling**
   - Always include relevant context with errors
   - Use appropriate error levels
   - Handle errors at the appropriate level

2. **Performance Monitoring**
   - Track critical user paths
   - Monitor API performance
   - Set up performance budgets

3. **Event Tracking**
   - Use consistent naming conventions
   - Include relevant properties
   - Don't track sensitive information

4. **User Privacy**
   - Follow GDPR guidelines
   - Implement data retention policies
   - Allow users to opt-out

## Debugging

1. Check Sentry Dashboard for:
   - Error reports
   - Performance metrics
   - User feedback

2. Check Google Analytics for:
   - User behavior
   - Feature usage
   - Conversion rates

## Maintenance

1. Regularly review:
   - Error rates
   - Performance metrics
   - User feedback

2. Update monitoring configuration:
   - Adjust sampling rates
   - Update error filters
   - Refine event tracking

## Troubleshooting

Common issues and solutions:

1. **Missing Events**
   - Check initialization
   - Verify environment variables
   - Check network connectivity

2. **High Error Rates**
   - Review error patterns
   - Check recent deployments
   - Verify API endpoints

3. **Performance Issues**
   - Check API response times
   - Review resource usage
   - Monitor client performance
