import { Navigate, Outlet } from 'react-router-dom'
import { useAdminAuth } from './hooks/useAdminAuth'

/**
 * Route wrapper that restricts access to admin users only.
 * Non-admin users are redirected to the home page.
 * Unauthenticated users are redirected to the auth page.
 */
export function AdminRoute() {
  const { isAdmin, isLoading, user } = useAdminAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a1628] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FFD700]" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/auth" replace />
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
