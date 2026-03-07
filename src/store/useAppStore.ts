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
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) {
          return { error }
        }
        await get().fetchProfile()
        return { error: null }
      },

      // Sign up with email/password
      signUp: async (email, password, username) => {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username,
              full_name: username,
            },
          },
        })
        if (error) {
          return { error }
        }
        return { error: null }
      },

      // Sign in with Google OAuth
      signInWithGoogle: async () => {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/auth/callback`,
          },
        })
        return { error }
      },

      // Sign out
      signOut: async () => {
        await supabase.auth.signOut()
        set({
          user: null,
          session: null,
          profile: null,
          currentOlympics: null,
          currentOlympicsEvents: null,
        })
      },

      // Fetch current user's profile
      fetchProfile: async () => {
        const { user } = get()
        if (!user) return

        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (profile) {
          set({ profile })
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

// Initialize auth state listener
supabase.auth.onAuthStateChange(async (_event, session) => {
  const { setSession, setUser, setAuthLoading, fetchProfile } = useAppStore.getState()

  setSession(session)
  setUser(session?.user ?? null)

  if (session?.user) {
    await fetchProfile()
  }

  setAuthLoading(false)
})

// Check for existing session on load
console.log('Starting getSession check...')
const sessionStart = Date.now()
supabase.auth.getSession().then(({ data: { session } }) => {
  console.log('getSession result:', session ? 'has session' : 'no session', `(took ${Date.now() - sessionStart}ms)`)
  const { setSession, setUser, setAuthLoading, fetchProfile } = useAppStore.getState()

  setSession(session)
  setUser(session?.user ?? null)

  if (session?.user) {
    fetchProfile()
  }

  setAuthLoading(false)
}).catch((err) => {
  console.error('getSession error:', err, `(took ${Date.now() - sessionStart}ms)`)
  useAppStore.getState().setAuthLoading(false)
})

// Fallback timeout in case auth check hangs
setTimeout(() => {
  const { authLoading, setAuthLoading, setSession, setUser } = useAppStore.getState()
  if (authLoading) {
    console.warn('Auth loading timeout - clearing potentially corrupted session')

    // Clear any corrupted Supabase session from localStorage
    const keys = Object.keys(localStorage)
    keys.forEach(key => {
      if (key.startsWith('sb-') && key.endsWith('-auth-token')) {
        console.warn('Removing stuck auth token:', key)
        localStorage.removeItem(key)
      }
    })

    // Reset auth state
    setSession(null)
    setUser(null)
    setAuthLoading(false)
  }
}, 5000)
