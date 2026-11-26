import type { Metadata } from 'next';
import Link from 'next/link';

import { ProductGrid } from '@/features/products/product-card';
import { Pager } from '@components/common/pager';
import { Icon } from '@components/icon/icon';
import { parseProductFilters, type SearchParams, withParams } from '@lib/search-params';
import { getBootstrapData, getProducts } from '@lib/storefront-client';

import { ProductFilters } from './components/product-filters';
import { SortSelect } from './components/sort-select';

export const dynamic = 'force-dynamic';

type Props = { searchParams: Promise<SearchParams> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const f = parseProductFilters(await searchParams);
  if (f.q) return { title: `Search: ${f.q}`, robots: { index: false } };
  if (f.category) {
    const { categories } = await getBootstrapData();
    const cat = categories.flatMap((c) => [c, ...c.children]).find((c) => c.slug === f.category);
    if (cat)
      return {
        title: cat.name,
        description: cat.description,
        alternates: { canonical: `/products?category=${cat.slug}` },
      };
  }
  return {
    title: f.onSale ? 'Deals' : 'Shop all products',
    alternates: { canonical: '/products' },
  };
}

export default async function ProductsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const filters = parseProductFilters(sp);
  const [result, { categories }] = await Promise.all([
    getProducts(filters),
    getBootstrapData(),
  ]);

  const flat = categories.flatMap((c) => [
    c,
    ...c.children.map((s) => ({ ...s, parentName: c.name })),
  ]);
  const current = flat.find((c) => c.slug === filters.category);
  const title = filters.q
    ? `Results for “${filters.q}”`
    : (current?.name ?? (filters.onSale ? 'Deals' : 'All products'));

  return (
    <div className="container-page py-10">
      <nav aria-label="Breadcrumb" className="text-muted mb-4 flex items-center gap-1.5 text-xs">
        <Link href="/" className="hover:text-ink">
          Home
        </Link>
        <Icon name="chevRight" size={11} />
        <Link href="/products" className="hover:text-ink">
          Shop
        </Link>
        {current && (
          <>
            <Icon name="chevRight" size={11} />
            <span className="text-ink">{current.name}</span>
          </>
        )}
      </nav>

      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="type-display text-ink">{title}</h1>
          <p className="text-muted mt-1.5 text-sm">
            {result.total} {result.total === 1 ? 'product' : 'products'}
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="lg:hidden">
            <ProductFilters variant="sheet" categories={categories} tags={[]} />
          </div>
          <SortSelect />
        </div>
      </header>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[240px_minmax(0,1fr)]">
        <div className="hidden lg:block">
          <ProductFilters variant="sidebar" categories={categories} tags={[]} />
        </div>
        <div>
          {result.items.length > 0 ? (
            <>
              <ProductGrid products={result.items} className="lg:grid-cols-3 xl:grid-cols-4" />
              <Pager
                className="mt-14"
                page={result.page}
                pageCount={result.pageCount}
                hrefFor={(page) => withParams('/products', sp, { page })}
              />
            </>
          ) : (
            <div className="bg-cream flex flex-col items-center rounded-3xl px-6 py-20 text-center">
              <span className="bg-panel text-accent grid size-16 place-items-center rounded-full">
                <Icon name="search" size={26} />
              </span>
              <h2 className="font-display text-ink mt-5 text-2xl">No products found</h2>
              <p className="text-muted mt-2 max-w-sm text-sm">
                Try a different search or remove some filters to see more products.
              </p>
              <Link
                href="/products"
                className="bg-noir mt-6 rounded-full px-6 py-3 text-sm font-semibold text-white"
              >
                View all products
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
