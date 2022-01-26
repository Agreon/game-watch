import { Notification } from "@game-watch/database";
import { Controller, Get, Param, Post, UseGuards } from "@nestjs/common";

import { JwtAccessTokenGuard } from "../auth/jwt-access-token-guard";
import { NotificationService } from "./notification-service";

@UseGuards(JwtAccessTokenGuard)
@Controller("/notification")
export class NotificationController {
    public constructor(
        private readonly notificationService: NotificationService
    ) { }

    @Get()
    public async getAll(): Promise<Notification[]> {
        return await this.notificationService.getNotifications();
    }

    @Post("/:id/read")
    public async markNotificationAsRead(
        @Param("id") id: string
    ): Promise<Notification> {
        return await this.notificationService.markNotificationAsRead(id);
    }
}
