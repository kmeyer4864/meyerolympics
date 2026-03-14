import { useMemo } from 'react'
import { useAppStore } from '@/store/useAppStore'

/**
 * Hook to check if the current user is an admin.
 * Admin emails are configured via VITE_ADMIN_EMAILS environment variable.
 * Format: comma-separated list of emails (e.g., "admin@example.com,owner@example.com")
 */
export function useAdminAuth() {
  const user = useAppStore((state) => state.user)
  const authLoading = useAppStore((state) => state.authLoading)

  const isAdmin = useMemo(() => {
    if (!user?.email) return false

    const adminEmailsEnv = import.meta.env.VITE_ADMIN_EMAILS || ''
    const adminEmails = adminEmailsEnv
      .split(',')
      .map((email: string) => email.trim().toLowerCase())
      .filter(Boolean)

    return adminEmails.includes(user.email.toLowerCase())
  }, [user?.email])

  return {
    isAdmin,
    isLoading: authLoading,
    user,
  }
}
