import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

interface Props {
  readonly children: ReactNode
  /** Stagger index, for revealing a list one item after another. */
  readonly index?: number
  readonly className?: string
  /**
   * Element to render. Use `li` inside a list — a wrapper `div` between `ul`
   * and `li` is invalid HTML and breaks list semantics for screen readers.
   */
  readonly as?: 'div' | 'li'
}

/**
 * Reveal-on-scroll.
 *
 * Deliberately restrained: a short rise and fade, once, never replayed. The
 * point is to direct attention as a section arrives, not to make the page
 * perform.
 *
 * With reduce-motion set this renders a plain element with no motion wrapper
 * at all — not a zero-duration animation — so nothing can leave content stuck
 * mid-transition.
 */
export function Reveal({ children, index = 0, className, as = 'div' }: Props) {
  const reducedMotion = usePrefersReducedMotion()

  if (reducedMotion) {
    return as === 'li' ? (
      <li className={className}>{children}</li>
    ) : (
      <div className={className}>{children}</div>
    )
  }

  const Component = as === 'li' ? motion.li : motion.div

  return (
    <Component
      className={className}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{
        duration: 0.56,
        delay: Math.min(index * 0.06, 0.3),
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </Component>
  )
}
