'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRouter } from 'nextjs-toploader/app';

import { Icon, type IconRegistryKey } from '@components/icon/icon';
import { cn } from '@lib/utils';

const LINKS: { href: string; label: string; icon: IconRegistryKey }[] = [
  { href: '/account', label: 'Profile', icon: 'userCircle' },
  { href: '/account/orders', label: 'My orders', icon: 'box' },
  { href: '/account/addresses', label: 'Addresses', icon: 'location' },
];

export function AccountNav() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
    router.refresh();
  };

  return (
    <nav
      className="scrollbar-hidden flex gap-2 overflow-x-auto lg:flex-col lg:gap-1"
      aria-label="Account"
    >
      {LINKS.map((l) => {
        const active =
          l.href === '/account' ? pathname === '/account' : pathname.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'flex shrink-0 items-center gap-3 rounded-full px-4 py-2.5 text-sm font-medium transition lg:rounded-xl',
              active ? 'bg-noir text-white' : 'text-ink hover:bg-well',
            )}
          >
            <Icon name={l.icon} size={18} className={active ? 'text-brand-300' : 'text-muted'} />
            <span className="cap-trim">{l.label}</span>
          </Link>
        );
      })}
      <div className="shrink-0 lg:mt-4">
        <button
          type="button"
          onClick={handleLogout}
          className="text-muted hover:text-ink hover:bg-well flex w-full items-center gap-3 rounded-full px-4 py-2.5 text-sm font-medium lg:rounded-xl"
        >
          <Icon name="logout" size={18} /> Sign out
        </button>
      </div>
    </nav>
  );
}
