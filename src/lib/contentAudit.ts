import {
  about,
  achievements,
  career,
  contacts,
  home,
  projects,
  site,
  skills,
} from '@/content'

/**
 * Development-only content audit.
 *
 * Unfilled fields are invisible by design — `resolved()` hides them — which is
 * right for visitors and dangerous for the author, because a section can look
 * finished while being mostly empty. This reports the exact path of every
 * outstanding field, grouped by section, once on boot.
 *
 * Stripped from production by the `import.meta.env.DEV` guard.
 */

interface Finding {
  readonly path: string
  readonly marker: string
}

function findTodos(value: unknown, path: string, out: Finding[]): void {
  if (typeof value === 'string') {
    if (value.startsWith('TODO_REPLACE_')) out.push({ path, marker: value })
    return
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => findTodos(item, `${path}[${index}]`, out))
    return
  }
  if (value && typeof value === 'object') {
    Object.entries(value).forEach(([key, item]) =>
      findTodos(item, path ? `${path}.${key}` : key, out),
    )
  }
}

export function auditContent(): void {
  if (!import.meta.env.DEV) return

  const sections: Record<string, unknown> = {
    site,
    home,
    about,
    skills,
    projects,
    career,
    achievements,
    contacts,
  }

  const bySection = new Map<string, Finding[]>()
  let total = 0

  for (const [name, value] of Object.entries(sections)) {
    const found: Finding[] = []
    findTodos(value, '', found)
    bySection.set(name, found)
    total += found.length
  }

  // Structural gaps that are not TODO strings but still mean "unfinished".
  const structural: string[] = []
  if (achievements.items.length === 0) {
    structural.push(
      'achievements: no entries — section renders its empty state. Add real ones or remove it from site.ts nav.',
    )
  }
  projects.items.forEach((project) => {
    if (project.technologies.length === 0) {
      structural.push(`projects.${project.slug}: technologies list is empty`)
    }
    if (project.gallery.length === 0) {
      structural.push(`projects.${project.slug}: no screenshots`)
    }
  })
  if (!career.entries.some((entry) => entry.type === 'experience')) {
    structural.push('career: no work experience entries (fine if there is none yet)')
  }

  if (total === 0 && structural.length === 0) {
    console.info(
      '%c✓ Content complete — nothing outstanding.',
      'color:#4e9070;font-weight:bold',
    )
    return
  }

  console.groupCollapsed(
    `%cContent audit — ${total} unfilled field${total === 1 ? '' : 's'}, ${structural.length} structural gap${structural.length === 1 ? '' : 's'} %c(dev only)`,
    'color:#d9a855;font-weight:bold',
    'color:#8e887b;font-weight:normal',
  )

  for (const [name, found] of bySection) {
    if (found.length === 0) {
      console.log(`%c✓ ${name}`, 'color:#4e9070')
      continue
    }
    console.groupCollapsed(
      `%c● ${name}%c — ${found.length}`,
      'color:#d9a855',
      'color:#8e887b',
    )
    found.forEach((finding) => console.log(`${finding.path}  →  ${finding.marker}`))
    console.groupEnd()
  }

  if (structural.length > 0) {
    console.groupCollapsed('%c● structural', 'color:#d97a63')
    structural.forEach((note) => console.log(note))
    console.groupEnd()
  }

  console.log('\nList them in the terminal:  grep -r "TODO_REPLACE_" src/content/')
  console.groupEnd()
}
