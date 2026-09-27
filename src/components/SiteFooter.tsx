import { MusicPlayer } from '@/components/MusicPlayer'
import { SocialLinks } from '@/components/SocialLinks'
import { home, site } from '@/content'

export function SiteFooter() {
  return (
    /* Solid ground, continuing the surface the sections above end on —
       without it the footer would float back over the video. */
    <footer className="w-full bg-bg">
      <div className="mx-auto w-full max-w-[var(--width-content)] border-t border-border px-[var(--space-gutter)] py-[var(--space-lg)]">
        <div className="grid gap-[var(--space-lg)] md:grid-cols-[minmax(0,1fr)_320px] md:items-end">
          <div>
            <p className="font-display text-h3 text-ink">{site.name}</p>
            <SocialLinks
              label="Social profiles (footer)"
              className="mt-[var(--space-sm)]"
            />
          </div>

          {/* The ambient player lives here rather than on the hero: it is a
              nice-to-have, and the first screen should introduce a person, not
              hand them controls. */}
          <MusicPlayer track={home.music} />
        </div>

        <p className="mt-[var(--space-lg)] text-caption text-muted">
          {site.footerNote} © {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  )
}
