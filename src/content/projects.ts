import type { Project, ProjectsContent } from '@/types/content'

/**
 * The four real projects.
 *
 * ────────────────────────────────────────────────────────────────────────────
 * VERIFICATION RULE
 *
 * Every technology and every highlight below was read out of the actual
 * repository — package.json / requirements.txt / composer config / source
 * files — not inferred from what a project of this kind "usually" uses.
 *
 * Two things were deliberately NOT claimed:
 *
 *   • Tailwind CSS on the PhD project. Its README says "React + Vite +
 *     TailwindCSS", but `tailwindcss` is not a dependency in any of the six
 *     package.json files and there is no tailwind config anywhere in the tree.
 *     Only `tailwind-merge` (a class-string utility) is installed. Bootstrap 5
 *     is what is actually there, so Bootstrap is what is listed.
 *
 *   • Accuracy figures for the diabetes model. `train_model.py` prints an
 *     accuracy score at training time but nothing in the repository records
 *     the value, so no number is published.
 *
 * If you add a project later, hold it to the same rule: if the repository does
 * not prove it, it does not go on the page.
 * ────────────────────────────────────────────────────────────────────────────
 */

/** FLAGSHIP — a production system in real use by a state university. */
const phdAdmission: Project = {
  slug: 'periyar-phd-admission-system',
  title: 'Periyar University PhD Admission Management System',
  shortTitle: 'PhD Admission Management System',
  category: 'Full-Stack Web Application',
  organization: 'Periyar University',
  status: 'live',
  order: 1,
  featured: true,

  summary:
    'A comprehensive web-based PhD Admission Management System developed to streamline and digitize the university’s research admission workflow. The platform provides structured student and administrative workflows for managing the PhD admission process through dedicated web interfaces.',

  description: [
    'The system is organised as a monorepo of four independent portals — student, admin, supervisor and research centre — each with its own React frontend and Express API, all sharing a single MySQL database. A separate NestJS service owns queued email delivery.',
  ],

  // Verified across student/, admin/, supervisor/, center/ and email-service/.
  technologies: [
    'React 19',
    'Vite',
    'React Router 7',
    'Bootstrap 5',
    'Node.js',
    'Express',
    'MySQL',
    'NestJS',
    'Prisma',
    'JWT',
    'Argon2',
    'Redis',
    'BullMQ',
    'Nodemailer',
    'Docker',
    'Nginx',
  ],

  highlights: [
    'Four separate portals — student, admin, supervisor and research centre — sharing one MySQL database',
    'JWT authentication with per-module secrets, Argon2 password hashing and Redis-backed rate limiting',
    'Versioned SQL migrations covering the admission workflow, eligibility rules and payment handling',
    'Queued transactional email through a dedicated NestJS + BullMQ service',
    'Document uploads, plus generated PDFs, Excel exports and QR codes',
    'Containerised with Docker Compose behind an Nginx reverse proxy',
  ],

  cover: {
    src: '/assets/projects/phd-1280.webp',
    srcSet:
      '/assets/projects/phd-640.webp 640w, /assets/projects/phd-1280.webp 1280w',
    sizes: '(max-width: 768px) 92vw, 60vw',
    alt: 'Screenshot of the Periyar University PhD Admission Portal home page, showing admission notifications, important dates and applicant login links.',
    width: 1280,
    height: 800,
  },
  gallery: [],

  liveUrl: 'http://research.periyaruniversity.ac.in/rnd-app/student-app/home',
  github: 'https://github.com/majeed74905/project-cdoe',

  architecture:
    'Monorepo with four independent portals, each a React + Vite frontend paired with its own Express API, sharing one MySQL schema. Shared database pooling, mail transport and JWT middleware live in a common module. A standalone NestJS service handles queued email via BullMQ and Redis. Nginx reverse-proxies the modules in production.',

  problem: null,
  features: [],
  challenges: [],
  solutions: [],
  results: [],
}

const zaraAi: Project = {
  slug: 'zara-ai-platform',
  title: 'Zara AI Platform',
  shortTitle: 'Zara AI',
  category: 'AI Platform / Full-Stack Web Application',
  status: 'live',
  order: 2,
  featured: true,

  summary:
    'An AI-powered web platform focused on providing an interactive assistant experience through a modern web interface and AI service integrations.',

  description: [],

  technologies: [
    'React 18',
    'TypeScript',
    'Vite',
    'Tailwind CSS',
    'React Router 6',
    'Framer Motion',
    'Google Gemini',
    'Groq',
    'Monaco Editor',
    'Sandpack',
    'Google OAuth',
    'IndexedDB',
    'Netlify',
  ],

  highlights: [
    'Integrates two model providers — Google Gemini (@google/genai) and Groq — behind a shared model manager',
    'In-browser code workspace built on Monaco Editor and CodeSandbox Sandpack',
    'Chat, voice, live-session and image modes alongside study tools such as exam prep and flashcards',
    'Diagram rendering through Graphviz (viz.js)',
    'Google OAuth sign-in with local persistence via IndexedDB for offline use',
  ],

  cover: {
    src: '/assets/projects/zara-1280.webp',
    srcSet:
      '/assets/projects/zara-640.webp 640w, /assets/projects/zara-1280.webp 1280w',
    sizes: '(max-width: 768px) 92vw, 45vw',
    alt: 'Screenshot of the Zara AI workspace, showing a sidebar of chat, live, image, tutor, exam and code modes beside a prompt entry area.',
    width: 1280,
    height: 800,
  },
  gallery: [],

  liveUrl: 'https://zara-ai-assists.netlify.app/',
  github: 'https://github.com/majeed74905/zara-ai-frontend',

  architecture: null,
  problem: null,
  features: [],
  challenges: [],
  solutions: [],
  results: [],
}

const diabetesPrediction: Project = {
  slug: 'diabetes-prediction',
  title: 'Diabetes Prediction',
  shortTitle: 'Diabetes Prediction',
  category: 'Machine Learning',
  status: 'live',
  order: 3,
  featured: true,

  summary:
    'A machine-learning based web application that predicts the likelihood of diabetes using user-provided input parameters. The project demonstrates the integration of a trained machine-learning workflow with a web-accessible prediction interface.',

  description: [],

  technologies: [
    'Python 3.11',
    'Flask',
    'scikit-learn',
    'Logistic Regression',
    'pandas',
    'NumPy',
    'joblib',
    'Gunicorn',
    'Render',
  ],

  highlights: [
    'Logistic Regression classifier trained with scikit-learn',
    'StandardScaler feature scaling, with model and scaler persisted via joblib',
    'Eight clinical inputs, including glucose, BMI, insulin and diabetes pedigree function',
    'Separate preprocessing, training and prediction modules, plus an EDA notebook',
    'Deployed on Render under Gunicorn with a health-check endpoint',
  ],

  cover: {
    src: '/assets/projects/diabetes-1280.webp',
    srcSet:
      '/assets/projects/diabetes-640.webp 640w, /assets/projects/diabetes-1280.webp 1280w',
    sizes: '(max-width: 768px) 92vw, 45vw',
    alt: 'Screenshot of the diabetes risk prediction web form, showing clinical input fields for glucose, blood pressure, insulin, BMI and age.',
    width: 1280,
    height: 800,
  },
  gallery: [],

  liveUrl: 'https://diabetic-prediction-y2qs.onrender.com/',
  github: 'https://github.com/majeed74905/diabetic-prediction',

  architecture: null,
  problem: null,
  features: [],
  challenges: [],
  solutions: [],
  results: [],
}

const libraryManagement: Project = {
  slug: 'online-library-management-system',
  title: 'Online Library Management System',
  shortTitle: 'Library Management System',
  category: 'Web Application',
  status: 'local',
  // No public deployment. Do not invent one, and do not link to localhost.
  deploymentNote: 'Local deployment',
  order: 4,
  featured: false,

  summary:
    'An online library management system developed to digitize core library operations, including the management of library records and common CRUD-based workflows through a web interface.',

  description: [],

  technologies: ['PHP', 'PDO', 'MySQL', 'Bootstrap', 'jQuery', 'DataTables'],

  highlights: [
    'Separate administrator and student areas with session-based login',
    'CRUD management for books, authors and categories',
    'Student registration, book issue and return tracking with borrowing history',
    'Database access through PDO prepared statements against MySQL',
  ],

  // No live deployment to screenshot, and the repository's bundled template
  // images are not this project's own work — so no cover image is claimed.
  gallery: [],

  liveUrl: null,
  github: 'https://github.com/majeed74905/online-library-management-system',

  architecture: null,
  problem: null,
  features: [],
  challenges: [],
  solutions: [],
  results: [],
}

export const projects: ProjectsContent = {
  eyebrow: 'Projects',
  heading: 'Selected work',
  introduction:
    'Four projects, listed with the technologies each repository actually contains.',
  items: [phdAdmission, zaraAi, diabetesPrediction, libraryManagement],
}

/** Projects in display order. */
export const orderedProjects = [...projects.items].sort(
  (a, b) => a.order - b.order,
)

/** The single flagship entry, given its own layout. */
export const flagshipProject = orderedProjects[0]

/** Everything after the flagship. */
export const secondaryProjects = orderedProjects.slice(1)
