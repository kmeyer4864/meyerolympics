import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAppStore } from '@/store/useAppStore'

// Pages
import Home from '@/pages/Home'
import Auth from '@/pages/Auth'
import AuthCallback from '@/pages/AuthCallback'
import CreatePage from '@/pages/CreatePage'
import JoinPage from '@/pages/JoinPage'
import OlympicsLobby from '@/pages/OlympicsLobby'
import EventIntro from '@/pages/EventIntro'
import EventPlay from '@/pages/EventPlay'
import EventResult from '@/pages/EventResult'
import OlympicsSummary from '@/pages/OlympicsSummary'

// Admin
import { AdminRoute } from '@/admin/AdminRoute'
import { AdminDashboard } from '@/admin/pages/AdminDashboard'
import { CreatePuzzle } from '@/admin/pages/CreatePuzzle'
import { EditPuzzle } from '@/admin/pages/EditPuzzle'

// Protected Route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, authLoading } = useAppStore()

  console.log('ProtectedRoute:', { authLoading, hasUser: !!user })

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold"></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/auth" replace />
  }

  return <>{children}</>
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/auth/callback" element={<AuthCallback />} />

        {/* Protected routes */}
        <Route
          path="/create"
          element={
            <ProtectedRoute>
              <CreatePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/join"
          element={
            <ProtectedRoute>
              <JoinPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/join/:inviteCode"
          element={
            <ProtectedRoute>
              <JoinPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/olympics/:id/lobby"
          element={
            <ProtectedRoute>
              <OlympicsLobby />
            </ProtectedRoute>
          }
        />
        <Route
          path="/olympics/:id/event/:idx/intro"
          element={
            <ProtectedRoute>
              <EventIntro />
            </ProtectedRoute>
          }
        />
        <Route
          path="/olympics/:id/event/:idx/play"
          element={
            <ProtectedRoute>
              <EventPlay />
            </ProtectedRoute>
          }
        />
        <Route
          path="/olympics/:id/event/:idx/result"
          element={
            <ProtectedRoute>
              <EventResult />
            </ProtectedRoute>
          }
        />
        <Route
          path="/olympics/:id/summary"
          element={
            <ProtectedRoute>
              <OlympicsSummary />
            </ProtectedRoute>
          }
        />

        {/* Admin routes */}
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/puzzle/new" element={<CreatePuzzle />} />
          <Route path="/admin/puzzle/:id" element={<EditPuzzle />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
