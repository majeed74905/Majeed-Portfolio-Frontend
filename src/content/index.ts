/**
 * Content barrel.
 *
 * Components import from here, never from a section file directly. That was
 * always the point of this file, and this is the change it was waiting for:
 * it now serves the CMS-backed layer in `published.ts`, which overlays an
 * exported snapshot onto the source modules in this directory.
 *
 * No component changed to make that happen, and none can tell the difference.
 */
export {
  site,
  home,
  about,
  skills,
  projects,
  career,
  achievements,
  contacts,
} from './published'

/** Build provenance, for the footer and for debugging a deployed build. */
export { isPublished, snapshot } from './snapshot'
