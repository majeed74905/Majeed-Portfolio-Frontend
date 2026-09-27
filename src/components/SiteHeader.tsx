import { useEffect, useRef, useState } from 'react'
import { site } from '@/content'
import { useActiveSection } from '@/hooks/useActiveSection'
import { cn } from '@/lib/cn'
import type { SectionId } from '@/types/content'

const NAV_IDS = site.nav.map((item) => item.id)

export function SiteHeader() {
  const active = useActiveSection(NAV_IDS, 'home')
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    // Deferred rather than called inline, so the initial read happens after
    // paint instead of forcing a second render pass. This also lands after the
    // browser has restored scroll position on a reload.
    const frame = requestAnimationFrame(onScroll)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  // Close the mobile menu on Escape and return focus to the toggle, so keyboard
  // users are never stranded inside a dismissed panel.
  useEffect(() => {
    if (!menuOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false)
        toggleRef.current?.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [menuOpen])

  const go = (id: SectionId) => {
    setMenuOpen(false)
    document.getElementById(id)?.scrollIntoView({ block: 'start' })
    // Move focus with the scroll so screen-reader and keyboard users land in
    // the section rather than staying on the nav.
    const target = document.getElementById(id)
    if (target) {
      target.setAttribute('tabindex', '-1')
      target.focus({ preventScroll: true })
    }
  }

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-colors duration-normal ease-standard',
        scrolled && 'glass-panel rounded-none border-x-0 border-t-0',
      )}
    >
      <div className="mx-auto flex h-20 max-w-[var(--width-content)] items-center justify-between px-[var(--space-gutter)]">
        <a
          href="#home"
          onClick={(event) => {
            event.preventDefault()
            go('home')
          }}
          className="font-display text-h3 tracking-tight text-ink"
        >
          {site.monogram}
          <span className="sr-only"> — {site.name}, back to top</span>
        </a>

        {/* Desktop navigation */}
        <nav aria-label="Primary" className="hidden md:block">
          <ul className="flex items-center gap-[var(--space-md)]">
            {site.nav.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  aria-current={active === item.id ? 'true' : undefined}
                  onClick={(event) => {
                    event.preventDefault()
                    go(item.id)
                  }}
                  className={cn(
                    'relative py-2 text-caption uppercase transition-colors duration-fast ease-standard',
                    active === item.id
                      ? 'text-gold'
                      : 'text-ink-secondary hover:text-ink',
                  )}
                >
                  {item.label}
                  {active === item.id && (
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-0 -bottom-0.5 h-px bg-gold"
                    />
                  )}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Mobile toggle */}
        <button
          ref={toggleRef}
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          className="flex h-11 w-11 items-center justify-center rounded-md border border-border text-ink md:hidden"
        >
          <span className="sr-only">
            {menuOpen ? 'Close menu' : 'Open menu'}
          </span>
          <span aria-hidden="true" className="relative block h-4 w-5">
            <span
              className={cn(
                'absolute left-0 h-px w-full bg-current transition-all duration-fast ease-standard',
                menuOpen ? 'top-1/2 rotate-45' : 'top-0',
              )}
            />
            <span
              className={cn(
                'absolute left-0 top-1/2 h-px w-full bg-current transition-opacity duration-fast',
                menuOpen && 'opacity-0',
              )}
            />
            <span
              className={cn(
                'absolute left-0 h-px w-full bg-current transition-all duration-fast ease-standard',
                menuOpen ? 'top-1/2 -rotate-45' : 'bottom-0',
              )}
            />
          </span>
        </button>
      </div>

      {/* Mobile menu */}
      <div
        id="mobile-menu"
        ref={panelRef}
        hidden={!menuOpen}
        className="glass-panel mx-[var(--space-gutter)] mb-[var(--space-md)] rounded-lg md:hidden"
      >
        <nav aria-label="Primary (mobile)">
          <ul className="flex flex-col p-[var(--space-sm)]">
            {site.nav.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  aria-current={active === item.id ? 'true' : undefined}
                  onClick={(event) => {
                    event.preventDefault()
                    go(item.id)
                  }}
                  className={cn(
                    'block rounded-md px-[var(--space-md)] py-[var(--space-sm)] text-body',
                    active === item.id
                      ? 'text-gold'
                      : 'text-ink-secondary hover:text-ink',
                  )}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  )
}
