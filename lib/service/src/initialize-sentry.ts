import * as Sentry from '@sentry/node';

import { EnvironmentStructure } from './environment';
import { parseEnvironment } from './parse-environment';

const { SENTRY_DSN, SENTRY_ENVIRONMENT } = parseEnvironment(EnvironmentStructure, process.env);

export const initializeSentry = (service: string, integrations?: any[]) => {
    Sentry.init({
        dsn: SENTRY_DSN,
        environment: SENTRY_ENVIRONMENT,
        initialScope: { tags: { service } },
        integrations,
        tracesSampler: context => {
            console.log("TRACE", context);

            if (context.location?.href.includes("notification")) {
                return 0.01;
            }

            return 0.1;
        }
    });
};
