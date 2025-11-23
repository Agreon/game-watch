import * as dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(process.cwd(), '..', '.env') });

import { mikroOrmConfig } from '@game-watch/database';
import { createWorkerForQueue, QueueType } from '@game-watch/queue';
import { createLogger, initializeSentry } from '@game-watch/service';
import { parseStructure } from '@game-watch/shared';
import { MikroORM } from '@mikro-orm/core';
import * as Sentry from '@sentry/node';
import { Worker } from 'bullmq';
import { MailerSend } from 'mailersend';

import { EnvironmentStructure } from './environment';
import { MailService } from './mail-service';
import { NotificationService } from './notification-service';
import { GameAddedToPsPlusNotificationCreator } from './notifiers/game-added-to-ps-plus-notification-creator';
import {
    GameLeftEarlyAccessNotificationCreator
} from './notifiers/game-left-early-access-notification-creator';
import { GameReducedNotificationCreator } from './notifiers/game-reduced-notification-creator';
import { GameReleasedNotificationCreator } from './notifiers/game-released-notification-creator';
import {
    NewMetacriticRatingNotificationCreator
} from './notifiers/new-metacritic-rating-notification-creator';
import {
    NewMetacriticUserRatingNotificationCreator
} from './notifiers/new-metacritic-user-rating-notification-creator';
import {
    NewProtonDbRatingNotificationCreator
} from './notifiers/new-proton-db-rating-notification-creator';
import { NewStoreEntryNotificationCreator } from './notifiers/new-store-entry-notification-creator';
import {
    ProtonDbRatingIncreasedNotificationCreator
} from './notifiers/proton-db-rating-increased-notification-creator';
import {
    ReleaseDateChangedNotificationCreator
} from './notifiers/release-date-changed-notification-creator';

const {
    CREATE_NOTIFICATIONS_CONCURRENCY,
    MAILERSEND_API_KEY
} = parseStructure(EnvironmentStructure, process.env);

initializeSentry('Notifier');

const logger = createLogger('Notifier');

let createNotificationsWorker: Worker | undefined;

const notificationCreators = [
    new GameReducedNotificationCreator(),
    new GameReleasedNotificationCreator(),
    new NewMetacriticRatingNotificationCreator(),
    new NewMetacriticUserRatingNotificationCreator(),
    new NewProtonDbRatingNotificationCreator(),
    new ProtonDbRatingIncreasedNotificationCreator(),
    new NewStoreEntryNotificationCreator(),
    new ReleaseDateChangedNotificationCreator(),
    new GameLeftEarlyAccessNotificationCreator(),
    new GameAddedToPsPlusNotificationCreator()
];

const mailService = new MailService(new MailerSend({
    apiKey: MAILERSEND_API_KEY,
}));

const main = async () => {
    const orm = await MikroORM.init(mikroOrmConfig);

    createNotificationsWorker = createWorkerForQueue(
        QueueType.CreateNotifications,
        async ({ data: { sourceId, existingGameData, resolvedGameData } }) => {
            const sourceScopedLogger = logger.child({ sourceId });

            const notificationService = new NotificationService(
                notificationCreators,
                mailService,
                orm.em.fork(),
                sourceScopedLogger
            );

            try {
                await notificationService.createNotifications({
                    sourceId,
                    existingGameData,
                    resolvedGameData,
                });
            } catch (error) {
                // Need to wrap this because otherwise the error is swallowed by the worker.
                sourceScopedLogger.error(error);
                Sentry.captureException(error, { tags: { sourceId } });
                throw error;
            }
        }, { concurrency: CREATE_NOTIFICATIONS_CONCURRENCY, });

    createNotificationsWorker.on('error', error => {
        logger.error(error);
        Sentry.captureException(error);
    });

    logger.info('Listening for events');
};

main().catch(error => {
    logger.error(error);
    if (createNotificationsWorker) {
        createNotificationsWorker.close();
    }
    process.exit(1);
});
