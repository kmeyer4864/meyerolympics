import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, Session } from '@supabase/supabase-js'
import type { Profile, Olympics, OlympicsEvent } from '@/lib/database.types'
import { supabase } from '@/lib/supabase'

interface AppState {
  // Auth state
  user: User | null
  session: Session | null
  profile: Profile | null
  authLoading: boolean

  // Current Olympics state
  currentOlympics: Olympics | null
  currentOlympicsEvents: OlympicsEvent[] | null

  // Auth actions
  setUser: (user: User | null) => void
  setSession: (session: Session | null) => void
  setProfile: (profile: Profile | null) => void
  setAuthLoading: (loading: boolean) => void

  // Olympics actions
  setCurrentOlympics: (olympics: Olympics | null) => void
  setCurrentOlympicsEvents: (events: OlympicsEvent[] | null) => void
  clearOlympics: () => void

  // Auth operations
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signUp: (email: string, password: string, username: string) => Promise<{ error: Error | null }>
  signInWithGoogle: () => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  fetchProfile: () => Promise<void>
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      session: null,
      profile: null,
      authLoading: true,
      currentOlympics: null,
      currentOlympicsEvents: null,

      // Auth setters
      setUser: (user) => set({ user }),
      setSession: (session) => set({ session }),
      setProfile: (profile) => set({ profile }),
      setAuthLoading: (loading) => set({ authLoading: loading }),

      // Olympics setters
      setCurrentOlympics: (olympics) => set({ currentOlympics: olympics }),
      setCurrentOlympicsEvents: (events) => set({ currentOlympicsEvents: events }),
      clearOlympics: () => set({ currentOlympics: null, currentOlympicsEvents: null }),

      // Sign in with email/password
      signIn: async (email, password) => {
        const AUTH_TIMEOUT_MS = 10000

        const signInPromise = supabase.auth.signInWithPassword({
          email,
          password,
        })

        const timeoutPromise = new Promise<{ error: Error }>((resolve) => {
          setTimeout(() => {
            resolve({ error: new Error('Sign in timeout - please try again') })
          }, AUTH_TIMEOUT_MS)
        })

        const result = await Promise.race([signInPromise, timeoutPromise])

        if ('data' in result) {
          // Normal Supabase response
          if (result.error) {
            return { error: result.error }
          }
          await get().fetchProfile()
          return { error: null }
        } else {
          // Timeout response
          return { error: result.error }
        }
      },

      // Sign up with email/password
      signUp: async (email, password, username) => {
        const AUTH_TIMEOUT_MS = 10000

        const signUpPromise = supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username,
              full_name: username,
            },
          },
        })

        const timeoutPromise = new Promise<{ error: Error }>((resolve) => {
          setTimeout(() => {
            resolve({ error: new Error('Sign up timeout - please try again') })
          }, AUTH_TIMEOUT_MS)
        })

        const result = await Promise.race([signUpPromise, timeoutPromise])

        if ('data' in result) {
          if (result.error) {
            return { error: result.error }
          }
          return { error: null }
        } else {
          return { error: result.error }
        }
      },

      // Sign in with Google OAuth (with timeout)
      signInWithGoogle: async () => {
        const AUTH_TIMEOUT_MS = 10000

        try {
          const oauthPromise = supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
              redirectTo: `${window.location.origin}/auth/callback`,
            },
          })

          const timeoutPromise = new Promise<{ error: Error }>((resolve) => {
            setTimeout(() => {
              resolve({ error: new Error('OAuth timeout - please try again') })
            }, AUTH_TIMEOUT_MS)
          })

          const result = await Promise.race([oauthPromise, timeoutPromise])

          if ('data' in result) {
            return { error: result.error }
          }
          return { error: result.error }
        } catch (err) {
          return { error: err instanceof Error ? err : new Error(String(err)) }
        }
      },

      // Sign out - clear state FIRST, then try Supabase (don't wait forever)
      signOut: async () => {
        // 1. Immediately clear Zustand state (optimistic)
        set({
          user: null,
          session: null,
          profile: null,
          currentOlympics: null,
          currentOlympicsEvents: null,
        })

        // 2. Clear all Supabase localStorage keys
        try {
          const keys = Object.keys(localStorage)
          keys.forEach(key => {
            if (key.startsWith('sb-')) {
              localStorage.removeItem(key)
            }
          })
        } catch (e) {
          console.warn('Failed to clear localStorage:', e)
        }

        // 3. Try Supabase signOut with timeout (don't block if it hangs)
        try {
          await Promise.race([
            supabase.auth.signOut(),
            new Promise(resolve => setTimeout(resolve, 5000))
          ])
        } catch (e) {
          console.warn('signOut request failed (state already cleared):', e)
        }
      },

      // Fetch current user's profile with error handling
      fetchProfile: async () => {
        const { user } = get()
        if (!user) return

        try {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()

          if (error) {
            console.warn('Failed to fetch profile:', error.message)
            return
          }

          if (profile) {
            set({ profile })
          }
        } catch (err) {
          console.warn('Profile fetch error:', err)
        }
      },
    }),
    {
      name: 'olympics-app-storage',
      partialize: (state) => ({
        // Only persist these fields
        currentOlympics: state.currentOlympics,
      }),
    }
  )
)

// =============================================================================
// AUTH INITIALIZATION
// =============================================================================
// IMPORTANT: We use a single initialization path to prevent race conditions.
// - getSession() loads the initial session
// - onAuthStateChange() only handles SUBSEQUENT changes (login/logout events)
// - A timeout protects against hung requests
// =============================================================================

let authInitialized = false
let authSubscription: { data: { subscription: { unsubscribe: () => void } } } | null = null

// Helper to set auth state
const setAuthState = (session: Session | null) => {
  const { setSession, setUser, setAuthLoading, fetchProfile } = useAppStore.getState()

  setSession(session)
  setUser(session?.user ?? null)

  if (session?.user) {
    // Don't await - let it complete in background
    fetchProfile().catch(err => console.warn('Profile fetch failed:', err))
  }

  setAuthLoading(false)
}

// 1. INITIAL SESSION CHECK (with timeout)
const initAuth = async () => {
  const AUTH_INIT_TIMEOUT_MS = 10000

  try {
    const sessionPromise = supabase.auth.getSession()
    const timeoutPromise = new Promise<null>((resolve) => {
      setTimeout(() => resolve(null), AUTH_INIT_TIMEOUT_MS)
    })

    const result = await Promise.race([sessionPromise, timeoutPromise])

    if (result === null) {
      // Timeout occurred
      console.warn('Auth initialization timed out after 10s')
      setAuthState(null)
    } else {
      // Got a response
      setAuthState(result.data.session)
    }
  } catch (err) {
    console.error('Auth initialization error:', err)
    setAuthState(null)
  }

  authInitialized = true
}

// 2. AUTH STATE CHANGE LISTENER (for subsequent changes only)
authSubscription = supabase.auth.onAuthStateChange(async (event, session) => {
  // Skip if this is the initial load (handled by getSession above)
  if (!authInitialized) return

  // Only respond to actual auth events, not initial state
  if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
    setAuthState(session)
  }
})

// Start initialization
initAuth()

// Cleanup function (call this when app unmounts if needed)
export const cleanupAuthListener = () => {
  if (authSubscription?.data.subscription) {
    authSubscription.data.subscription.unsubscribe()
  }
}
