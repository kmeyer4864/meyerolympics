import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env.local file.')
}

// Using any for flexibility - types are defined separately in database.types.ts
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    // Use localStorage for more reliable session persistence
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    // Use a no-op lock to prevent "Lock broken by another request" errors
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    lock: async <R>(_name: string, _acquireTimeout: number, fn: () => Promise<R>): Promise<R> => {
      // Skip locking entirely - just run the function
      return fn()
    },
  },
})
