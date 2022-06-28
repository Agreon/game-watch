export const Countries = ["DE", "US"] as const;
export type Country = typeof Countries[number];
