
// kr? china?
export const Countries = [
    'US',
    // "EN-CA",
    // "ES-AR",
    // "ES-CL",
    // "ES-CO",
    // "ES-MX",
    // "ES-PE",
    // "FR-CA",
    // "PT-BR",
    // EU
    // "AT",
    // "BE-FR",
    // "BE-NL",
    "CH-DE",
    // "CH-FR",
    // "CH-IT",
    "DE",
    // "ES",
    // "FR",
    // "GB",
    // "IE",
    // "IT",
    // "NL",
    // "PT",
    // "RU",
    "ZA",
    // SEA
    'AU',
    'NZ',
    // 'PH',
    // 'MY',
    // 'SG',
] as const;
export type Country = typeof Countries[number];
