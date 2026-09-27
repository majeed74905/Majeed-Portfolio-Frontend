/**
 * Copy the built admin app into the public site's output, at `dist/admin/`.
 *
 * Why a script rather than pointing Vite's outDir there: the admin is a
 * genuinely separate application with its own dependency tree, and that
 * isolation is what guarantees no admin code reaches the public bundle. Having
 * its build write straight into the other app's output directory would couple
 * the two builds and make a `--emptyOutDir` on either one destructive.
 *
 * Copying afterwards keeps them independent and makes the ordering explicit:
 * the public build runs first and owns `dist/`, then this drops the admin in
 * beside it so Vercel can serve both from one deployment.
 *
 * Run by `npm run build:all`. Fails loudly — a deployment that silently ships
 * without the admin would look fine until someone tried to sign in.
 */
import { cp, rm, stat, readdir } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

// frontend/scripts/collect-admin.mjs -> frontend/
const root = dirname(dirname(fileURLToPath(import.meta.url)))
const source = join(root, 'admin', 'dist')
const destination = join(root, 'dist', 'admin')

async function directoryExists(path) {
  try {
    return (await stat(path)).isDirectory()
  } catch {
    return false
  }
}

if (!(await directoryExists(source))) {
  console.error(
    `collect-admin: ${source} does not exist.\n` +
      'Build the admin first — `npm run build:admin`, or use `npm run build:all`.',
  )
  process.exit(1)
}

if (!(await directoryExists(join(root, 'dist')))) {
  console.error(
    'collect-admin: dist/ does not exist. Build the public site first.',
  )
  process.exit(1)
}

// Replaced, not merged: a stale hashed asset left behind from a previous build
// would be served forever by the immutable cache policy.
await rm(destination, { recursive: true, force: true })
await cp(source, destination, { recursive: true })

const entry = join(destination, 'index.html')
if (!(await directoryExists(destination)) || !(await fileExists(entry))) {
  console.error('collect-admin: copy finished but dist/admin/index.html is missing.')
  process.exit(1)
}

async function fileExists(path) {
  try {
    return (await stat(path)).isFile()
  } catch {
    return false
  }
}

const files = await readdir(destination, { recursive: true })
console.log(`collect-admin: ${files.length} entries -> dist/admin/`)
