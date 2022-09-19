import { Notification, User } from '@game-watch/database';
import { parseEnvironment } from '@game-watch/service';
import {
    formatPrice,
    formatReleaseDate,
    NotificationData,
    NotificationType,
} from '@game-watch/shared';
import { MailService as SendgridMailClient } from '@sendgrid/mail';

import { EnvironmentStructure } from './environment';

const {
    API_URL,
    PUBLIC_URL,
} = parseEnvironment(EnvironmentStructure, process.env);

export class MailService {
    public constructor(
        private readonly sendgridClient: SendgridMailClient
    ) { }

    public async sendNotificationMail(receiver: User, notification: Notification) {
        await this.sendgridClient.send({
            to: receiver.getEmailOrFail(),
            from: 'daniel@game-watch.agreon.de',
            subject: this.getMailSubject(notification),
            text: this.getMailText(receiver, notification)
        });
    }

    private getMailSubject(notification: Notification): string {
        const game = notification.game.getEntity();
        const infoSource = notification.infoSource.getEntity();

        const gameName = game.name || game.search;

        switch (notification.type) {
            case NotificationType.GameReduced:
                return `${gameName} was reduced`;
            case NotificationType.ReleaseDateChanged:
                return `The release date of ${gameName} changed`;
            case NotificationType.NewStoreEntry:
                return `${gameName} was added to the ${infoSource.type} store`;
            case NotificationType.GameReleased:
                return `${gameName} will be available today`;
            case NotificationType.NewMetacriticRating:
                return `${gameName} received a rating`;
            case NotificationType.ResolveError:
                return `${gameName} could not be resolved`;
        }
    }

    private getMailText(receiver: User, notification: Notification) {
        const body = this.getNotificationText(receiver, notification);
        const unsubscribeLink = new URL(`/user/unsubscribe?id=${receiver.id}`, API_URL);

        const remoteGameUrl = notification.infoSource.getEntity().data.url;

        return `
Hey ${receiver.username}!

${body}

You can have a detailed look here: ${remoteGameUrl}
Or why not check in on GameWatch: ${PUBLIC_URL}

Best

Daniel

PS: If you don't want to receive these mails anymore, you can unsubscribe by clicking this link:
${unsubscribeLink}
        `;
    }

    private getNotificationText(receiver: User, notification: Notification): string {
        const game = notification.game.getEntity();
        const infoSource = notification.infoSource.getEntity();

        const gameName = game.name || game.search;

        switch (notification.type) {
            case NotificationType.GameReduced:
                const data = notification.data as NotificationData[NotificationType.GameReduced];
                const initial = formatPrice({ price: data.initial, country: receiver.country });
                const final = formatPrice({ price: data.final, country: receiver.country });

                return `${gameName} was reduced from ${initial} to ${final}.`;
            case NotificationType.ReleaseDateChanged:
                const formattedDate = formatReleaseDate(notification.data as NotificationData[NotificationType.ReleaseDateChanged]);

                return `${gameName} will be released on ${formattedDate}.`;
            case NotificationType.NewStoreEntry:
                return `${gameName} was added to the ${infoSource.type} store.`;
            case NotificationType.GameReleased:
                return `${gameName} will be available today.`;
            case NotificationType.NewMetacriticRating:
                return `${gameName} received a rating.`;
            case NotificationType.ResolveError:
                return `${gameName} could not be resolved.`;
        }
    }

}
