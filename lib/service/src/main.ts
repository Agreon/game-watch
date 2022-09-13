import { Country, InfoSourceType } from "@game-watch/shared";
import { Logger } from "pino";

export { createLogger, Logger } from "./create-logger";
export { parseEnvironment } from "./parse-environment";
export { initializeSentry } from "./initialize-sentry";
export { mapCountryCodeToAcceptLanguage, mapCountryCodeToLanguage } from "./map-country-code";

export interface InfoSearcherContext {
    logger: Logger
    userCountry: Country
}

export interface SearchResponse {
    remoteGameId: string
    remoteGameName: string
}

export interface InfoSearcher {
    type: InfoSourceType
    search(name: string, context: InfoSearcherContext): Promise<SearchResponse | null>
}
