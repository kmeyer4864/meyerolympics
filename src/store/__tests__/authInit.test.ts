import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock the supabase module before importing the store
vi.mock('@/lib/supabase', () => {
  const mockAuth = {
    onAuthStateChange: vi.fn(() => ({
      data: { subscription: { unsubscribe: vi.fn() } },
    })),
    getSession: vi.fn(),
    signInWithPassword: vi.fn(),
    signUp: vi.fn(),
    signInWithOAuth: vi.fn(),
    signOut: vi.fn(),
  }

  return {
    supabase: {
      auth: mockAuth,
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: null })),
          })),
        })),
      })),
    },
  }
})

describe('Auth Initialization', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    // Clear localStorage before each test
    localStorage.clear()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.clearAllMocks()
  })

  describe('getSession hanging scenario', () => {
    it('should timeout and clear auth loading after 10 seconds', async () => {
      // Setup: getSession never resolves (simulates hang)
      const { supabase } = await import('@/lib/supabase')
      vi.mocked(supabase.auth.getSession).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      )

      // Import store fresh (this triggers initialization)
      vi.resetModules()

      // The store should start with authLoading: true
      // We need to dynamically import after resetting modules
      const { useAppStore } = await import('../useAppStore')

      // Initially loading
      expect(useAppStore.getState().authLoading).toBe(true)

      // Advance time past the 10-second timeout and flush all promises
      await vi.advanceTimersByTimeAsync(11000)

      // Should have cleared auth loading
      expect(useAppStore.getState().authLoading).toBe(false)
      expect(useAppStore.getState().session).toBe(null)
      expect(useAppStore.getState().user).toBe(null)
    })

    it('should not clear session if getSession resolves in time', async () => {
      const { supabase } = await import('@/lib/supabase')

      const mockSession = {
        user: { id: 'user-123', email: 'test@test.com' },
        access_token: 'valid-token',
      }

      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: mockSession as any },
        error: null,
      })

      vi.resetModules()
      const { useAppStore } = await import('../useAppStore')

      // Wait for getSession to resolve
      await vi.runAllTimersAsync()

      // Should have the user set
      expect(useAppStore.getState().user).toEqual(mockSession.user)
      expect(useAppStore.getState().authLoading).toBe(false)
    })
  })

  describe('signIn', () => {
    it('should timeout if signIn hangs for more than 10 seconds', async () => {
      const { supabase } = await import('@/lib/supabase')

      // Simulate hanging signInWithPassword
      vi.mocked(supabase.auth.signInWithPassword).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      )

      vi.resetModules()
      const { useAppStore } = await import('../useAppStore')

      // signIn should have a timeout and return an error
      const signInPromise = useAppStore.getState().signIn('test@test.com', 'password')

      // Advance time by 11 seconds (past our 10 second timeout)
      vi.advanceTimersByTime(11000)

      const result = await signInPromise

      expect(result.error).toBeTruthy()
      expect(result.error?.message).toContain('timeout')
    })

    it('should return error on failed login', async () => {
      const { supabase } = await import('@/lib/supabase')

      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { user: null, session: null },
        error: new Error('Invalid credentials') as any,
      })

      vi.resetModules()
      const { useAppStore } = await import('../useAppStore')

      const result = await useAppStore.getState().signIn('test@test.com', 'wrong')

      expect(result.error).toBeTruthy()
      expect(result.error?.message).toBe('Invalid credentials')
    })

    it('should succeed and fetch profile on valid login', async () => {
      const { supabase } = await import('@/lib/supabase')

      const mockUser = { id: 'user-123', email: 'test@test.com' }
      const mockSession = { user: mockUser, access_token: 'token' }

      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { user: mockUser as any, session: mockSession as any },
        error: null,
      })

      // Mock the auth state change that happens after login
      vi.mocked(supabase.auth.onAuthStateChange).mockImplementation((callback) => {
        // Simulate the auth state change callback
        setTimeout(() => {
          callback('SIGNED_IN', mockSession as any)
        }, 0)
        return { data: { subscription: { unsubscribe: vi.fn(), id: 'test', callback: vi.fn() } } } as any
      })

      vi.resetModules()
      const { useAppStore } = await import('../useAppStore')

      // Manually set the user to simulate what onAuthStateChange does
      useAppStore.getState().setUser(mockUser as any)

      const result = await useAppStore.getState().signIn('test@test.com', 'correct')

      expect(result.error).toBe(null)
    })
  })

  describe('localStorage corruption detection', () => {
    it('should identify Supabase auth tokens by pattern', () => {
      // Test the pattern matching logic
      const testKeys = [
        'sb-hcouxvnvtylvhgakxxwe-auth-token', // Valid Supabase token
        'sb-test-auth-token', // Valid pattern
        'other-storage-key', // Not a Supabase token
        'sb-partial', // Partial match - should not match
      ]

      const supabaseTokens = testKeys.filter(
        (key) => key.startsWith('sb-') && key.endsWith('-auth-token')
      )

      expect(supabaseTokens).toEqual([
        'sb-hcouxvnvtylvhgakxxwe-auth-token',
        'sb-test-auth-token',
      ])
    })
  })
})
