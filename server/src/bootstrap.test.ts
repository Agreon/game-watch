import { NestFactory } from '@nestjs/core';
import * as dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(process.cwd(), '..', '.env') });

import { AppModule } from './app.module';

describe('Bootstrap', () => {
    it('the server can be bootstrapped', async () => {
        const app = await NestFactory.create(AppModule);
        await app.close();
    });
});
