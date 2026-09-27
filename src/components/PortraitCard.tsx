import { TiltCard } from '@/components/TiltCard'
import type { ImageAsset } from '@/types/content'

interface Props {
  readonly image: ImageAsset
  readonly src: string
  readonly caption?: string
}

/**
 * The portrait, presented as a shallow 3D diorama rather than a flat photo.
 *
 * Four layers sit at different depths inside one shared 3D space, so tilting
 * the card makes them parallax against each other the way real stacked objects
 * would — the glow sits behind the photo, the frame floats in front of it, and
 * the name plate stands furthest forward.
 *
 *   -60px  warm glow      (the light behind the subject)
 *     0px  photograph
 *   +28px  frame edge
 *   +52px  name plate
 *
 * Done with CSS transforms, not WebGL: the photo stays a real <img>, so it is
 * responsive, lazy-loaded, right-clickable and readable by assistive tech —
 * none of which survives being drawn into a canvas.
 *
 * Under reduce-motion TiltCard stops responding and this renders as a still
 * composition, which it is designed to be regardless.
 */
export function PortraitCard({ image, src, caption }: Props) {
  return (
    // Depths kept shallow on purpose: past roughly 30px the frame separates far
    // enough from the photo that it stops reading as depth and starts reading
    // as a misaligned border.
    <TiltCard preserve3d perspective={1000} maxTilt={5} className="w-full">
      <div className="relative mx-auto mb-6 w-full max-w-[300px] [transform-style:preserve-3d]">
        {/* Warm glow, furthest back. Deliberately restrained: the card now sits
            over the lit side of the cabin footage, and a strong glow competed
            with the lamp and firelight already in the frame instead of joining
            them. Just enough to lift the card off the scene. */}
        <div
          aria-hidden="true"
          className="absolute -inset-5 rounded-lg opacity-40 blur-2xl"
          style={{
            transform: 'translateZ(-45px)',
            background:
              'radial-gradient(60% 55% at 30% 25%, var(--color-gold) 0%, transparent 72%), radial-gradient(55% 50% at 75% 80%, var(--color-forest) 0%, transparent 74%)',
          }}
        />

        {/* Contact shadow. Grounds the card on the surface behind it so it
            reads as an object in the room, not a sticker on the glass. */}
        <div
          aria-hidden="true"
          className="absolute inset-x-4 -bottom-2 h-8 rounded-pill bg-bg-deep/70 blur-xl"
          style={{ transform: 'translateZ(-30px)' }}
        />

        {/* The photograph. */}
        <img
          src={src}
          srcSet={image.srcSet}
          sizes={image.sizes}
          alt={image.alt}
          width={image.width}
          height={image.height}
          loading="lazy"
          decoding="async"
          className="relative block w-full rounded-lg border border-border object-cover shadow-elevated"
        />

        {/* Frame edge, floating just in front of the photo. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-lg ring-1 ring-inset ring-gold/25"
          style={{ transform: 'translateZ(14px)' }}
        />

        {/* Name plate, furthest forward — the layer that sells the depth. */}
        {caption && (
          <div
            className="glass-panel absolute -bottom-3 left-3 px-[var(--space-md)] py-[var(--space-xs)]"
            style={{ transform: 'translateZ(30px)' }}
          >
            <p className="font-mono text-caption uppercase text-gold">
              {caption}
            </p>
          </div>
        )}
      </div>
    </TiltCard>
  )
}
