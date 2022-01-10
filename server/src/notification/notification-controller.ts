import { Notification } from "@game-watch/database";
import { Controller, Get } from "@nestjs/common";

import { NotificationService } from "./notification-service";

@Controller("/notification")
export class NotificationController {
    public constructor(
        private readonly notificationService: NotificationService
    ) { }

    @Get()
    public async getAll(): Promise<Notification[]> {
        return await this.notificationService.getNotifications();
    }
}
