import { useEffect, useState } from 'react'
import type { SectionId } from '@/types/content'

/**
 * Tracks which section is currently in view, for nav highlighting.
 *
 * Uses a reference line rather than IntersectionObserver ratios, and that is a
 * deliberate correction rather than a preference.
 *
 * `intersectionRatio` is measured against the ELEMENT's own size, so a section
 * taller than the observer band can never reach even a 0.1 threshold — once
 * Projects grew past roughly three screens, the observer stopped reporting it
 * entirely and the nav stayed stuck on Skills. Ranking differently-sized
 * sections by ratio is unsound for the same reason: a short section always
 * scores higher than a tall one showing far more pixels.
 *
 * A single line at 35% of the viewport is size-independent and matches what a
 * reader means by "the section I am in": the last section whose top has passed
 * it. Reads are throttled to one per animation frame.
 */
export function useActiveSection(
  ids: readonly SectionId[],
  fallback: SectionId,
): SectionId {
  const [active, setActive] = useState<SectionId>(fallback)

  useEffect(() => {
    if (typeof window === 'undefined') return

    let frame = 0

    const update = () => {
      frame = 0
      const line = window.innerHeight * 0.35
      let current: SectionId = ids[0] ?? fallback

      for (const id of ids) {
        const el = document.getElementById(id)
        if (!el) continue
        if (el.getBoundingClientRect().top <= line) current = id
      }

      // The final section is often shorter than the remaining scroll, so its
      // top may never cross the line. At the bottom of the page it wins.
      const atBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 2
      if (atBottom) current = ids[ids.length - 1] ?? current

      setActive(current)
    }

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }

    frame = requestAnimationFrame(update)
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)

    return () => {
      if (frame) cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [ids, fallback])

  return active
}
