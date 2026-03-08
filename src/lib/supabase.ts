import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env.local file.')
}

// Check for and clear any corrupted storage before initializing
const clearCorruptedStorage = () => {
  try {
    const keys = Object.keys(localStorage)
    for (const key of keys) {
      if (key.startsWith('sb-') && key.includes('-auth-token')) {
        const value = localStorage.getItem(key)
        if (value) {
          try {
            // Try to parse the stored value - if it fails, it's corrupted
            JSON.parse(value)
          } catch {
            console.warn('Removing corrupted auth token:', key)
            localStorage.removeItem(key)
          }
        }
      }
    }
  } catch (e) {
    console.warn('Error checking storage:', e)
  }
}

clearCorruptedStorage()

// Using any for flexibility - types are defined separately in database.types.ts
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})

// Expose a manual cleanup function for debugging
export const forceCleanAuth = async () => {
  console.log('Force cleaning auth state...')

  // Clear all Supabase storage
  const keys = Object.keys(localStorage)
  for (const key of keys) {
    if (key.startsWith('sb-')) {
      console.log('Removing:', key)
      localStorage.removeItem(key)
    }
  }

  // Sign out from Supabase (this may hang too, so wrap in timeout)
  try {
    await Promise.race([
      supabase.auth.signOut(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('signOut timeout')), 3000)),
    ])
  } catch (e) {
    console.warn('signOut failed/timed out:', e)
  }

  console.log('Auth state cleaned. Please refresh the page.')
}

// Utility to wrap any promise/thenable with a timeout
export async function withTimeout<T>(
  promiseOrThenable: Promise<T> | PromiseLike<T>,
  timeoutMs: number = 10000,
  operation: string = 'Operation'
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error(`${operation} timed out after ${timeoutMs / 1000}s`))
    }, timeoutMs)
  })

  // Wrap in Promise.resolve to handle thenables (like Supabase query builders)
  return Promise.race([Promise.resolve(promiseOrThenable), timeoutPromise])
}
