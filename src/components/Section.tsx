import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import type { SectionId } from '@/types/content'

interface Props {
  readonly id: SectionId
  readonly eyebrow?: string
  readonly heading: string
  readonly children?: ReactNode
  readonly className?: string
}

/**
 * Shared shell for every top-level section: the anchor target, the vertical
 * rhythm, the max width, and the heading pattern.
 *
 * Sections get their spacing from here so no component invents its own
 * section padding.
 */
export function Section({ id, eyebrow, heading, children, className }: Props) {
  const headingId = `${id}-heading`

  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={cn(
        'mx-auto w-full max-w-[var(--width-content)] scroll-mt-24 px-[var(--space-gutter)] py-[var(--space-section)]',
        className,
      )}
    >
      {eyebrow && (
        <p className="mb-[var(--space-sm)] font-mono text-caption uppercase text-gold">
          {eyebrow}
        </p>
      )}
      <h2 id={headingId} className="text-h2 text-ink">
        {heading}
      </h2>
      {children}
    </section>
  )
}

/**
 * Placeholder body for sections not yet implemented.
 *
 * Deliberately plain and clearly labelled — a half-styled fake section is
 * harder to reason about than an obvious stub.
 */
export function SectionStub({ note }: { readonly note: string }) {
  return (
    <p className="mt-[var(--space-md)] max-w-[var(--width-prose)] text-body text-muted">
      {note}
    </p>
  )
}
