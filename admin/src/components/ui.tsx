import type { ReactNode } from 'react'

export function cn(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(' ')
}

export function Button({
  children,
  variant = 'secondary',
  type = 'button',
  disabled,
  onClick,
  className,
}: {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  type?: 'button' | 'submit'
  disabled?: boolean
  onClick?: () => void
  className?: string
}) {
  const styles = {
    primary: 'bg-gold text-bg hover:bg-gold-soft',
    secondary: 'border border-border-strong text-ink hover:border-gold hover:text-gold',
    danger: 'border border-danger/50 text-danger hover:bg-danger/10',
    ghost: 'text-ink-2 hover:text-ink',
  }[variant]

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'rounded-sm px-3 py-1.5 text-sm font-medium transition-colors',
        'disabled:cursor-not-allowed disabled:opacity-50',
        styles,
        className,
      )}
    >
      {children}
    </button>
  )
}

export function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string
  hint?: string
  error?: string
  children: ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted">
        {label}
      </span>
      {children}
      {hint && !error && (
        <span className="mt-1 block text-xs text-muted">{hint}</span>
      )}
      {error && (
        <span role="alert" className="mt-1 block text-xs text-danger">
          {error}
        </span>
      )}
    </label>
  )
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn('input-base', props.className)} />
}

export function Textarea(
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement>,
) {
  return (
    <textarea {...props} className={cn('input-base resize-y', props.className)} />
  )
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={cn('input-base', props.className)} />
}

export function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm text-ink-2">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 accent-gold"
      />
      {label}
    </label>
  )
}

/**
 * Status banner.
 *
 * `role="alert"` on errors so a screen reader is told immediately — a failure
 * that only appears visually is invisible to anyone not looking at that part
 * of the page.
 */
export function Banner({
  tone,
  children,
}: {
  tone: 'error' | 'success' | 'warning' | 'info'
  children: ReactNode
}) {
  const styles = {
    error: 'border-danger/40 bg-danger/10 text-danger',
    success: 'border-forest-bright/40 bg-forest-bright/10 text-forest-bright',
    warning: 'border-gold/40 bg-gold/10 text-gold',
    info: 'border-border bg-surface-2 text-ink-2',
  }[tone]

  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={cn('rounded-md border px-3 py-2 text-sm', styles)}
    >
      {children}
    </div>
  )
}

export function Badge({
  children,
  tone = 'neutral',
}: {
  children: ReactNode
  tone?: 'neutral' | 'live' | 'gold' | 'muted'
}) {
  const styles = {
    neutral: 'border-border text-ink-2',
    live: 'border-forest-bright/40 text-forest-bright',
    gold: 'border-gold/40 text-gold',
    muted: 'border-border text-muted',
  }[tone]
  return (
    <span
      className={cn(
        'rounded-pill border px-2 py-0.5 font-mono text-[11px] uppercase',
        styles,
      )}
    >
      {children}
    </span>
  )
}

export function Spinner({ label = 'Loading' }: { label?: string }) {
  return (
    <p role="status" className="py-8 text-sm text-muted">
      {label}…
    </p>
  )
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-md border border-dashed border-border px-4 py-8 text-center text-sm text-muted">
      {children}
    </p>
  )
}

/** Comma/newline separated text <-> string[], for the simple list fields. */
export function listToText(value: string[] | null | undefined): string {
  return (value ?? []).join('\n')
}

export function textToList(value: string): string[] {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
}
