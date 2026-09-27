import { Reveal } from '@/components/Reveal'
import { TiltCard } from '@/components/TiltCard'
import { projects } from '@/content'
import { resolved, type Project } from '@/types/content'

interface Props {
  readonly slugs: readonly string[]
}

/**
 * Featured project cards for the hero.
 *
 * A teaser, not a duplicate of the Projects section: title, category, a short
 * description when there is one, a few technologies, and a link down to the
 * full entry. Every field is independently optional, so a card with only a
 * title still looks deliberate rather than broken.
 */
export function FeaturedProjects({ slugs }: Props) {
  const featured = slugs
    .map((slug) => projects.items.find((project) => project.slug === slug))
    .filter((project): project is Project => project !== undefined)

  if (featured.length === 0) return null

  return (
    <div>
      <h2 className="font-mono text-caption uppercase text-gold">
        Featured work
      </h2>

      <ul className="mt-[var(--space-md)] grid gap-[var(--space-sm)] sm:grid-cols-2 lg:grid-cols-3">
        {featured.map((project, index) => {
          const summary = resolved(project.summary)
          const technologies = project.technologies.slice(0, 3)

          return (
            <Reveal key={project.slug} as="li" index={index} className="h-full">
              <TiltCard className="h-full" maxTilt={4}>
                <a
                  href="#projects"
                  className="glass-panel group flex h-full flex-col p-[var(--space-md)] transition-colors duration-normal ease-cinematic hover:border-gold/40"
                >
                  <span className="font-mono text-caption uppercase text-gold">
                    {project.category}
                  </span>

                  <h3 className="mt-[var(--space-xs)] text-h3 text-ink">
                    {project.shortTitle ?? project.title}
                  </h3>

                  {project.organization && (
                    <p className="mt-1 text-caption normal-case text-muted">
                      {project.organization}
                    </p>
                  )}

                  {summary && (
                    <p className="mt-[var(--space-xs)] text-body text-ink-secondary">
                      {summary}
                    </p>
                  )}

                  {technologies.length > 0 && (
                    <ul className="mt-[var(--space-sm)] flex flex-wrap gap-[var(--space-xs)]">
                      {technologies.map((tech) => (
                        <li
                          key={tech}
                          className="rounded-pill border border-border px-[var(--space-sm)] py-0.5 font-mono text-caption text-ink-secondary"
                        >
                          {tech}
                        </li>
                      ))}
                    </ul>
                  )}

                  <span className="mt-auto pt-[var(--space-md)] font-mono text-caption uppercase text-ink-secondary transition-colors duration-fast ease-standard group-hover:text-gold">
                    View project →
                  </span>
                </a>
              </TiltCard>
            </Reveal>
          )
        })}
      </ul>
    </div>
  )
}
