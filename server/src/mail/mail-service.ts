import { User } from '@game-watch/database';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailParams, MailerSend, Recipient, Sender } from 'mailersend';

import { Environment } from '../environment';

@Injectable()
export class MailService {
    public constructor(
        private readonly mailerSendClient: MailerSend,
        private readonly configService: ConfigService<Environment, true>
    ) { }

    public async sendDoiMail(receiver: User, token: string) {
        const doiLink = new URL(`/user/confirm?token=${token}`, this.configService.get('API_URL'));

        const sentFrom = new Sender('daniel@game-watch.agreon.de', 'Daniel');

        const emailParams = new EmailParams()
            .setFrom(sentFrom)
            .setTo([new Recipient(receiver.getEmailOrFail())])
            .setReplyTo(sentFrom)
            .setSubject('Confirm your E-Mail Address')
            .setText(`
        Hey ${receiver.username}!

        Please confirm your E-Mail Address by clicking the following link:
        ${doiLink}

        If this wasn't you, please ignore this email.

        Otherwise, welcome to GameWatch :)

        Daniel
            `);

        await this.mailerSendClient.email.send(emailParams);

    }
}
