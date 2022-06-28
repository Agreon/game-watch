import { User } from "@game-watch/database";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { MailService as SendgridMailClient } from '@sendgrid/mail';

import { Environment } from "../environment";

@Injectable()
export class MailService {
    public constructor(
        private readonly sendgridClient: SendgridMailClient,
        private readonly configService: ConfigService<Environment, true>
    ) { }

    public async sendDoiMail(receiver: User, token: string) {
        const doiLink = new URL(`/user/confirm?${token}`, this.configService.get("API_URL"));

        await this.sendgridClient.send({
            to: receiver.getEmailOrFail(),
            from: "daniel@game-watch.agreon.de",
            subject: "Confirm your E-Mail Address",
            text: `
            Hey ${receiver.username}!

            Please confirm your E-Mail Address by clicking the following link: ${doiLink}

            If this wasn't you, please ignore this email.

            Otherwise, welcome to GameWatch :)

            Daniel
            `
        });
    }
}
