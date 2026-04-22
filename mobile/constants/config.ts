export const APP_URL = process.env.EXPO_PUBLIC_APP_URL ?? "https://onething.app";
export const BUNDLE_ID = "com.nerdstation.onething";

export const TRIAL_DAYS = 14;

export const PLAN = {
  monthly: { id: "onething_monthly", priceUSD: 3.99 },
  annual: { id: "onething_annual", priceUSD: 24.99 },
} as const;

export const LEGAL_PATHS = {
  privacy: "/privacy",
  terms: "/terms",
  refund: "/refund",
  help: "/help",
} as const;
