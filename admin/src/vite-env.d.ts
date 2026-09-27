/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * Origin of the admin API, e.g. `https://api.example.org`. No trailing slash
   * needed — one is stripped either way.
   *
   * Leave it UNSET in development: requests then stay relative and Vite's dev
   * proxy forwards them to `localhost:8000`, which keeps everything same-origin.
   *
   * It must be set for production. The admin is served by Vercel and the API
   * runs on Render, so a relative `/api` path would resolve against Vercel and
   * every request would 404.
   *
   * This is configuration, not a secret — it is an origin the browser is about
   * to connect to anyway. No credential may ever be put in a `VITE_` variable,
   * because everything prefixed that way is compiled into the bundle.
   */
  readonly VITE_API_BASE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
