import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

/**
 * The "there is more below" cue at the bottom of the hero.
 *
 * A real anchor rather than a decorative arrow: it is keyboard reachable and
 * actually navigates, so it is useful and not just ornamental. The gentle
 * bob is CSS-only and stops entirely under reduce-motion, where the cue still
 * reads perfectly as a static mark.
 */
export function ScrollCue({ targetId }: { readonly targetId: string }) {
  const reducedMotion = usePrefersReducedMotion()

  return (
    <a
      href={`#${targetId}`}
      className="absolute inset-x-0 bottom-2 mx-auto flex w-fit flex-col items-center gap-2 text-muted transition-colors duration-fast ease-standard hover:text-gold"
    >
      <span className="font-mono text-caption uppercase">Scroll</span>
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        style={
          reducedMotion
            ? undefined
            : { animation: 'scroll-cue 2.4s var(--ease-standard) infinite' }
        }
      >
        <path d="M12 4v14M6 13l6 6 6-6" strokeLinecap="round" />
      </svg>
    </a>
  )
}
