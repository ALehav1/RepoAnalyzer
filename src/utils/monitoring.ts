import * as Sentry from '@sentry/browser';

/**
 * Initialize monitoring and error tracking
 */
export function initializeMonitoring() {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  const environment = import.meta.env.VITE_SENTRY_ENVIRONMENT || 'development';

  if (!dsn || dsn === "your-sentry-dsn") {
    console.warn("Sentry DSN not configured. Monitoring is disabled.");
    return;
  }

  Sentry.init({
    dsn,
    environment,
    integrations: [],
    tracesSampleRate: 1.0,
    beforeSend(event) {
      // Don't send events in development
      if (import.meta.env.DEV) {
        console.log('Sentry event in development:', event);
        return null;
      }
      return event;
    }
  });
};

/**
 * Track errors with additional context
 */
export const trackError = (error: Error, context?: Record<string, any>) => {
  console.error(error);
  Sentry.captureException(error, {
    extra: context,
  });
};

/**
 * Track specific events or user actions
 */
export const trackEvent = (
  eventName: string,
  properties?: Record<string, any>
) => {
  // Track in Google Analytics if available
  if (window.gtag && import.meta.env.VITE_GA_TRACKING_ID) {
    window.gtag('event', eventName, properties);
  }

  // Also track in Sentry for debugging
  Sentry.addBreadcrumb({
    category: 'ui.event',
    message: eventName,
    data: properties,
    level: 'info',
  });
};

/**
 * Track API calls and their performance
 */
export const trackApiCall = async <T>(
  apiCall: () => Promise<T>,
  name: string
): Promise<T> => {
  const transaction = Sentry.startTransaction({
    name: `API Call: ${name}`,
  });

  try {
    const result = await apiCall();
    transaction.setStatus('ok');
    return result;
  } catch (error) {
    transaction.setStatus('error');
    throw error;
  } finally {
    transaction.finish();
  }
};

/**
 * Set user context for better error tracking
 */
export const setUserContext = (userId?: string, email?: string) => {
  if (userId || email) {
    Sentry.setUser({
      id: userId,
      email,
    });
  } else {
    Sentry.setUser(null);
  }
};

/**
 * Track performance metrics
 */
export const trackPerformance = (metric: {
  name: string;
  value: number;
  unit?: string;
}) => {
  Sentry.addBreadcrumb({
    category: 'performance',
    message: `${metric.name}: ${metric.value}${metric.unit || 'ms'}`,
    level: 'info',
  });

  // Send to Google Analytics if available
  if (window.gtag && import.meta.env.VITE_GA_TRACKING_ID) {
    window.gtag('event', 'performance_metric', {
      metric_name: metric.name,
      metric_value: metric.value,
      metric_unit: metric.unit || 'ms',
    });
  }
};
