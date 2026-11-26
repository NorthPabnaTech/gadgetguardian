const apiBaseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000').replace(
  /\/+$/,
  '',
);
const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001').replace(/\/+$/, '');

export const storefrontEnv = {
  API_BASE_URL: apiBaseUrl,
  SITE_URL: siteUrl,
  STOREFRONT_API_KEY: process.env.STOREFRONT_API_KEY?.trim() || undefined,
  IS_PROD: process.env.NODE_ENV === 'production',
} as const;
