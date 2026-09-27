/**
 * Minimal class-name joiner. Deliberately not `clsx` + `tailwind-merge` — two
 * dependencies for something this small is not worth the bundle.
 */
export function cn(
  ...parts: (string | false | null | undefined)[]
): string {
  return parts.filter(Boolean).join(' ')
}
