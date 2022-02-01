import * as Sentry from '@sentry/node';

import { EnvironmentStructure } from './environment';
import { parseEnvironment } from './parse-environment';

const { SENTRY_DSN, SENTRY_ENVIRONMENT } = parseEnvironment(EnvironmentStructure, process.env);

export const initializeSentry = (service: string) => {
    Sentry.init({
        dsn: SENTRY_DSN,
        environment: SENTRY_ENVIRONMENT,
        initialScope: { tags: { service } },
        tracesSampleRate: 1.0,
    });
};
