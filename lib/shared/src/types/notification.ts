import { StoreGameData, StorePriceInformation } from './info-source';

export enum NotificationType {
    NewStoreEntry = 'new-store-entry',
    ReleaseDateChanged = 'release-date-changed',
    GameReleased = 'game-released',
    GameReduced = 'game-reduced',
    NewMetacriticRating = 'new-metacritic-rating',
    ResolveError = 'resolve-error'
}

export const StoreNotifications = [
    NotificationType.NewStoreEntry,
    NotificationType.ReleaseDateChanged,
    NotificationType.GameReleased,
    NotificationType.GameReduced,
];

export type NotificationData = {
    [NotificationType.NewStoreEntry]: StoreGameData,
    [NotificationType.ReleaseDateChanged]: { releaseDate: Date, originalDate: string },
    [NotificationType.GameReleased]: unknown,
    [NotificationType.GameReduced]: StorePriceInformation,
    [NotificationType.NewMetacriticRating]: { criticScore: string, userScore: string },
    [NotificationType.ResolveError]: unknown,
};
