export const Countries = ['DE', 'US', 'AU', 'NZ'] as const;
export type Country = typeof Countries[number];
