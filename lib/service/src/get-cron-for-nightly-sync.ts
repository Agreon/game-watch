import { Country } from "@game-watch/shared";

export const getCronForNightlySync = (country: Country) => {
    switch (country) {
        case "DE":
            return "0 1 * * *";
        case "AU":
        case "NZ":
            return "0 13 * * *";
        case "US":
            return "0 18 * * *";
    }
}
