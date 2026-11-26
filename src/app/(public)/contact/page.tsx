import type { Metadata } from 'next';

import { Icon, type IconRegistryKey } from '@components/icon/icon';
import { SITE } from '@config/site';
import { getBootstrapData } from '@lib/storefront-client';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'Contact us' };

export default async function ContactPage() {
  const { settings: s } = await getBootstrapData();
  const cards: [IconRegistryKey, string, string, string | undefined][] = [
    ['location', 'Visit us', SITE.support.address, undefined],
  ];
  if (s.supportEmail) cards.push(['mail', 'Email', s.supportEmail, `mailto:${s.supportEmail}`]);
  return (
    <div className="container-page max-w-4xl py-14">
      <p className="text-accent text-[11px] font-bold tracking-[0.22em] uppercase">
        We’re here to help
      </p>
      <h1 className="type-display text-ink mt-2">Contact {SITE.name}</h1>
      <p className="text-muted mt-3 max-w-lg">
        Questions about a product, an order or a delivery? Reach out — we usually reply within a few
        hours.
      </p>
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {cards.map(([icon, title, value, href]) => {
          const body = (
            <>
              <span className="bg-noir text-brand-300 grid size-12 place-items-center rounded-2xl">
                <Icon name={icon} size={22} />
              </span>
              <div className="cap-trim">
                <p className="text-muted text-sm leading-tight">{title}</p>
                <p className="text-ink mt-1.5 leading-tight font-semibold">{value}</p>
              </div>
            </>
          );
          return href ? (
            <a
              key={title}
              href={href}
              className="bg-cream hover:shadow-pop flex items-center gap-4 rounded-3xl p-6 transition"
            >
              {body}
            </a>
          ) : (
            <div key={title} className="bg-cream flex items-center gap-4 rounded-3xl p-6">
              {body}
            </div>
          );
        })}
      </div>
    </div>
  );
}
