import type { SkillsContent } from '@/types/content'

/**
 * Only technologies Mohammed has actually confirmed working with.
 * No proficiency percentages — those are unverifiable and read as filler.
 * Add a `note` when there is a specific, true detail worth showing.
 */
export const skills: SkillsContent = {
  eyebrow: 'Skills',
  heading: 'What I work with',
  introduction:
    'Grouped by where they sit in a system rather than ranked by a number.',

  categories: [
    {
      id: 'programming',
      label: 'Languages',
      summary: 'The languages I write day to day.',
      skills: [
        { name: 'Python' },
        { name: 'JavaScript' },
        { name: 'TypeScript' },
      ],
    },
    {
      id: 'frontend',
      label: 'Frontend',
      summary: 'Interfaces, build tooling and styling.',
      skills: [
        { name: 'React' },
        { name: 'Vite' },
        { name: 'Tailwind CSS' },
      ],
    },
    {
      id: 'backend',
      label: 'Backend',
      summary: 'APIs and server-side services.',
      skills: [
        { name: 'FastAPI' },
        { name: 'Node.js' },
        { name: 'Express' },
      ],
    },
    {
      id: 'database',
      label: 'Data',
      summary: 'Storage, schema design and access layers.',
      skills: [
        { name: 'PostgreSQL' },
        { name: 'MySQL' },
        { name: 'Prisma' },
      ],
    },
    {
      id: 'ai-ml',
      label: 'AI / ML',
      summary: 'Model providers and tooling I have built against.',
      skills: [
        { name: 'OpenAI' },
        { name: 'Google Gemini' },
        { name: 'Anthropic Claude' },
        { name: 'Groq' },
        { name: 'DeepSeek' },
        { name: 'Hugging Face' },
      ],
    },
    {
      id: 'tools-cloud',
      label: 'Cloud & Tools',
      summary: 'Where the work gets deployed and run.',
      skills: [
        { name: 'AWS' },
        { name: 'Netlify' },
        { name: 'Railway' },
        { name: 'Render' },
      ],
    },
  ],
}
