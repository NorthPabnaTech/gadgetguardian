import { ProductChatProvider } from '@/features/chat/whatsapp-widget';
import { getBootstrapData, getCustomerMe } from '@lib/storefront-client';

import { CartDrawer } from './components/cart-drawer';
import { OfferModal } from './components/offer-modal';
import { SiteFooter } from './components/site-footer';
import { SiteHeader } from './components/site-header';

export const dynamic = 'force-dynamic';

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const [bootstrap, user] = await Promise.all([getBootstrapData(), getCustomerMe()]);
  const { settings, categories, campaigns = [] } = bootstrap;
  const modalCampaign = campaigns.find((c) => c.showModal) ?? null;

  return (
    <ProductChatProvider>
      <div className="flex min-h-dvh flex-col">
        <a
          href="#main"
          className="focus:bg-brand focus:text-brand-contrast sr-only z-50 focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:rounded-lg focus:px-4 focus:py-2"
        >
          Skip to content
        </a>
        <SiteHeader
          categories={categories}
          user={user ? { name: user.name, role: 'customer', avatarUrl: user.avatarUrl } : null}
          supportPhone={settings.supportPhone}
          announcement={settings.announcement}
        />
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter settings={settings} categories={categories} />
        <CartDrawer />
        <OfferModal campaign={modalCampaign} />
      </div>
    </ProductChatProvider>
  );
}
