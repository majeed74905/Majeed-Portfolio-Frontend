import { site } from '@/content'
import { cn } from '@/lib/cn'
import { resolved } from '@/types/content'

interface Props {
  readonly className?: string
  /**
   * Distinguishes this landmark from the other instance on the page. Two
   * <nav> elements sharing an accessible name is a real WCAG failure — a
   * screen-reader user gets two identical "Social links" entries in the
   * landmark list with no way to tell them apart.
   */
  readonly label: string
}

/**
 * Social links.
 *
 * Renders only links whose href is real — an unfilled profile disappears
 * rather than shipping as a dead link to `#`.
 */
export function SocialLinks({ className, label }: Props) {
  const links = site.social
    .map((link) => ({ ...link, href: resolved(link.href) }))
    .filter((link): link is { label: string; href: string; external?: boolean } =>
      Boolean(link.href),
    )

  if (links.length === 0) return null

  return (
    <nav aria-label={label} className={className}>
      <ul className="flex flex-wrap gap-[var(--space-md)]">
        {links.map((link) => (
          <li key={link.label}>
            <a
              href={link.href}
              {...(link.external
                ? { target: '_blank', rel: 'noreferrer noopener' }
                : {})}
              className={cn(
                'font-mono text-caption uppercase text-ink-secondary',
                'underline-offset-4 transition-colors duration-fast ease-standard',
                'hover:text-gold hover:underline',
              )}
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
