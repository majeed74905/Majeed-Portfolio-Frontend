import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '@/lib/api'
import { PageHeader } from '@/components/Layout'
import { Badge, Banner, EmptyState, Spinner } from '@/components/ui'

interface DashboardData {
  counts: Record<string, number>
  publish: {
    published: boolean
    checksum: string | null
    published_at: string | null
    snapshot_id: string | null
  }
  last_content_update: string | null
}

interface ActivityRow {
  id: string
  action: string
  actor: string | null
  target_type: string | null
  created_at: string
}

const CARDS: { key: string; label: string; to: string }[] = [
  { key: 'projects', label: 'Projects', to: '/projects' },
  { key: 'achievements', label: 'Achievements', to: '/achievements' },
  { key: 'skills', label: 'Skills', to: '/skills' },
  { key: 'media', label: 'Media', to: '/media' },
  { key: 'social_links', label: 'Social links', to: '/social' },
  { key: 'messages', label: 'Messages', to: '/messages' },
]

function when(value: string | null): string {
  if (!value) return 'never'
  return new Date(value).toLocaleString()
}

export function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [activity, setActivity] = useState<ActivityRow[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      api<DashboardData>('/admin/dashboard'),
      api<ActivityRow[]>('/admin/activity?limit=12'),
    ])
      .then(([dashboard, rows]) => {
        setData(dashboard)
        setActivity(rows)
      })
      .catch((caught) => setError(String(caught)))
  }, [])

  if (error) return <Banner tone="error">{error}</Banner>
  if (!data) return <Spinner />

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Every number here is a live count from the database."
      />

      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {CARDS.map((card) => (
          <li key={card.key}>
            <Link
              to={card.to}
              className="card block p-4 transition-colors hover:border-gold/40"
            >
              <span className="text-xs uppercase tracking-wide text-muted">
                {card.label}
              </span>
              <span className="mt-1 block text-2xl font-semibold text-ink">
                {data.counts[card.key] ?? 0}
              </span>
              {card.key === 'projects' && (
                <span className="mt-1 block text-xs text-muted">
                  {data.counts.projects_published ?? 0} published
                </span>
              )}
              {card.key === 'messages' && (
                <span className="mt-1 block text-xs text-muted">
                  {data.counts.messages_unread ?? 0} unread
                </span>
              )}
            </Link>
          </li>
        ))}
      </ul>

      <section className="mt-6 grid gap-3 lg:grid-cols-2">
        <div className="card p-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
            Publication
          </h2>
          <div className="mt-3 space-y-2 text-sm">
            <div className="flex items-center gap-2">
              {data.publish.published ? (
                <Badge tone="live">Published</Badge>
              ) : (
                <Badge tone="muted">Never published</Badge>
              )}
            </div>
            <p className="text-ink-2">
              Last published: <span className="text-ink">{when(data.publish.published_at)}</span>
            </p>
            <p className="text-ink-2">
              Last content change:{' '}
              <span className="text-ink">{when(data.last_content_update)}</span>
            </p>
            {data.publish.checksum && (
              <p className="font-mono text-xs text-muted">
                {data.publish.checksum.slice(0, 16)}…
              </p>
            )}
            <Link
              to="/publish"
              className="inline-block pt-1 text-sm text-gold underline-offset-4 hover:underline"
            >
              Go to publish →
            </Link>
          </div>
        </div>

        <div className="card p-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
            Recent activity
          </h2>
          {activity.length === 0 ? (
            <div className="mt-3">
              <EmptyState>Nothing recorded yet.</EmptyState>
            </div>
          ) : (
            <ul className="mt-3 divide-y divide-border text-sm">
              {activity.map((row) => (
                <li key={row.id} className="flex justify-between gap-3 py-1.5">
                  <span className="truncate font-mono text-xs text-ink-2">
                    {row.action}
                  </span>
                  <span className="shrink-0 text-xs text-muted">
                    {new Date(row.created_at).toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </>
  )
}
