import * as Sentry from '@sentry/nextjs';
// const Tracing = require("@sentry/tracing");

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn: SENTRY_DSN,
  integrations: [
    // https://docs.sentry.io/platforms/javascript/performance/instrumentation/automatic-instrumentation/#tracingorigins
    new Tracing.Integrations.BrowserTracing({
      tracingOrigins: [process.env.NEXT_PUBLIC_SERVER_URL],
    })
  ],
  tracesSampler: context => {
    if (context.location?.href.includes("notification")) {
      return 0;
    }
    return 1;
  }
});
