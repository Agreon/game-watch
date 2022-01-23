import { default as pino } from 'pino';

export type Logger = pino.Logger;

export const createLogger = (name: string) =>
    pino({
        name,
        transport: {
            target: 'pino-pretty',
            options: {
                colorize: true,
                singleLine: true,
                translateTime: "yyyy-mm-dd HH:MM:ss.l",
                ignore: 'pid,hostname',
            }
        },
        level: "debug"
    });
