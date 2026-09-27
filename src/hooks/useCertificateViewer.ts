import { useCallback, useState } from 'react'
import type { Achievement } from '@/types/content'

/**
 * Tracks which certificate, if any, is open in the viewer dialog.
 *
 * Lives apart from the dialog component so that file exports only a component
 * — which is what keeps Fast Refresh working during development.
 */
export function useCertificateViewer() {
  const [open, setOpen] = useState<Achievement | null>(null)
  const close = useCallback(() => setOpen(null), [])
  return { open, show: setOpen, close }
}
