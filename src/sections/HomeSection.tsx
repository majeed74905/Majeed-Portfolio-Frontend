import { ScrollCue } from '@/components/ScrollCue'
import { SocialLinks } from '@/components/SocialLinks'
import { home, site } from '@/content'
import { resolved } from '@/types/content'

/**
 * Hero — and only the hero.
 *
 * Home is deliberately one screen: greeting, name, headline, roles, a short
 * introduction, two actions and the social links. Nothing else.
 *
 * The featured project cards, technology list, music player and notes panel
 * used to sit below the fold here. They were removed because they turned the
 * opening into a dashboard and duplicated what Projects and Skills already say
 * properly further down. The first screen introduces a person; the sections
 * after it do the explaining.
 *
 * The copy column is constrained to the left on desktop because that is the
 * only zone of the footage with enough contrast headroom for bare ink; see
 * docs/SPEC.md §3.
 */
export function HomeSection() {
  const resumeHref = resolved(home.resume.href)

  return (
    <section
      id="home"
      aria-labelledby="home-heading"
      className="mx-auto flex min-h-[100svh] w-full max-w-[var(--width-content)] flex-col justify-center px-[var(--space-gutter)] pb-[var(--space-2xl)] pt-32"
    >
      <div className="relative flex flex-1 flex-col justify-center">
        <div className="md:max-w-[58%]">
          <p className="font-mono text-caption uppercase text-gold">
            {home.greeting}
          </p>

          <h1
            id="home-heading"
            className="mt-[var(--space-md)] text-display text-ink"
          >
            {site.name}
          </h1>

          <p className="mt-[var(--space-md)] text-body-lg text-ink-secondary">
            {home.headline}
          </p>

          <ul className="mt-[var(--space-md)] flex flex-wrap gap-x-[var(--space-md)] gap-y-[var(--space-xs)]">
            {home.roles.map((role) => (
              <li
                key={role}
                className="font-mono text-caption uppercase text-ink-secondary"
              >
                {role}
              </li>
            ))}
          </ul>

          <p className="mt-[var(--space-lg)] max-w-[var(--width-prose)] text-body text-ink-secondary">
            {home.introduction}
          </p>

          <div className="mt-[var(--space-xl)] flex flex-wrap items-center gap-[var(--space-sm)]">
            <a
              href={home.primaryCta.href}
              className="rounded-pill bg-gold px-[var(--space-lg)] py-[var(--space-sm)] text-caption font-medium uppercase text-bg-deep transition-colors duration-fast ease-standard hover:bg-gold-soft"
            >
              {home.primaryCta.label}
            </a>

            {/* The résumé button only exists once there is a résumé to link. */}
            {resumeHref && (
              <a
                href={resumeHref}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-pill border border-border-strong px-[var(--space-lg)] py-[var(--space-sm)] text-caption uppercase text-ink transition-colors duration-fast ease-standard hover:border-gold hover:text-gold"
              >
                {home.resume.label}
              </a>
            )}
          </div>

          <SocialLinks
            label="Social profiles"
            className="mt-[var(--space-lg)]"
          />
        </div>

        <ScrollCue targetId="about" />
      </div>
    </section>
  )
}
