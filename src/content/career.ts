import type { CareerContent } from '@/types/content'

/**
 * Only the two degrees and their institutions are confirmed. Dates, locations
 * and descriptions are not — leave them as TODO rather than approximating.
 *
 * No work experience has been supplied. If there is none yet, that is fine:
 * the timeline reads honestly as an education timeline. Do not invent roles.
 */
export const career: CareerContent = {
  eyebrow: 'Career',
  heading: 'The path so far',
  introduction: 'TODO_REPLACE_CAREER_INTRODUCTION',

  entries: [
    {
      id: 'mca-periyar',
      title: 'Master of Computer Applications',
      organization: 'Periyar University',
      type: 'education',
      start: 'TODO_REPLACE_MCA_START_YEAR',
      end: 'TODO_REPLACE_MCA_END_YEAR',
      location: 'TODO_REPLACE_MCA_LOCATION',
      description: 'TODO_REPLACE_MCA_DESCRIPTION',
      technologies: [],
    },
    {
      id: 'bca-islamiah',
      title: 'Bachelor of Computer Applications',
      organization: 'Islamiah College (Autonomous)',
      type: 'education',
      start: 'TODO_REPLACE_BCA_START_YEAR',
      end: 'TODO_REPLACE_BCA_END_YEAR',
      location: 'TODO_REPLACE_BCA_LOCATION',
      description: 'TODO_REPLACE_BCA_DESCRIPTION',
      technologies: [],
    },
  ],
}
