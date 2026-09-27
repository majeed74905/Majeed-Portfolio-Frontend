import { useMediaQuery } from './useMediaQuery'

/**
 * True when the visitor has asked their OS to reduce motion.
 *
 * `index.css` already neutralises CSS transitions globally, but components that
 * own real animation (video, WebGL, Framer Motion, autoplaying anything) must
 * check this so they can render a deliberate STATIC state rather than a frozen
 * half-finished one.
 */
export function usePrefersReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)')
}
