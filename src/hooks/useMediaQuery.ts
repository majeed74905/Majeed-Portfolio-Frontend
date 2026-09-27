import { useCallback, useSyncExternalStore } from 'react'

const noop = () => () => {}

/**
 * Subscribe to a media query.
 *
 * Uses `useSyncExternalStore` rather than useState+useEffect: matchMedia IS an
 * external store, so this reads the correct value on the very first render
 * instead of rendering a wrong default and then correcting it. No cascading
 * render, no first-paint flash.
 *
 * `defaultValue` is what non-browser environments see.
 */
export function useMediaQuery(query: string, defaultValue = false): boolean {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      if (typeof window === 'undefined' || !window.matchMedia) return noop()
      const list = window.matchMedia(query)
      list.addEventListener('change', onStoreChange)
      return () => list.removeEventListener('change', onStoreChange)
    },
    [query],
  )

  const getSnapshot = useCallback(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return defaultValue
    return window.matchMedia(query).matches
  }, [query, defaultValue])

  const getServerSnapshot = useCallback(() => defaultValue, [defaultValue])

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
