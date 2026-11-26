import 'server-only';

import { cookies } from 'next/headers';

import type {
  AddressDTO,
  BannerDTO,
  CampaignDTO,
  CategoryTreeDTO,
  OrderDTO,
  OrderRowDTO,
  Paginated,
  ProductCardDTO,
  ProductDetailDTO,
  QuestionDTO,
  ReviewDTO,
  SettingsDTO,
} from '@/types';
import { SITE } from '@config/site';
import { CUSTOMER_TOKEN_COOKIE } from '@lib/auth-cookie';
import { storefrontEnv } from '@lib/env';

export type StorefrontCustomer = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  avatarUrl?: string;
};

export type BootstrapData = {
  settings: SettingsDTO;
  categories: CategoryTreeDTO[];
  banners: {
    hero: BannerDTO[];
    hero_side: BannerDTO[];
    special: BannerDTO[];
    combo: BannerDTO[];
  };
  campaigns?: CampaignDTO[];
};

export class StorefrontApiError extends Error {
  status: number;
  fieldErrors?: Record<string, string>;

  constructor(message: string, status = 500, fieldErrors?: Record<string, string>) {
    super(message);
    this.name = 'StorefrontApiError';
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

export const DEFAULT_SETTINGS: SettingsDTO = {
  storeName: SITE.name,
  tagline: SITE.tagline,
  supportPhone: SITE.support.phone,
  address: SITE.support.address,
  shippingFeeInsideDhaka: 60,
  shippingFeeOutsideDhaka: 120,
  freeShippingThreshold: 0,
  whatsappEnabled: false,
  whatsappProductEnabled: false,
  whatsappDefaultMessage: 'Hi! I have a question about a product.',
  social: {},
  resellerWithdrawalFeeTiers: [],
};

export async function getCustomerToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(CUSTOMER_TOKEN_COOKIE)?.value?.trim() || null;
}

type FetchOpts = {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  token?: string | null;
  revalidate?: number | false;
};

export async function storefrontFetch<T>(path: string, opts: FetchOpts = {}): Promise<T> {
  const url = `${storefrontEnv.API_BASE_URL}/api/storefront${path}`;
  const headers: Record<string, string> = {
    Accept: 'application/json',
  };
  if (storefrontEnv.STOREFRONT_API_KEY) {
    headers['x-storefront-key'] = storefrontEnv.STOREFRONT_API_KEY;
  }
  if (opts.token) {
    headers['Authorization'] = `Bearer ${opts.token}`;
  }
  if (opts.body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(url, {
    method: opts.method ?? 'GET',
    headers,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    ...(opts.revalidate === false
      ? { cache: 'no-store' as const }
      : typeof opts.revalidate === 'number'
        ? { next: { revalidate: opts.revalidate } }
        : { cache: 'no-store' as const }),
  });

  const json = (await res.json().catch(() => null)) as
    | { ok: true; data: T }
    | { ok: false; error?: string; fieldErrors?: Record<string, string> }
    | null;

  if (!res.ok || !json || !json.ok) {
    throw new StorefrontApiError(
      (json && 'error' in json && json.error) || `Request failed (${res.status})`,
      res.status,
      json && 'fieldErrors' in json ? json.fieldErrors : undefined,
    );
  }

  return json.data;
}

export async function getBootstrapData(): Promise<BootstrapData> {
  try {
    return await storefrontFetch<BootstrapData>('/bootstrap', { revalidate: false });
  } catch {
    return {
      settings: DEFAULT_SETTINGS,
      categories: [],
      banners: { hero: [], hero_side: [], special: [], combo: [] },
      campaigns: [],
    };
  }
}

export type ProductsQuery = {
  q?: string;
  category?: string;
  tags?: string[] | string;
  minPrice?: number;
  maxPrice?: number;
  availability?: 'in_stock';
  onSale?: boolean;
  sort?: string;
  page?: number;
  pageSize?: number;
};

export async function getProducts(query: ProductsQuery = {}): Promise<Paginated<ProductCardDTO>> {
  const sp = new URLSearchParams();
  if (query.q) sp.set('q', query.q);
  if (query.category) sp.set('category', query.category);
  if (query.tags) {
    const tagStr = Array.isArray(query.tags) ? query.tags.join(',') : query.tags;
    if (tagStr) sp.set('tags', tagStr);
  }
  if (query.minPrice !== undefined) sp.set('minPrice', String(query.minPrice));
  if (query.maxPrice !== undefined) sp.set('maxPrice', String(query.maxPrice));
  if (query.availability) sp.set('availability', query.availability);
  if (query.onSale) sp.set('onSale', '1');
  if (query.sort) sp.set('sort', query.sort);
  if (query.page) sp.set('page', String(query.page));
  if (query.pageSize) sp.set('pageSize', String(query.pageSize));

  const qs = sp.toString();
  try {
    return await storefrontFetch<Paginated<ProductCardDTO>>(`/products${qs ? `?${qs}` : ''}`, {
      revalidate: false,
    });
  } catch {
    return { items: [], total: 0, page: query.page ?? 1, pageSize: query.pageSize ?? 24, pageCount: 1 };
  }
}

export type ProductDetailResponse = {
  product: ProductDetailDTO;
  related: ProductCardDTO[];
  reviews: ReviewDTO[] | { reviews: ReviewDTO[]; counts?: Record<number, number> };
  questions: QuestionDTO[];
};

export async function getProductBySlug(slug: string): Promise<ProductDetailResponse | null> {
  try {
    return await storefrontFetch<ProductDetailResponse>(
      `/products/${encodeURIComponent(slug)}`,
      { revalidate: false },
    );
  } catch (err) {
    if (err instanceof StorefrontApiError && err.status === 404) return null;
    return null;
  }
}

export async function getCombos(page = 1): Promise<Paginated<ProductCardDTO>> {
  try {
    return await storefrontFetch<Paginated<ProductCardDTO>>(`/combos?page=${page}`, {
      revalidate: false,
    });
  } catch {
    return { items: [], total: 0, page, pageSize: 24, pageCount: 1 };
  }
}

export async function getCustomerMe(token?: string | null): Promise<StorefrontCustomer | null> {
  const jwt = token ?? (await getCustomerToken());
  if (!jwt) return null;
  try {
    return await storefrontFetch<StorefrontCustomer>('/auth/me', {
      token: jwt,
      revalidate: false,
    });
  } catch {
    return null;
  }
}

export async function getMyOrders(token?: string | null): Promise<OrderRowDTO[]> {
  const jwt = token ?? (await getCustomerToken());
  if (!jwt) return [];
  try {
    return await storefrontFetch<OrderRowDTO[]>('/orders/my', {
      token: jwt,
      revalidate: false,
    });
  } catch {
    return [];
  }
}

export async function getMyOrderDetail(id: string, token?: string | null): Promise<OrderDTO | null> {
  const jwt = token ?? (await getCustomerToken());
  if (!jwt) return null;
  try {
    return await storefrontFetch<OrderDTO>(`/orders/my/${encodeURIComponent(id)}`, {
      token: jwt,
      revalidate: false,
    });
  } catch {
    return null;
  }
}

export async function getMyAddresses(token?: string | null): Promise<AddressDTO[]> {
  const jwt = token ?? (await getCustomerToken());
  if (!jwt) return [];
  try {
    return await storefrontFetch<AddressDTO[]>('/addresses', {
      token: jwt,
      revalidate: false,
    });
  } catch {
    return [];
  }
}

export type ExpressOrderData = {
  product: ProductDetailDTO;
  reviews: ReviewDTO[] | { reviews: ReviewDTO[]; counts?: Record<number, number> };
  addresses: AddressDTO[];
  fees: { inside_dhaka: number; outside_dhaka: number };
  supportPhone?: string;
  whatsappUrl?: string | null;
};

export async function getExpressOrderData(
  slug: string,
  token?: string | null,
): Promise<ExpressOrderData | null> {
  const jwt = token ?? (await getCustomerToken());
  try {
    return await storefrontFetch<ExpressOrderData>(`/order/${encodeURIComponent(slug)}`, {
      token: jwt,
      revalidate: false,
    });
  } catch {
    return null;
  }
}

export async function trackStorefrontOrder(
  orderNumber: string,
  phone: string,
): Promise<OrderDTO | null> {
  const sp = new URLSearchParams({ orderNumber, phone });
  return storefrontFetch<OrderDTO>(`/orders/track?${sp.toString()}`, { revalidate: false });
}
