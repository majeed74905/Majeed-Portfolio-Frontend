import { useCallback, useEffect, useRef, useState } from 'react'
import { ApiError, api } from '@/lib/api'
import { PageHeader } from '@/components/Layout'
import { Badge, Banner, Button, EmptyState, Spinner } from '@/components/ui'

interface MediaRow {
  id: string
  kind: string
  storage_key: string
  original_filename: string
  content_type: string
  byte_size: number
  width: number | null
  height: number | null
  is_public: boolean
  created_at: string
  reference_count: number
}

function size(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

export function Media() {
  const [rows, setRows] = useState<MediaRow[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const fileInput = useRef<HTMLInputElement>(null)

  const load = useCallback(() => {
    api<MediaRow[]>('/admin/media')
      .then(setRows)
      .catch((caught) => setError(String(caught)))
  }, [])

  useEffect(load, [load])

  const upload = async (file: File) => {
    setBusy(true)
    setError(null)
    try {
      const form = new FormData()
      form.append('file', file)
      await api('/admin/media', { method: 'POST', formData: form })
      load()
    } catch (caught) {
      // The API rejects on sniffed content, not the extension, so the message
      // is worth showing verbatim.
      setError(caught instanceof ApiError ? caught.message : String(caught))
    } finally {
      setBusy(false)
      if (fileInput.current) fileInput.current.value = ''
    }
  }

  const remove = async (row: MediaRow) => {
    if (!confirm(`Delete ${row.original_filename}?`)) return
    try {
      await api(`/admin/media/${row.id}`, { method: 'DELETE' })
      load()
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : String(caught))
    }
  }

  if (!rows) return error ? <Banner tone="error">{error}</Banner> : <Spinner />

  return (
    <>
      <PageHeader
        title="Media"
        description="Images, video, audio and documents. Files in use cannot be deleted."
        actions={
          <>
            <input
              ref={fileInput}
              type="file"
              className="sr-only"
              id="media-upload"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) void upload(file)
              }}
            />
            <Button
              variant="primary"
              onClick={() => fileInput.current?.click()}
              disabled={busy}
            >
              {busy ? 'Uploading…' : 'Upload'}
            </Button>
          </>
        }
      />

      {error && (
        <div className="mb-4">
          <Banner tone="error">{error}</Banner>
        </div>
      )}

      <p className="mb-4 text-xs text-muted">
        Accepted: JPEG, PNG, WebP, GIF, AVIF, MP4, WebM, MP3, M4A, PDF. SVG is
        rejected on purpose — it can carry scripts.
      </p>

      {rows.length === 0 ? (
        <EmptyState>No files yet.</EmptyState>
      ) : (
        <ul className="card divide-y divide-border">
          {rows.map((row) => (
            <li key={row.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-ink">{row.original_filename}</p>
                <p className="truncate font-mono text-[11px] text-muted">
                  {row.id}
                </p>
              </div>

              <Badge>{row.kind}</Badge>
              {!row.is_public && <Badge tone="gold">private</Badge>}
              {row.reference_count > 0 && (
                <Badge tone="live">used {row.reference_count}×</Badge>
              )}

              <span className="text-xs text-muted">
                {size(row.byte_size)}
                {row.width ? ` · ${row.width}×${row.height}` : ''}
              </span>

              <Button
                onClick={() => {
                  void navigator.clipboard.writeText(row.id)
                  setCopied(row.id)
                  window.setTimeout(() => setCopied(null), 1500)
                }}
              >
                {copied === row.id ? 'Copied' : 'Copy id'}
              </Button>
              <Button
                variant="danger"
                onClick={() => void remove(row)}
                disabled={row.reference_count > 0}
              >
                Delete
              </Button>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}

interface MessageRow {
  id: string
  name: string
  email: string
  subject: string | null
  body: string
  is_read: boolean
  created_at: string
}

export function Messages() {
  const [rows, setRows] = useState<MessageRow[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [open, setOpen] = useState<string | null>(null)

  const load = useCallback(() => {
    api<MessageRow[]>('/admin/messages')
      .then(setRows)
      .catch((caught) => setError(String(caught)))
  }, [])

  useEffect(load, [load])

  const markRead = async (row: MessageRow) => {
    if (row.is_read) return
    await api(`/admin/messages/${row.id}`, {
      method: 'PUT',
      body: { is_read: true },
    })
    load()
  }

  if (!rows) return error ? <Banner tone="error">{error}</Banner> : <Spinner />

  const unread = rows.filter((row) => !row.is_read).length

  return (
    <>
      <PageHeader
        title="Messages"
        description={`${rows.length} total · ${unread} unread`}
      />
      {rows.length === 0 ? (
        <EmptyState>
          No messages. The public contact form has no backend yet, so nothing
          can arrive here until that is wired up.
        </EmptyState>
      ) : (
        <ul className="card divide-y divide-border">
          {rows.map((row) => (
            <li key={row.id} className="px-4 py-3">
              <button
                type="button"
                className="flex w-full items-center gap-3 text-left"
                onClick={() => {
                  setOpen(open === row.id ? null : row.id)
                  void markRead(row)
                }}
              >
                {!row.is_read && <Badge tone="gold">new</Badge>}
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm text-ink">
                    {row.subject ?? '(no subject)'}
                  </span>
                  <span className="block truncate text-xs text-muted">
                    {row.name} · {row.email}
                  </span>
                </span>
                <span className="shrink-0 text-xs text-muted">
                  {new Date(row.created_at).toLocaleDateString()}
                </span>
              </button>
              {open === row.id && (
                <p className="mt-3 whitespace-pre-wrap rounded-md bg-surface-2 p-3 text-sm text-ink-2">
                  {row.body}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
