import { NotificationData, NotificationType } from '../types';
import { GameDto } from './game';
import { InfoSourceDto } from './info-source';

export interface NotificationDto<T extends NotificationType = NotificationType> {
    id: string;
    createdAt: string;
    type: T;
    read: boolean;
    data: NotificationData[T];
    game: GameDto;
    infoSource: InfoSourceDto;
}
