import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { ApiError, api } from '@/lib/api'

export interface AdminProfile {
  id: string
  email: string
  full_name: string
  role: string
  totp_enabled: boolean
  last_login_at: string | null
}

interface AuthState {
  admin: AdminProfile | null
  loading: boolean
  signIn: (
    email: string,
    password: string,
  ) => Promise<{ twoFactorRequired: boolean; pendingToken?: string }>
  completeTwoFactor: (pendingToken: string, code: string) => Promise<void>
  signOut: () => Promise<void>
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      setAdmin(await api<AdminProfile>('/auth/me'))
    } catch {
      // 401 here is the normal "not signed in" case, not an error to surface.
      setAdmin(null)
    } finally {
      setLoading(false)
    }
  }, [])

  // Session check on mount, using React's documented fetch-in-effect shape:
  // the work happens in an async continuation (so no synchronous setState in
  // the effect body) and `cancelled` stops a late response from writing state
  // after unmount.
  useEffect(() => {
    let cancelled = false

    const check = async () => {
      let profile: AdminProfile | null
      try {
        profile = await api<AdminProfile>('/auth/me')
      } catch {
        profile = null
      }
      if (cancelled) return
      setAdmin(profile)
      setLoading(false)
    }

    void check()
    return () => {
      cancelled = true
    }
  }, [])

  const signIn = useCallback<AuthState['signIn']>(async (email, password) => {
    const result = await api<{
      status: string
      pending_token?: string
      admin?: AdminProfile
    }>('/auth/login', { method: 'POST', body: { email, password } })

    if (result.status === 'two_factor_required') {
      // No session exists yet — the server issued only a pending token.
      return { twoFactorRequired: true, pendingToken: result.pending_token }
    }
    setAdmin(result.admin ?? null)
    return { twoFactorRequired: false }
  }, [])

  const completeTwoFactor = useCallback<AuthState['completeTwoFactor']>(
    async (pendingToken, code) => {
      const result = await api<{ admin?: AdminProfile }>('/auth/2fa', {
        method: 'POST',
        body: { pending_token: pendingToken, code },
      })
      setAdmin(result.admin ?? null)
    },
    [],
  )

  const signOut = useCallback(async () => {
    try {
      await api('/auth/logout', { method: 'POST' })
    } catch (error) {
      // An already-expired session still means "signed out" locally.
      if (!(error instanceof ApiError) || error.status !== 401) throw error
    }
    setAdmin(null)
  }, [])

  const value = useMemo(
    () => ({ admin, loading, signIn, completeTwoFactor, signOut, refresh }),
    [admin, loading, signIn, completeTwoFactor, signOut, refresh],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthState {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}
