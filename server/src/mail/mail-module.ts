import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import SendgridMailClient from '@sendgrid/mail';

import { Environment } from '../environment';
import { MailService } from './mail-service';

@Module({
    providers: [{
        provide: MailService,
        useFactory: (configService: ConfigService<Environment, true>) => {
            SendgridMailClient.setApiKey(configService.get('SENDGRID_API_KEY'));

            return new MailService(SendgridMailClient, configService);
        },
        inject: [ConfigService]
    }],
    exports: [MailService]
})
export class MailModule { }
