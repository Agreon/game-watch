import { StoreGameData, StorePriceInformation } from './info-source';

export enum NotificationType {
    NewStoreEntry = 'new-store-entry',
    ReleaseDateChanged = 'release-date-changed',
    GameReleased = 'game-released',
    GameReduced = 'game-reduced',
    NewMetacriticRating = 'new-metacritic-rating',
    NewProtonDbRating = 'new-proton-db-rating',
    ProtonDbRatingIncreased = 'proton-db-rating-increased',
    LeftEarlyAccess = 'left-early-access',
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
    [NotificationType.NewProtonDbRating]: { score: string },
    [NotificationType.ProtonDbRatingIncreased]: { score: string },
    [NotificationType.LeftEarlyAccess]: unknown,
    [NotificationType.ResolveError]: unknown,
};
