import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailerSend } from 'mailersend';

import { Environment } from '../environment';
import { MailService } from './mail-service';

@Module({
    providers: [{
        provide: MailService,
        useFactory: (configService: ConfigService<Environment, true>) =>
            new MailService(
                new MailerSend({
                    apiKey: configService.get('MAILERSEND_API_KEY'),
                }),
                configService
            )
        ,
        inject: [ConfigService]
    }],
    exports: [MailService]
})
export class MailModule { }
