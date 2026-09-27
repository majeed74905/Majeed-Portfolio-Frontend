import { Reveal } from '@/components/Reveal'
import { Section } from '@/components/Section'
import { skills } from '@/content'

/**
 * Skills.
 *
 * Grouped by where a technology sits in a system. Deliberately **no proficiency
 * bars or percentages** — they are unverifiable, every portfolio claims 90%,
 * and a reader learns nothing from them. The categories carry the information
 * instead: knowing someone works across FastAPI, PostgreSQL and Prisma says
 * more than three identical progress bars.
 */
export function SkillsSection() {
  return (
    <Section id="skills" eyebrow={skills.eyebrow} heading={skills.heading}>
      <p className="mt-[var(--space-sm)] max-w-[var(--width-prose)] text-body text-ink-secondary">
        {skills.introduction}
      </p>

      <ul className="mt-[var(--space-xl)] grid gap-[var(--space-md)] sm:grid-cols-2 lg:grid-cols-3">
        {skills.categories.map((category, index) => (
          <Reveal key={category.id} index={index} as="li" className="h-full">
            <div className="group glass-panel h-full p-[var(--space-md)] transition-[border-color,transform] duration-normal ease-cinematic hover:-translate-y-1 hover:border-gold/40">
              <h3 className="text-h3 text-ink">{category.label}</h3>
              <p className="mt-[var(--space-xs)] text-caption normal-case text-muted">
                {category.summary}
              </p>

              <ul className="mt-[var(--space-md)] flex flex-wrap gap-[var(--space-xs)]">
                {category.skills.map((skill) => (
                  <li
                    key={skill.name}
                    className="rounded-pill border border-border bg-surface/60 px-[var(--space-sm)] py-1 font-mono text-caption normal-case text-ink-secondary transition-colors duration-fast ease-standard group-hover:border-border-strong"
                  >
                    {skill.name}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        ))}
      </ul>
    </Section>
  )
}
