import { useCallback, useEffect, useState } from 'react'
import { ApiError, api } from '@/lib/api'
import { PageHeader } from '@/components/Layout'
import { Badge, Banner, Button, Field, Input, Spinner } from '@/components/ui'

interface Preview {
  counts: Record<string, number>
  warnings: string[]
  blocking: string[]
  last_published_at: string | null
  last_checksum: string | null
}

interface Deploy {
  triggered: boolean
  status_code: number | null
  detail: string | null
}

interface Snapshot {
  id: string
  checksum: string
  status: string
  note: string | null
  created_at: string
  published_at: string | null
  deploy?: Deploy | null
}

export function Publish() {
  const [preview, setPreview] = useState<Preview | null>(null)
  const [snapshots, setSnapshots] = useState<Snapshot[]>([])
  const [hook, setHook] = useState<{ configured: boolean } | null>(null)
  const [note, setNote] = useState('')
  const [confirming, setConfirming] = useState(false)
  const [rollingBack, setRollingBack] = useState<Snapshot | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [blocking, setBlocking] = useState<string[]>([])
  const [success, setSuccess] = useState<Snapshot | null>(null)

  const load = useCallback(() => {
    Promise.all([
      api<Preview>('/admin/publish/preview'),
      api<Snapshot[]>('/admin/publish/snapshots'),
      api<{ configured: boolean }>('/admin/publish/deploy'),
    ])
      .then(([p, s, d]) => {
        setPreview(p)
        setSnapshots(s)
        setHook(d)
      })
      .catch((caught) => setError(String(caught)))
  }, [])

  useEffect(load, [load])

  /** Shared failure handling: a 422 carries the specific reasons. */
  const report = (caught: unknown) => {
    if (caught instanceof ApiError && caught.status === 422) {
      const detail = caught.detail as { blocking?: string[] } | undefined
      setBlocking(detail?.blocking ?? [])
      setError(caught.message)
    } else {
      setError(caught instanceof ApiError ? caught.message : String(caught))
    }
  }

  const publish = async () => {
    setBusy(true)
    setError(null)
    setBlocking([])
    setSuccess(null)
    try {
      const result = await api<Snapshot>('/admin/publish', {
        method: 'POST',
        body: { note: note || null },
      })
      setSuccess(result)
      setConfirming(false)
      setNote('')
      load()
    } catch (caught) {
      report(caught)
      // Deliberately NOT closing the dialog: the attempt failed, and saying
      // nothing while the button resets would read as success.
    } finally {
      setBusy(false)
    }
  }

  const rollback = async (snapshot: Snapshot) => {
    setBusy(true)
    setError(null)
    setBlocking([])
    setSuccess(null)
    try {
      const result = await api<Snapshot>(
        `/admin/publish/snapshots/${snapshot.id}/rollback`,
        { method: 'POST', body: { note: null } },
      )
      setSuccess(result)
      setRollingBack(null)
      load()
    } catch (caught) {
      report(caught)
    } finally {
      setBusy(false)
    }
  }

  if (!preview) return error ? <Banner tone="error">{error}</Banner> : <Spinner />

  const canPublish = preview.blocking.length === 0

  return (
    <>
      <PageHeader
        title="Publish"
        description="Builds a content snapshot and makes it the version the public site is built from."
      />

      {success && (
        <div className="mb-4 space-y-2">
          <Banner tone="success">
            Published successfully at{' '}
            {new Date(success.published_at ?? success.created_at).toLocaleString()} ·{' '}
            <span className="font-mono text-xs">
              {success.checksum.slice(0, 16)}…
            </span>
          </Banner>
          {/* The content is saved either way. This says whether the public
              site has actually been rebuilt from it, because "published" and
              "live" are not the same event. */}
          {success.deploy?.triggered ? (
            <Banner tone="success">
              Rebuild triggered. The public site updates when that build
              finishes — provided this snapshot has already been exported and
              committed.
            </Banner>
          ) : (
            <Banner tone="warning">
              Saved, but the site was not rebuilt.{' '}
              {success.deploy?.detail ?? 'No deploy hook responded.'}
            </Banner>
          )}
          {/* The snapshot lives in the database; the site is built from the
              committed export of it. Saying so here is the difference between
              an operator who knows why the site has not changed and one who
              presses Publish again. */}
          <Banner tone="info">
            This content reaches the public site when the snapshot is exported
            and committed: run <code>npm run content:pull</code>, then commit and
            push. See docs/DEPLOYMENT.md.
          </Banner>
        </div>
      )}

      {error && (
        <div className="mb-4 space-y-2">
          <Banner tone="error">{error}</Banner>
          {blocking.length > 0 && (
            <ul className="list-disc space-y-1 pl-5 text-sm text-danger">
              {blocking.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )}
          <Banner tone="info">
            The previously published version is still live and was not changed.
          </Banner>
        </div>
      )}

      <div className="grid gap-3 lg:grid-cols-2">
        <section className="card p-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
            What will be published
          </h2>
          <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
            {Object.entries(preview.counts).map(([key, value]) => (
              <div key={key} className="flex justify-between border-b border-border pb-1">
                <dt className="capitalize text-ink-2">{key.replace(/_/g, ' ')}</dt>
                <dd className="font-mono text-ink">{value}</dd>
              </div>
            ))}
          </dl>

          {preview.blocking.length > 0 && (
            <div className="mt-4 space-y-2">
              <Banner tone="error">Publishing is blocked:</Banner>
              <ul className="list-disc space-y-1 pl-5 text-sm text-danger">
                {preview.blocking.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {preview.warnings.length > 0 && (
            <div className="mt-4 space-y-2">
              <Banner tone="warning">
                {preview.warnings.length} warning
                {preview.warnings.length === 1 ? '' : 's'} — publishing is still allowed.
              </Banner>
              <ul className="list-disc space-y-1 pl-5 text-sm text-gold">
                {preview.warnings.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-4 space-y-3">
            {/* Set the expectation before the click, not after it: with no
                hook the content is saved but the site does not change. */}
            {hook && !hook.configured && (
              <Banner tone="info">
                No deploy hook is configured, so publishing saves the snapshot
                but does not rebuild the public site. Set DEPLOY_HOOK_URL to
                connect one.
              </Banner>
            )}

            <Field label="Note (optional)" hint="Shown in the snapshot history.">
              <Input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. added project descriptions"
              />
            </Field>

            {confirming ? (
              <div className="rounded-md border border-gold/40 bg-gold/5 p-3">
                <p className="text-sm text-ink">Publish changes?</p>
                <p className="mt-1 text-xs text-muted">
                  This replaces the version the public site is built from.
                </p>
                <div className="mt-3 flex gap-2">
                  <Button variant="primary" onClick={publish} disabled={busy}>
                    {busy ? 'Publishing…' : 'Yes, publish'}
                  </Button>
                  <Button onClick={() => setConfirming(false)} disabled={busy}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                variant="primary"
                onClick={() => setConfirming(true)}
                disabled={!canPublish}
              >
                Publish changes
              </Button>
            )}
          </div>
        </section>

        <section className="card p-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
            History
          </h2>
          <p className="mt-1 text-xs text-muted">
            Restoring re-publishes that snapshot's exact content as a new entry.
            Nothing here is ever rewritten or removed, so the record of what was
            live and when stays true.
          </p>
          <ul className="mt-3 divide-y divide-border text-sm">
            {snapshots.map((snapshot, index) => {
              // The newest published row is what the site is built from.
              const isLive =
                snapshot.status === 'published' &&
                index ===
                  snapshots.findIndex((row) => row.status === 'published')
              const restorable = snapshot.status === 'published' && !isLive

              return (
                <li key={snapshot.id} className="py-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <Badge tone={isLive ? 'live' : 'muted'}>
                          {isLive ? 'live' : snapshot.status}
                        </Badge>
                        <span className="truncate text-xs text-ink-2">
                          {snapshot.note ?? '—'}
                        </span>
                      </div>
                      <span className="font-mono text-[11px] text-muted">
                        {snapshot.checksum.slice(0, 16)}…
                      </span>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="text-xs text-muted">
                        {new Date(snapshot.created_at).toLocaleString()}
                      </span>
                      {restorable && (
                        <Button
                          onClick={() => setRollingBack(snapshot)}
                          disabled={busy}
                        >
                          Restore
                        </Button>
                      )}
                    </div>
                  </div>

                  {rollingBack?.id === snapshot.id && (
                    <div className="mt-2 rounded-md border border-gold/40 bg-gold/5 p-3">
                      <p className="text-sm text-ink">
                        Restore this version as the live content?
                      </p>
                      <p className="mt-1 text-xs text-muted">
                        It is re-published byte for byte — current unpublished
                        edits in the CMS are not included and are not lost.
                      </p>
                      <div className="mt-3 flex gap-2">
                        <Button
                          variant="primary"
                          onClick={() => rollback(snapshot)}
                          disabled={busy}
                        >
                          {busy ? 'Restoring…' : 'Yes, restore'}
                        </Button>
                        <Button
                          onClick={() => setRollingBack(null)}
                          disabled={busy}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        </section>
      </div>
    </>
  )
}
