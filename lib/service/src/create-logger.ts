import { parseStructure } from '@game-watch/shared';
import { default as pino } from 'pino';

import { EnvironmentStructure } from './environment';

export type Logger = pino.Logger;

const { PRETTY_LOGGING } = parseStructure(EnvironmentStructure, process.env);

export const createLogger = (name: string) =>
    pino({
        name,
        transport: PRETTY_LOGGING ? {
            target: 'pino-pretty',
            options: {
                colorize: true,
                singleLine: true,
                translateTime: 'yyyy-mm-dd HH:MM:ss.l',
                ignore: 'pid,hostname',
            }
        } : undefined,
        level: 'debug',
        formatters: {
            level: (label) => ({ level: label }),
        },
    });
