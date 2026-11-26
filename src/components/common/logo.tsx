import Image from 'next/image';
import Link from 'next/link';

import { SITE } from '@config/site';
import { cn } from '@lib/utils';

type Props = {
  /** `light` = for dark (noir) backgrounds; `dark` = for light backgrounds. */
  tone?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  /** Show the tagline under the logo. */
  tagline?: boolean;
  href?: string | null;
  className?: string;
};

const SIZES = {
  sm: { mark: 44, tag: 'text-[8px]' },
  md: { mark: 58, tag: 'text-[9px]' },
  lg: { mark: 76, tag: 'text-[10px]' },
};

/**
 * The Gadget Guardian logo mark.
 */
export function Logo({
  tone = 'dark',
  size = 'md',
  tagline = false,
  href = '/',
  className,
}: Props) {
  const s = SIZES[size];

  const content = (
    <span className={cn('inline-flex flex-col', tagline ? 'items-start' : 'items-center', className)}>
      <Image
        src="/brand/Gadget_Guardian_Logo.png"
        alt={SITE.name}
        width={s.mark}
        height={s.mark}
        priority
        className="block shrink-0 object-contain"
        style={{ width: s.mark, height: s.mark }}
      />
      {tagline && (
        <span
          className={cn(
            'cap-trim mt-3 block leading-none font-semibold tracking-[0.25em] uppercase',
            tone === 'light' ? 'text-noir-fg' : 'text-muted',
            s.tag,
          )}
        >
          {SITE.tagline}
        </span>
      )}
      <span className="sr-only">{SITE.name}</span>
    </span>
  );

  return href ? (
    <Link
      href={href}
      aria-label={`${SITE.name} home`}
      className="focus-ring inline-flex items-center rounded-md"
    >
      {content}
    </Link>
  ) : (
    content
  );
}
