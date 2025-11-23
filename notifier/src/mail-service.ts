import { Notification, User } from '@game-watch/database';
import {
    formatPrice,
    formatReleaseDate,
    NotificationData,
    NotificationType,
    parseStructure,
} from '@game-watch/shared';
import { EmailParams, MailerSend, Recipient, Sender } from 'mailersend';

import { EnvironmentStructure } from './environment';

const {
    API_URL,
    PUBLIC_URL,
} = parseStructure(EnvironmentStructure, process.env);

export class MailService {
    public constructor(
        private readonly mailerSendClient: MailerSend
    ) { }

    public async sendNotificationMail(receiver: User, notification: Notification) {
        const sentFrom = new Sender('daniel@game-watch.agreon.de', 'Daniel');

        const emailParams = new EmailParams()
            .setFrom(sentFrom)
            .setTo([new Recipient(receiver.getEmailOrFail())])
            .setReplyTo(sentFrom)
            .setSubject(this.getMailSubject(notification))
            .setText(this.getMailText(receiver, notification));

        await this.mailerSendClient.email.send(emailParams);
    }

    private getMailSubject(notification: Notification): string {
        const game = notification.game.getEntity();
        const infoSource = notification.infoSource.getEntity();

        // We rather display the resolved name so a user can see instantly if an unrelated
        // game was added.
        const infoSourceName = infoSource.data.fullName;

        switch (notification.type) {
            case NotificationType.GameReleased:
                return `${infoSourceName} will be available today in the ${infoSource.type} store`;
            case NotificationType.GameReduced:
                return `${infoSourceName} was reduced in the ${infoSource.type} store`;
            case NotificationType.ReleaseDateChanged:
                return `The release date of ${infoSourceName} changed`;
            case NotificationType.NewStoreEntry:
                return `${infoSourceName} was added to the ${infoSource.type} store`;
            case NotificationType.NewMetacriticRating:
                return `${infoSourceName} received a Metacritic rating`;
            case NotificationType.NewMetacriticUserRating:
                return `${infoSourceName} received a Metacritic user rating`;
            case NotificationType.NewProtonDbRating:
                return `${infoSourceName} received a Proton DB rating`;
            case NotificationType.ProtonDbRatingIncreased:
                return `Proton DB rating of ${infoSourceName} increased`;
            case NotificationType.LeftEarlyAccess:
                return `${infoSourceName} left Early Access`;
            case NotificationType.AddedToPsPlus:
                return `${infoSourceName} was added to the PS Plus library`;
            case NotificationType.ResolveError:
                return `${game.name || game.search} could not be resolved`;
        }
    }

    private getMailText(receiver: User, notification: Notification) {
        const body = this.getNotificationText(notification);
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

    private getNotificationText(notification: Notification): string {
        const game = notification.game.getEntity();
        const infoSource = notification.infoSource.getEntity();

        // We rather display the resolved name so a user can see instantly if an unrelated
        // game was added.
        const infoSourceName = infoSource.data.fullName;

        switch (notification.type) {
            case NotificationType.GameReduced:
                const data = notification.data as NotificationData[NotificationType.GameReduced];
                const initial = formatPrice({ price: data.initial, country: infoSource.country });
                const final = formatPrice({ price: data.final, country: infoSource.country });

                return `${infoSourceName} was reduced from ${initial} to ${final}.`;
            case NotificationType.ReleaseDateChanged:
                const releaseDate = notification.data as NotificationData[NotificationType.ReleaseDateChanged];
                const formattedDate = formatReleaseDate(releaseDate);

                return `${infoSourceName} will be released ${releaseDate.isExact ? 'on' : 'in'} ${formattedDate} in `
                    + `the ${infoSource.type} store.`;
            case NotificationType.NewStoreEntry:
                return `${infoSourceName} was added to the ${infoSource.type} store.`;
            case NotificationType.GameReleased:
                return `${infoSourceName} will be available today in the ${infoSource.type} store.`;
            case NotificationType.NewMetacriticRating:
                return `${infoSourceName} received a Metacritic rating.`;
            case NotificationType.NewMetacriticUserRating:
                return `${infoSourceName} received a Metacritic user rating`;
            case NotificationType.NewProtonDbRating:
                return `${infoSourceName} received a Proton DB rating.`;
            case NotificationType.ProtonDbRatingIncreased:
                return `Proton DB rating of ${infoSourceName} increased`;
            case NotificationType.LeftEarlyAccess:
                return `${infoSourceName} left Early Access`;
            case NotificationType.AddedToPsPlus:
                return `${infoSourceName} was added to the PS Plus library`;
            case NotificationType.ResolveError:
                return `${game.name || game.search} could not be resolved. Try to trigger it manually again.`
                    + " If that didn't help, there might be an issue with our implementation."
                    + ' But worry not, the team is already notified.';
        }
    }

}
