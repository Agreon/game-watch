import { StoreGameData, StorePriceInformation, StoreReleaseDateInformation } from './info-source';

export enum NotificationType {
    NewStoreEntry = 'new-store-entry',
    ReleaseDateChanged = 'release-date-changed',
    GameReleased = 'game-released',
    GameReduced = 'game-reduced',
    NewMetacriticRating = 'new-metacritic-rating',
    NewMetacriticUserRating = 'new-metacritic-user-rating',
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
    [NotificationType.ReleaseDateChanged]: StoreReleaseDateInformation,
    [NotificationType.GameReleased]: Record<string, never>,
    [NotificationType.GameReduced]: StorePriceInformation,
    [NotificationType.NewMetacriticRating]: { criticScore: string, userScore: string },
    [NotificationType.NewMetacriticUserRating]: { criticScore: string, userScore: string },
    [NotificationType.NewProtonDbRating]: { score: string },
    [NotificationType.ProtonDbRatingIncreased]: { score: string },
    [NotificationType.LeftEarlyAccess]: Record<string, never>,
    [NotificationType.ResolveError]: Record<string, never>,
};
