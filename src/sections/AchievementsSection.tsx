import { CertificateViewer } from '@/components/CertificateViewer'
import { useCertificateViewer } from '@/hooks/useCertificateViewer'
import { Reveal } from '@/components/Reveal'
import { Section } from '@/components/Section'
import { TiltCard } from '@/components/TiltCard'
import { achievements } from '@/content'
import { resolved, type Achievement } from '@/types/content'

/**
 * Achievements.
 *
 * Each certificate shows its own scan as the card face. Selecting one opens
 * the original PDF in a dialog.
 *
 * The card is a real <button>, not a clickable div: it is reachable by keyboard
 * and announced as an action, so "tap the image to see the PDF" works for
 * people who never touch a pointer. Entries with no published scan still
 * appear — the credential is real even when the document is withheld — they
 * simply render as a text card with no action.
 */
export function AchievementsSection() {
  const introduction = resolved(achievements.introduction)
  const viewer = useCertificateViewer()
  const isEmpty = achievements.items.length === 0

  return (
    <Section
      id="achievements"
      eyebrow={achievements.eyebrow}
      heading={achievements.heading}
    >
      {introduction && (
        <p className="mt-[var(--space-sm)] max-w-[var(--width-prose)] text-body text-ink-secondary">
          {introduction}
        </p>
      )}

      {isEmpty ? (
        <p className="mt-[var(--space-md)] max-w-[var(--width-prose)] text-body text-muted">
          {achievements.emptyState}
        </p>
      ) : (
        <ul className="mt-[var(--space-xl)] grid gap-[var(--space-md)] sm:grid-cols-2 lg:grid-cols-3">
          {achievements.items.map((item, index) => (
            <Reveal key={item.id} as="li" index={index} className="h-full">
              <CertificateCard item={item} onOpen={() => viewer.show(item)} />
            </Reveal>
          ))}
        </ul>
      )}

      {viewer.open && (
        <CertificateViewer achievement={viewer.open} onClose={viewer.close} />
      )}
    </Section>
  )
}

function CertificateCard({
  item,
  onOpen,
}: {
  readonly item: Achievement
  readonly onOpen: () => void
}) {
  const organization = resolved(item.organization)
  const date = resolved(item.date)
  const imageSrc = item.image ? resolved(item.image.src) : undefined
  const hasDocument = Boolean(resolved(item.document))
  const openable = Boolean(imageSrc || hasDocument)

  const body = (
    <div className="glass-panel flex h-full flex-col overflow-hidden text-left">
      {imageSrc && item.image ? (
        <div className="relative overflow-hidden border-b border-border bg-bg-deep">
          <img
            src={imageSrc}
            srcSet={item.image.srcSet}
            sizes={item.image.sizes}
            alt={item.image.alt}
            loading="lazy"
            decoding="async"
            className="aspect-[4/3] w-full object-cover object-top transition-transform duration-slow ease-cinematic group-hover:scale-[1.03]"
          />
          {hasDocument && (
            <span
              aria-hidden="true"
              className="absolute bottom-2 right-2 rounded-pill bg-bg-deep/80 px-[var(--space-sm)] py-0.5 font-mono text-caption uppercase text-gold backdrop-blur-sm"
            >
              PDF
            </span>
          )}
        </div>
      ) : null}

      <div className="flex flex-1 flex-col p-[var(--space-md)]">
        <span className="font-mono text-caption uppercase text-gold">
          {item.type}
        </span>
        <h3 className="mt-[var(--space-xs)] text-h3 text-ink">{item.title}</h3>
        {(organization || date) && (
          <p className="mt-1 text-caption normal-case text-muted">
            {organization}
            {organization && date ? ' · ' : ''}
            {date}
          </p>
        )}
        {openable && (
          <span className="mt-auto pt-[var(--space-md)] font-mono text-caption uppercase text-ink-secondary transition-colors duration-fast ease-standard group-hover:text-gold">
            View certificate →
          </span>
        )}
      </div>
    </div>
  )

  if (!openable) {
    return <div className="h-full">{body}</div>
  }

  return (
    <TiltCard maxTilt={4} className="h-full">
      <button
        type="button"
        onClick={onOpen}
        className="group h-full w-full cursor-pointer rounded-lg text-left"
      >
        <span className="sr-only">
          View the {item.title} certificate
          {organization ? ` from ${organization}` : ''}
        </span>
        <span aria-hidden="true" className="block h-full">
          {body}
        </span>
      </button>
    </TiltCard>
  )
}
