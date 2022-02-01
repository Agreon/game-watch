import { Notification, User } from "@game-watch/database";
import { IdentifiedReference } from "@mikro-orm/core";
import { Controller, Get, Param, Post, UseGuards } from "@nestjs/common";

import { CurrentUser } from "../auth/current-user-decorator";
import { JwtAccessTokenGuard } from "../auth/jwt-access-token-guard";
import { UserIsOwner } from "../pipes/user-is-owner-pipe";
import { NotificationService } from "./notification-service";

@UseGuards(JwtAccessTokenGuard)
@Controller("/notification")
export class NotificationController {
    public constructor(
        private readonly notificationService: NotificationService
    ) { }

    @Get()
    public async getAll(
        @CurrentUser() user: IdentifiedReference<User>,
    ): Promise<Notification[]> {
        return await this.notificationService.getNotifications(user);
    }

    @Post("/:id/read")
    public async markNotificationAsRead(
        @Param("id", UserIsOwner) { id }: Notification,
    ): Promise<Notification> {
        return await this.notificationService.markNotificationAsRead(id);
    }
}
