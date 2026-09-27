/**
 * Device / connection capability probes.
 *
 * These answer one question: how much of the expensive layer (video, WebGL)
 * are we allowed to spend on this visitor? Everything here is browser-only and
 * must be called from an effect, never during render.
 */

/** True if the browser can actually create a WebGL2 context right now. */
export function detectWebGL(): boolean {
  if (typeof document === 'undefined') return false
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl2')
    if (!gl) return false
    // Release it immediately — contexts are a limited resource.
    gl.getExtension('WEBGL_lose_context')?.loseContext()
    return true
  } catch {
    return false
  }
}

interface NetworkInformation {
  saveData?: boolean
  effectiveType?: string
}

/** True when the visitor has asked for reduced data usage or is on a slow link. */
export function detectSaveData(): boolean {
  if (typeof navigator === 'undefined') return false
  const connection = (
    navigator as Navigator & { connection?: NetworkInformation }
  ).connection
  if (!connection) return false
  if (connection.saveData) return true
  const slow = ['slow-2g', '2g', '3g']
  return connection.effectiveType ? slow.includes(connection.effectiveType) : false
}

/** Rough proxy for "this device will struggle with a WebGL scene". */
export function detectLowPowerDevice(): boolean {
  if (typeof navigator === 'undefined') return false
  const cores = navigator.hardwareConcurrency ?? 8
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory
  if (cores <= 4) return true
  if (typeof memory === 'number' && memory <= 4) return true
  return false
}
