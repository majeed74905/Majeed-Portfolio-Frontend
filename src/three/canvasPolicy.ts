import { useSyncExternalStore } from 'react'
import {
  detectLowPowerDevice,
  detectSaveData,
  detectWebGL,
} from '@/lib/capabilities'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { useMediaQuery } from '@/hooks/useMediaQuery'

/**
 * How rich the visual layer is allowed to be for this visitor.
 *
 *   'full'    — background video plays, WebGL accents mount.
 *   'reduced' — video plays, no WebGL (weak GPU, coarse pointer).
 *   'still'   — poster image only, no video, no WebGL.
 *
 * Every expensive component asks this ONE hook rather than each re-deriving
 * "is it mobile" from its own media query. The site must be complete and
 * usable at 'still'; richer tiers only add atmosphere.
 */
export type VisualTier = 'full' | 'reduced' | 'still'

export interface CanvasPolicy {
  readonly tier: VisualTier
  readonly playVideo: boolean
  readonly mountWebGL: boolean
}

interface Probes {
  readonly webgl: boolean
  readonly saveData: boolean
  readonly lowPower: boolean
}

const SERVER_PROBES: Probes = {
  webgl: false,
  saveData: false,
  lowPower: false,
}

/**
 * Device probes are one-shot and expensive-ish (creating a WebGL context), so
 * they run once per page load and are cached. Caching also keeps the snapshot
 * referentially stable, which `useSyncExternalStore` requires, and stops
 * StrictMode's double render from probing twice.
 */
let cached: Probes | null = null

function getProbes(): Probes {
  if (cached) return cached
  if (typeof window === 'undefined') return SERVER_PROBES
  cached = {
    webgl: detectWebGL(),
    saveData: detectSaveData(),
    lowPower: detectLowPowerDevice(),
  }
  return cached
}

const getServerProbes = () => SERVER_PROBES

// The probe result never changes during a page load, so there is nothing to
// subscribe to.
const subscribeNever = () => () => {}

export function useCanvasPolicy(): CanvasPolicy {
  const reducedMotion = usePrefersReducedMotion()
  const isSmallScreen = useMediaQuery('(max-width: 767px)')
  const isCoarsePointer = useMediaQuery('(pointer: coarse)')
  const probes = useSyncExternalStore(
    subscribeNever,
    getProbes,
    getServerProbes,
  )

  // Explicit user and system signals win over everything else.
  if (reducedMotion || probes.saveData) {
    return { tier: 'still', playVideo: false, mountWebGL: false }
  }

  // Phones: an 848px-wide clip stretched over a tall viewport reads worse than
  // the poster, and skipping it saves the download entirely.
  if (isSmallScreen) {
    return { tier: 'still', playVideo: false, mountWebGL: false }
  }

  if (!probes.webgl || probes.lowPower || isCoarsePointer) {
    return { tier: 'reduced', playVideo: true, mountWebGL: false }
  }

  return { tier: 'full', playVideo: true, mountWebGL: true }
}
