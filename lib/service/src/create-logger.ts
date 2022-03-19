import { default as pino } from 'pino';

import { EnvironmentStructure } from './environment';
import { parseEnvironment } from './parse-environment';

export type Logger = pino.Logger;

const { PRETTY_LOGGING } = parseEnvironment(EnvironmentStructure, process.env);

export const createLogger = (name: string) =>
    pino({
        name,
        transport: PRETTY_LOGGING ? {
            target: 'pino-pretty',
            options: {
                colorize: true,
                singleLine: true,
                translateTime: "yyyy-mm-dd HH:MM:ss.l",
                ignore: 'pid,hostname',
            }
        } : undefined,
        level: "debug",
        formatters: {
            level: (label) => ({ level: label }),
        },
    });
