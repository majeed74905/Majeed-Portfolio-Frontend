import { useRef, useState, type ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

interface Props {
  readonly children: ReactNode
  readonly className?: string
  /** Maximum rotation in degrees. Keep small — this is depth, not a gimmick. */
  readonly maxTilt?: number
  /**
   * Keep children in the same 3D space as this card, so anything given its own
   * `translateZ` parallaxes against the rest as the card rotates. This is what
   * turns a flat tilt into an actual diorama.
   */
  readonly preserve3d?: boolean
  /** Perspective distance. Shorter = stronger, more dramatic depth. */
  readonly perspective?: number
}

/**
 * Pointer-reactive depth.
 *
 * Real perspective transform rather than a WebGL card: it keeps the content in
 * the DOM (selectable, searchable, screen-reader addressable, keyboard
 * focusable) and costs one composited transform instead of a render loop.
 *
 * Disabled entirely under reduce-motion and on touch, where there is no hover
 * state to respond to and the tilt would only fight the scroll.
 */
export function TiltCard({
  children,
  className,
  maxTilt = 5,
  preserve3d = false,
  perspective = 1200,
}: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const reducedMotion = usePrefersReducedMotion()
  const [tilt, setTilt] = useState<{ x: number; y: number } | null>(null)

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (reducedMotion || event.pointerType !== 'mouse') return
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    // Normalise pointer position within the card to -0.5..0.5
    const px = (event.clientX - rect.left) / rect.width - 0.5
    const py = (event.clientY - rect.top) / rect.height - 0.5
    setTilt({ x: -py * maxTilt * 2, y: px * maxTilt * 2 })
  }

  const reset = () => setTilt(null)

  return (
    <div
      ref={ref}
      onPointerMove={onPointerMove}
      onPointerLeave={reset}
      className={className}
      style={{ perspective: `${perspective}px` }}
    >
      <div
        className={cn(
          'h-full transition-transform duration-normal ease-cinematic will-change-transform',
          preserve3d && '[transform-style:preserve-3d]',
        )}
        style={
          tilt
            ? {
                transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateZ(0)`,
              }
            : undefined
        }
      >
        {children}
      </div>
    </div>
  )
}
