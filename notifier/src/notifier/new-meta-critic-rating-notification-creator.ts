import { InfoSourceType, NotificationType } from "@game-watch/shared";

import { NotificationCreator, NotificationCreatorContext } from "../notification-service";

export class NewMetaCriticRatingNotificationCreator implements NotificationCreator<NotificationType.NewMetacriticRating> {
    public forNotificationType: NotificationType.NewMetacriticRating;
    public supportsInfoSourceTypes: InfoSourceType[] = [InfoSourceType.Metacritic];

    public async createNotification(
        { existingGameData, resolvedGameData, logger }: NotificationCreatorContext<InfoSourceType.Metacritic>
    ) {
        const hasExistingData = !!existingGameData;
        if (hasExistingData) {
            logger.debug({ context: { hasExistingData } }, "Not adding notification because");
            return null;
        }

        logger.debug({ context: { hasExistingData } }, "Adding notification because");

        return resolvedGameData;
    }
}
