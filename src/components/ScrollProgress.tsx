import { useEffect, useState } from 'react'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

/**
 * A one-pixel reading-progress rail across the top of the viewport.
 *
 * On a long single-page site the scrollbar is the only depth cue, and it is
 * easy to miss. This is the cheapest possible orientation aid: no layout cost,
 * no re-render storm (a CSS custom property is written directly rather than
 * pushing scroll position through React state), and it is decorative enough to
 * be aria-hidden.
 */
export function ScrollProgress() {
  const reducedMotion = usePrefersReducedMotion()
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const update = () => {
      const scrollable =
        document.documentElement.scrollHeight - window.innerHeight
      setProgress(scrollable > 0 ? window.scrollY / scrollable : 0)
    }
    const frame = requestAnimationFrame(update)
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-px bg-transparent"
    >
      <div
        className="h-full origin-left bg-gold/70"
        style={{
          transform: `scaleX(${progress})`,
          transition: reducedMotion
            ? undefined
            : 'transform 120ms linear',
        }}
      />
    </div>
  )
}
