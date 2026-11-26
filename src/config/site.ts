/**
 * Static brand information for Gadget Guardian. Live store details (support phone,
 * shipping fees, social links…) are fetched from the backend bootstrap endpoint.
 */
export const SITE = {
  name: 'Gadget Guardian',
  shortName: 'Gadget Guardian',
  tagline: 'Smart gadgets, delivered',
  description:
    'Gadget Guardian — phones, smart watches, earbuds, chargers and the latest gadgets delivered across Bangladesh with Cash on Delivery.',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3001',
  version: '1.0.0',
  defaultLocale: 'en-BD',
  defaultCurrency: 'BDT',
  support: {
    phone: '01330363517',
    address: 'Aftabnagar, Dhaka',
  },
} as const;

export const IS_PROD = process.env.NODE_ENV === 'production';

export type Site = typeof SITE;
