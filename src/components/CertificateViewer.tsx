import { useEffect, useRef } from 'react'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { resolved, type Achievement } from '@/types/content'

interface Props {
  readonly achievement: Achievement
  readonly onClose: () => void
}

/**
 * Certificate viewer.
 *
 * Opens the certificate for an achievement: the full image, and the PDF itself
 * where one exists.
 *
 * Built on the native <dialog> element with showModal(), which gives focus
 * trapping, Escape-to-close, background inerting and the correct
 * role="dialog" semantics without any of it being hand-rolled — every one of
 * which is easy to get subtly wrong in a custom modal.
 *
 * The PDF is embedded in an iframe on wide screens only. Mobile browsers
 * routinely refuse to render embedded PDFs (or render them unusably small), so
 * small screens get a prominent "Open PDF" action instead of a broken frame.
 * The action is present at every size, so the PDF is always reachable.
 */
export function CertificateViewer({ achievement, onClose }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const canEmbed = useMediaQuery('(min-width: 1024px)')

  const documentUrl = resolved(achievement.document)
  const verificationUrl = resolved(achievement.verificationUrl)
  const organization = resolved(achievement.organization)
  const date = resolved(achievement.date)
  const description = resolved(achievement.description)
  const imageSrc = achievement.image ? resolved(achievement.image.src) : undefined

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (!dialog.open) dialog.showModal()

    const onCancel = (event: Event) => {
      event.preventDefault()
      onClose()
    }
    dialog.addEventListener('cancel', onCancel)
    return () => dialog.removeEventListener('cancel', onCancel)
  }, [onClose])

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="certificate-title"
      onClick={(event) => {
        // Clicking the backdrop (the dialog element itself) closes it.
        if (event.target === dialogRef.current) onClose()
      }}
      className="m-auto w-[min(92vw,64rem)] max-w-none rounded-lg border border-border-strong bg-surface p-0 text-ink backdrop:bg-bg-deep/80 backdrop:backdrop-blur-sm"
    >
      <div className="flex items-start justify-between gap-[var(--space-md)] border-b border-border p-[var(--space-md)]">
        <div>
          <p className="font-mono text-caption uppercase text-gold">
            {achievement.type}
          </p>
          <h2 id="certificate-title" className="mt-1 text-h3 text-ink">
            {achievement.title}
          </h2>
          {(organization || date) && (
            <p className="mt-1 text-caption normal-case text-muted">
              {organization}
              {organization && date ? ' · ' : ''}
              {date}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-pill border border-border text-ink-secondary transition-colors duration-fast ease-standard hover:border-gold hover:text-gold"
        >
          <span className="sr-only">Close certificate</span>
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <div className="max-h-[70vh] overflow-auto p-[var(--space-md)]">
        {description && (
          <p className="mb-[var(--space-md)] max-w-[var(--width-prose)] text-body text-ink-secondary">
            {description}
          </p>
        )}

        {canEmbed && documentUrl ? (
          <iframe
            src={documentUrl}
            title={`${achievement.title} certificate`}
            className="h-[60vh] w-full rounded-md border border-border bg-bg-deep"
          />
        ) : (
          imageSrc &&
          achievement.image && (
            <img
              src={imageSrc}
              srcSet={achievement.image.srcSet}
              sizes="(max-width: 1024px) 92vw, 60rem"
              alt={achievement.image.alt}
              width={achievement.image.width}
              height={achievement.image.height}
              className="w-full rounded-md border border-border"
            />
          )
        )}
      </div>

      <div className="flex flex-wrap gap-[var(--space-sm)] border-t border-border p-[var(--space-md)]">
        {documentUrl && (
          <a
            href={documentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-pill bg-gold px-[var(--space-lg)] py-[var(--space-xs)] text-caption uppercase text-bg-deep transition-colors duration-fast ease-standard hover:bg-gold-soft"
          >
            Open PDF
            <span className="sr-only">
              {' '}
              — {achievement.title} (opens in a new tab)
            </span>
          </a>
        )}
        {verificationUrl && (
          <a
            href={verificationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-pill border border-border-strong px-[var(--space-lg)] py-[var(--space-xs)] text-caption uppercase text-ink transition-colors duration-fast ease-standard hover:border-gold hover:text-gold"
          >
            Verify
            <span className="sr-only">
              {' '}
              — {achievement.title} (opens in a new tab)
            </span>
          </a>
        )}
      </div>
    </dialog>
  )
}
