import {
    InfoSourceType,
    NotificationType,
    StoreInfoSource,
    StoreInfoSources,
} from '@game-watch/shared';

import { NotificationCreator, NotificationCreatorContext } from '../notification-service';

export class GameReducedNotificationCreator
    implements NotificationCreator<NotificationType.GameReduced>
{
    public readonly forNotificationType = NotificationType.GameReduced;
    public readonly supportsInfoSourceTypes: InfoSourceType[] = StoreInfoSources;

    public async createNotification(
        { existingGameData, resolvedGameData, logger }: NotificationCreatorContext<StoreInfoSource>
    ) {
        if (!existingGameData?.priceInformation) {
            logger.debug('Not adding notification because no existing price information was found');
            return null;
        }

        if (!resolvedGameData.priceInformation) {
            logger.debug('Not adding notification because no new price information was found');
            return null;
        }

        if (resolvedGameData.priceInformation.final >= existingGameData.priceInformation.final) {
            logger.debug(
                {
                    context: {
                        existingFinalPrice: existingGameData.priceInformation.final,
                        newFinalPrice: resolvedGameData.priceInformation.final
                    }
                },
                'Not adding notification because the price was the same or increased');
            return null;
        }

        logger.debug(
            {
                context: {
                    existingFinalPrice: existingGameData.priceInformation.final,
                    newFinalPrice: resolvedGameData.priceInformation.final
                }
            },
            'Adding new notification because the price was reduced'
        );

        return {
            initial: existingGameData.priceInformation.final,
            final: resolvedGameData.priceInformation.final
        };
    }
}
