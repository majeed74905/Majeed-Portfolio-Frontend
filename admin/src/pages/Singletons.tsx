import { useCallback, useEffect, useState } from 'react'
import { ApiError, api, fieldErrors } from '@/lib/api'
import { PageHeader } from '@/components/Layout'
import { MediaField } from '@/components/MediaPicker'
import {
  Banner,
  Button,
  Field,
  Input,
  Spinner,
  Textarea,
  Toggle,
  listToText,
  textToList,
} from '@/components/ui'

type Row = Record<string, unknown>

/**
 * Editor for the one-row tables.
 *
 * Only fields that exist in the schema are exposed. No column was invented to
 * fill out a screen — an input that writes nowhere is worse than a short form.
 */
function useSingleton(path: string) {
  const [data, setData] = useState<Row | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saved, setSaved] = useState(false)
  const [busy, setBusy] = useState(false)

  const load = useCallback(() => {
    api<Row>(path)
      .then(setData)
      .catch((caught) => setError(String(caught)))
  }, [path])

  useEffect(load, [load])

  const save = async (body: Row) => {
    setBusy(true)
    setError(null)
    setErrors({})
    setSaved(false)
    try {
      const result = await api<Row>(path, {
        method: 'PUT',
        body: { ...body, expected_updated_at: data?.updated_at ?? null },
      })
      setData(result)
      setSaved(true)
    } catch (caught) {
      setErrors(fieldErrors(caught))
      setError(caught instanceof ApiError ? caught.message : String(caught))
    } finally {
      setBusy(false)
    }
  }

  return { data, setData, error, errors, saved, busy, save }
}

function SaveBar({
  busy,
  saved,
  error,
  updatedAt,
}: {
  busy: boolean
  saved: boolean
  error: string | null
  updatedAt: unknown
}) {
  return (
    <div className="flex flex-wrap items-center gap-3 pt-2">
      <Button type="submit" variant="primary" disabled={busy}>
        {busy ? 'Saving…' : 'Save'}
      </Button>
      {saved && <span className="text-sm text-forest-bright">Saved.</span>}
      {error && (
        <span role="alert" className="text-sm text-danger">
          {error}
        </span>
      )}
      {typeof updatedAt === 'string' && (
        <span className="text-xs text-muted">
          Last updated {new Date(updatedAt).toLocaleString()}
        </span>
      )}
    </div>
  )
}

export function HomeEditor() {
  const { data, setData, error, errors, saved, busy, save } =
    useSingleton('/admin/home')
  if (!data) return error ? <Banner tone="error">{error}</Banner> : <Spinner />

  const set = (key: string, value: unknown) => setData({ ...data, [key]: value })

  return (
    <>
      <PageHeader title="Home" description="The hero section." />
      <form
        className="card space-y-3 p-4"
        onSubmit={(e) => {
          e.preventDefault()
          void save({
            greeting: data.greeting,
            headline: data.headline,
            introduction: data.introduction,
            roles: data.roles,
            technology_highlights: data.technology_highlights,
            notes_label: data.notes_label,
            notes_lines: data.notes_lines,
            primary_cta_label: data.primary_cta_label,
            primary_cta_href: data.primary_cta_href,
            resume_media_id: data.resume_media_id,
            background_video_id: data.background_video_id,
            background_poster_id: data.background_poster_id,
          })
        }}
        noValidate
      >
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="Greeting" error={errors.greeting}>
            <Input
              value={String(data.greeting ?? '')}
              onChange={(e) => set('greeting', e.target.value || null)}
            />
          </Field>
          <Field label="Headline" error={errors.headline}>
            <Input
              value={String(data.headline ?? '')}
              onChange={(e) => set('headline', e.target.value || null)}
            />
          </Field>
        </div>

        <Field label="Introduction" error={errors.introduction}>
          <Textarea
            rows={3}
            value={String(data.introduction ?? '')}
            onChange={(e) => set('introduction', e.target.value || null)}
          />
        </Field>

        <div className="grid gap-3 md:grid-cols-2">
          <Field label="Roles" hint="One per line.">
            <Textarea
              rows={4}
              value={listToText(data.roles as string[])}
              onChange={(e) => set('roles', textToList(e.target.value))}
            />
          </Field>
          <Field label="Technology highlights" hint="One per line.">
            <Textarea
              rows={4}
              value={listToText(data.technology_highlights as string[])}
              onChange={(e) =>
                set('technology_highlights', textToList(e.target.value))
              }
            />
          </Field>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <Field label="CTA label">
            <Input
              value={String(data.primary_cta_label ?? '')}
              onChange={(e) => set('primary_cta_label', e.target.value || null)}
            />
          </Field>
          <Field label="CTA link" error={errors.primary_cta_href}>
            <Input
              value={String(data.primary_cta_href ?? '')}
              onChange={(e) => set('primary_cta_href', e.target.value || null)}
            />
          </Field>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <MediaField
            label="Résumé"
            kind="document"
            hint="The PDF behind the Résumé button. Hidden on the site until one is set."
            value={data.resume_media_id ? String(data.resume_media_id) : null}
            onChange={(id) => set('resume_media_id', id)}
          />
          <MediaField
            label="Background poster"
            kind="image"
            hint="First paint, and the whole background on mobile and reduce-motion."
            value={data.background_poster_id ? String(data.background_poster_id) : null}
            onChange={(id) => set('background_poster_id', id)}
          />
          <MediaField
            label="Background video"
            kind="video"
            hint="Desktop only. Replacing it means re-measuring the scrim — see docs/SPEC.md."
            value={data.background_video_id ? String(data.background_video_id) : null}
            onChange={(id) => set('background_video_id', id)}
          />
        </div>

        <SaveBar busy={busy} saved={saved} error={error} updatedAt={data.updated_at} />
      </form>
    </>
  )
}

export function AboutEditor() {
  const { data, setData, error, errors, saved, busy, save } =
    useSingleton('/admin/about')
  if (!data) return error ? <Banner tone="error">{error}</Banner> : <Spinner />

  const set = (key: string, value: unknown) => setData({ ...data, [key]: value })
  const facts = (data.facts as { label: string; value: string }[] | null) ?? []

  return (
    <>
      <PageHeader title="About" />
      <form
        className="card space-y-3 p-4"
        onSubmit={(e) => {
          e.preventDefault()
          void save({
            introduction: data.introduction,
            biography: data.biography,
            interests: data.interests,
            facts: data.facts,
            portrait_media_id: data.portrait_media_id,
          })
        }}
        noValidate
      >
        <Field label="Introduction" error={errors.introduction}>
          <Textarea
            rows={2}
            value={String(data.introduction ?? '')}
            onChange={(e) => set('introduction', e.target.value || null)}
          />
        </Field>

        <Field label="Biography" hint="One paragraph per line.">
          <Textarea
            rows={6}
            value={listToText(data.biography as string[])}
            onChange={(e) => set('biography', textToList(e.target.value))}
          />
        </Field>

        <div className="grid gap-3 md:grid-cols-2">
          <Field label="Interests" hint="One per line.">
            <Textarea
              rows={4}
              value={listToText(data.interests as string[])}
              onChange={(e) => set('interests', textToList(e.target.value))}
            />
          </Field>
          <Field
            label="Facts"
            hint="One per line as label | value. Only checkable facts — never an invented metric."
          >
            <Textarea
              rows={4}
              value={facts.map((f) => `${f.label} | ${f.value}`).join('\n')}
              onChange={(e) =>
                set(
                  'facts',
                  textToList(e.target.value).map((line) => {
                    const [label, value] = line.split('|')
                    return {
                      label: (label ?? '').trim(),
                      value: (value ?? '').trim(),
                    }
                  }),
                )
              }
            />
          </Field>
        </div>

        <MediaField
          label="Portrait"
          kind="image"
          value={data.portrait_media_id ? String(data.portrait_media_id) : null}
          onChange={(id) => set('portrait_media_id', id)}
        />

        <SaveBar busy={busy} saved={saved} error={error} updatedAt={data.updated_at} />
      </form>
    </>
  )
}

export function SettingsEditor() {
  const { data, setData, error, errors, saved, busy, save } =
    useSingleton('/admin/site')
  if (!data) return error ? <Banner tone="error">{error}</Banner> : <Spinner />

  const set = (key: string, value: unknown) => setData({ ...data, [key]: value })

  return (
    <>
      <PageHeader
        title="Settings"
        description="Site identity, SEO and contact details."
      />
      <form
        className="card space-y-3 p-4"
        onSubmit={(e) => {
          e.preventDefault()
          void save({
            name: data.name,
            short_name: data.short_name,
            monogram: data.monogram,
            url: data.url,
            locale: data.locale,
            seo_title: data.seo_title,
            seo_description: data.seo_description,
            og_image_id: data.og_image_id,
            favicon_id: data.favicon_id,
            contact_email: data.contact_email,
            contact_phone: data.contact_phone,
            contact_location: data.contact_location,
            footer_note: data.footer_note,
            maintenance_mode: data.maintenance_mode,
          })
        }}
        noValidate
      >
        <div className="grid gap-3 md:grid-cols-3">
          <Field label="Site name" error={errors.name}>
            <Input
              value={String(data.name ?? '')}
              onChange={(e) => set('name', e.target.value)}
              required
            />
          </Field>
          <Field label="Short name">
            <Input
              value={String(data.short_name ?? '')}
              onChange={(e) => set('short_name', e.target.value || null)}
            />
          </Field>
          <Field label="Monogram">
            <Input
              value={String(data.monogram ?? '')}
              onChange={(e) => set('monogram', e.target.value || null)}
            />
          </Field>
        </div>

        <Field
          label="Site URL"
          hint="Needed for canonical links, the sitemap and social cards."
          error={errors.url}
        >
          <Input
            value={String(data.url ?? '')}
            onChange={(e) => set('url', e.target.value || null)}
            placeholder="https://example.com"
          />
        </Field>

        <div className="grid gap-3 md:grid-cols-2">
          <Field label="SEO title">
            <Input
              value={String(data.seo_title ?? '')}
              onChange={(e) => set('seo_title', e.target.value || null)}
            />
          </Field>
          <MediaField
            label="Social card image"
            kind="image"
            hint="Shown when the site is shared on social media."
            value={data.og_image_id ? String(data.og_image_id) : null}
            onChange={(id) => set('og_image_id', id)}
          />
        </div>

        <Field label="SEO description">
          <Textarea
            rows={2}
            value={String(data.seo_description ?? '')}
            onChange={(e) => set('seo_description', e.target.value || null)}
          />
        </Field>

        <div className="grid gap-3 md:grid-cols-3">
          <Field label="Contact email">
            <Input
              value={String(data.contact_email ?? '')}
              onChange={(e) => set('contact_email', e.target.value || null)}
            />
          </Field>
          <Field label="Contact phone">
            <Input
              value={String(data.contact_phone ?? '')}
              onChange={(e) => set('contact_phone', e.target.value || null)}
            />
          </Field>
          <Field
            label="Location"
            hint="City level only — never a street address."
          >
            <Input
              value={String(data.contact_location ?? '')}
              onChange={(e) => set('contact_location', e.target.value || null)}
            />
          </Field>
        </div>

        <Field label="Footer note">
          <Input
            value={String(data.footer_note ?? '')}
            onChange={(e) => set('footer_note', e.target.value || null)}
          />
        </Field>

        <Toggle
          label="Maintenance mode"
          checked={Boolean(data.maintenance_mode)}
          onChange={(value) => set('maintenance_mode', value)}
        />

        <SaveBar busy={busy} saved={saved} error={error} updatedAt={data.updated_at} />
      </form>
    </>
  )
}
