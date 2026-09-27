/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * Absolute URL of the public contact endpoint, e.g.
   * `https://api.example.com/api/public/contact`.
   *
   * Deliberately optional. When it is unset the contact form says plainly
   * that sending is not connected rather than pretending to deliver, so a
   * build with no API configured is still honest.
   *
   * This is the ONLY runtime call the public site makes. Content itself is
   * baked in at build time from a publish snapshot; the site never queries
   * the database.
   */
  readonly VITE_CONTACT_ENDPOINT?: string

  /**
   * The site's own public origin, e.g. `https://example.org`.
   *
   * Feeds the canonical link, `og:url`, the absolute `og:image`, `robots.txt`
   * and `sitemap.xml` — all generated at build time in `vite.config.ts` — and
   * `site.url` in the content layer.
   *
   * Optional, and unset is a supported state: the metadata that needs it is
   * omitted rather than emitted pointing at the wrong domain.
   */
  readonly VITE_SITE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
