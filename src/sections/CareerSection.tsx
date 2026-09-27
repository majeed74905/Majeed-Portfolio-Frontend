import { Reveal } from '@/components/Reveal'
import { Section } from '@/components/Section'
import { career } from '@/content'
import { resolved, type CareerEntry } from '@/types/content'

const TYPE_LABEL: Record<CareerEntry['type'], string> = {
  education: 'Education',
  experience: 'Experience',
  milestone: 'Milestone',
}

/**
 * Career.
 *
 * A vertical timeline with a continuous rail. Only education entries exist so
 * far and that is fine — it reads honestly as an education timeline rather
 * than pretending to a work history that has not happened yet.
 */
export function CareerSection() {
  const introduction = resolved(career.introduction)

  return (
    <Section id="career" eyebrow={career.eyebrow} heading={career.heading}>
      {introduction && (
        <p className="mt-[var(--space-sm)] max-w-[var(--width-prose)] text-body text-ink-secondary">
          {introduction}
        </p>
      )}

      <ol className="relative mt-[var(--space-xl)] border-l border-border pl-[var(--space-lg)]">
        {career.entries.map((entry, index) => {
          const start = resolved(entry.start)
          const end = entry.end === 'present' ? 'Present' : resolved(entry.end)
          const location = resolved(entry.location)
          const description = resolved(entry.description)
          const period =
            start && end ? `${start} — ${end}` : (start ?? end ?? null)

          return (
            <Reveal
              key={entry.id}
              as="li"
              index={index}
              className="relative pb-[var(--space-xl)] last:pb-0"
            >
              {/* Node on the rail */}
              <span
                aria-hidden="true"
                className="absolute -left-[calc(var(--space-lg)+5px)] top-2 h-2.5 w-2.5 rounded-pill border border-gold bg-bg"
              />

              <div className="flex flex-wrap items-baseline gap-x-[var(--space-sm)]">
                <span className="font-mono text-caption uppercase text-gold">
                  {TYPE_LABEL[entry.type]}
                </span>
                {period && (
                  <span className="font-mono text-caption text-muted">
                    {period}
                  </span>
                )}
              </div>

              <h3 className="mt-1 text-h3 text-ink">{entry.title}</h3>

              <p className="text-body text-ink-secondary">
                {entry.organization}
                {location ? ` · ${location}` : ''}
              </p>

              {description && (
                <p className="mt-[var(--space-xs)] max-w-[var(--width-prose)] text-body text-muted">
                  {description}
                </p>
              )}

              {entry.technologies.length > 0 && (
                <ul className="mt-[var(--space-sm)] flex flex-wrap gap-[var(--space-xs)]">
                  {entry.technologies.map((tech) => (
                    <li
                      key={tech}
                      className="rounded-pill border border-border px-[var(--space-sm)] py-0.5 font-mono text-caption text-ink-secondary"
                    >
                      {tech}
                    </li>
                  ))}
                </ul>
              )}
            </Reveal>
          )
        })}
      </ol>
    </Section>
  )
}
