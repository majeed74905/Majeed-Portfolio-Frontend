import { PortraitCard } from '@/components/PortraitCard'
import { Reveal } from '@/components/Reveal'
import { about } from '@/content'
import { resolved, resolvedList } from '@/types/content'

/**
 * About.
 *
 * The one section that stays inside the cabin. The portrait is placed over the
 * desk-and-fireplace side of the footage so it reads as a person in that
 * workspace, rather than a headshot pasted onto a dark page.
 *
 * Column order is set by the contrast measurement in docs/SPEC.md §3, not by
 * taste: the left of frame is the darkest zone (median luminance 0.066), so
 * that is where the body copy goes; the portrait takes the warmer right side,
 * where it has its own frame and glass to sit on.
 *
 * Everything still degrades — the biography, philosophy and any unfilled field
 * simply do not render.
 */
export function AboutSection() {
  const portraitSrc = resolved(about.portrait.src)
  const biography = resolvedList(about.biography)
  const philosophy = about.philosophy.filter(
    (item) => resolved(item.title) && resolved(item.body),
  )

  return (
    <div className="relative isolate">
      {/* Local scrim. This section sits on live video, so it cannot rely on the
          page's solid ground — it carries the darkening it needs, weighted to
          the left where the copy is.
          The vertical mask ramps it in rather than switching it on: applied
          flat, it produced a hard horizontal seam at the hero boundary where
          un-scrimmed footage met full-strength scrim. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'linear-gradient(to right, rgb(var(--scrim-rgb) / 0.88) 0%, rgb(var(--scrim-rgb) / 0.8) 42%, rgb(var(--scrim-rgb) / 0.45) 100%)',
          maskImage:
            'linear-gradient(to bottom, transparent 0%, black 12%, black 100%)',
          WebkitMaskImage:
            'linear-gradient(to bottom, transparent 0%, black 12%, black 100%)',
        }}
      />
      {/* Settle to solid ground before Skills begins, so the handoff to the
          rest of the page has no second seam. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'linear-gradient(to bottom, transparent 72%, var(--color-bg) 100%)',
        }}
      />

      <section
        id="about"
        aria-labelledby="about-heading"
        className="mx-auto w-full max-w-[var(--width-content)] scroll-mt-24 px-[var(--space-gutter)] py-[var(--space-section)]"
      >
        <p className="mb-[var(--space-sm)] font-mono text-caption uppercase text-gold">
          About
        </p>
        <h2 id="about-heading" className="text-h2 text-ink">
          About
        </h2>

        <div className="mt-[var(--space-lg)] grid items-start gap-[var(--space-xl)] md:grid-cols-[minmax(0,1fr)_320px]">
          {/* Copy — on the dark side of the frame */}
          <div>
            <p className="max-w-[var(--width-prose)] text-body-lg text-ink">
              {about.introduction}
            </p>

            {biography.length > 0 && (
              <div className="mt-[var(--space-md)] space-y-[var(--space-sm)]">
                {biography.map((paragraph) => (
                  <p
                    key={paragraph}
                    className="max-w-[var(--width-prose)] text-body text-ink-secondary"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            )}

            {about.facts.length > 0 && (
              <dl className="mt-[var(--space-lg)] grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-4">
                {about.facts.map((fact) => (
                  <div
                    key={fact.label}
                    className="bg-surface/80 p-[var(--space-sm)] backdrop-blur-sm"
                  >
                    <dt className="font-mono text-caption uppercase text-muted">
                      {fact.label}
                    </dt>
                    <dd className="mt-1 text-body text-gold">{fact.value}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>

          {/* Portrait — placed over the desk and firelight */}
          {portraitSrc && (
            <PortraitCard
              image={about.portrait}
              src={portraitSrc}
              caption="MCA · Periyar University"
            />
          )}
        </div>

        {/* What I do */}
        {about.expertise.length > 0 && (
          <div className="mt-[var(--space-xl)]">
            <h3 className="font-mono text-caption uppercase text-gold">
              What I do
            </h3>
            <ul className="mt-[var(--space-md)] grid gap-[var(--space-sm)] sm:grid-cols-2 lg:grid-cols-4">
              {about.expertise.map((item, index) => (
                <Reveal key={item.title} as="li" index={index} className="h-full">
                  <div className="glass-panel h-full p-[var(--space-md)] transition-colors duration-normal ease-cinematic hover:border-gold/40">
                    <h4 className="text-h3 text-ink">{item.title}</h4>
                    <p className="mt-[var(--space-xs)] text-body text-ink-secondary">
                      {item.summary}
                    </p>
                  </div>
                </Reveal>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-[var(--space-xl)] grid gap-[var(--space-xl)] md:grid-cols-2">
          {/* Education — institutions confirmed, dates not, so dates appear
              only once they are filled in. */}
          {about.education.length > 0 && (
            <div>
              <h3 className="font-mono text-caption uppercase text-gold">
                Education
              </h3>
              <ul className="mt-[var(--space-md)] divide-y divide-border border-y border-border">
                {about.education.map((entry) => {
                  const start = resolved(entry.start)
                  const end = resolved(entry.end)
                  const location = resolved(entry.location)
                  const period =
                    start && end ? `${start} — ${end}` : (start ?? end)

                  return (
                    <li
                      key={`${entry.degree}-${entry.institution}`}
                      className="flex flex-wrap items-baseline justify-between gap-x-[var(--space-md)] gap-y-1 py-[var(--space-sm)]"
                    >
                      <div>
                        <p className="text-body text-ink">{entry.degree}</p>
                        <p className="text-caption text-muted">
                          {entry.institution}
                          {location ? ` · ${location}` : ''}
                        </p>
                      </div>
                      {period && (
                        <p className="font-mono text-caption text-muted">
                          {period}
                        </p>
                      )}
                    </li>
                  )
                })}
              </ul>
            </div>
          )}

          {about.interests.length > 0 && (
            <div>
              <h3 className="font-mono text-caption uppercase text-gold">
                Interests
              </h3>
              <ul className="mt-[var(--space-md)] flex flex-wrap gap-[var(--space-xs)]">
                {about.interests.map((interest) => (
                  <li
                    key={interest}
                    className="rounded-pill border border-border bg-surface/50 px-[var(--space-md)] py-1.5 text-caption text-ink-secondary backdrop-blur-sm"
                  >
                    {interest}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {philosophy.length > 0 && (
          <div className="mt-[var(--space-xl)] space-y-[var(--space-md)]">
            {philosophy.map((item) => (
              <blockquote
                key={item.title}
                className="border-l-2 border-gold pl-[var(--space-md)]"
              >
                <p className="text-h3 text-ink">{item.title}</p>
                <p className="mt-[var(--space-xs)] max-w-[var(--width-prose)] text-body text-ink-secondary">
                  {item.body}
                </p>
              </blockquote>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
