import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'

const CALLBACK_TIMEOUT_MS = 10000

export default function AuthCallback() {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Race between getSession and timeout
        const result = await Promise.race([
          supabase.auth.getSession(),
          new Promise<null>((resolve) =>
            setTimeout(() => resolve(null), CALLBACK_TIMEOUT_MS)
          ),
        ])

        if (result === null) {
          // Timeout
          setError('Authentication timed out. Please try again.')
          setTimeout(() => navigate('/auth', { replace: true }), 2000)
          return
        }

        const { data, error: authError } = result

        if (authError) {
          console.error('Auth callback error:', authError)
          setError(authError.message)
          setTimeout(() => navigate('/auth', { replace: true }), 2000)
          return
        }

        if (data.session) {
          navigate('/', { replace: true })
        } else {
          navigate('/auth', { replace: true })
        }
      } catch (err) {
        console.error('Callback handling failed:', err)
        setError('Authentication failed. Please try again.')
        setTimeout(() => navigate('/auth', { replace: true }), 2000)
      }
    }

    handleCallback()
  }, [navigate])

  return (
    <div className="min-h-screen flex items-center justify-center">
      {error ? (
        <div className="text-center">
          <p className="text-red-400 mb-2">{error}</p>
          <p className="text-gray-500 text-sm">Redirecting...</p>
        </div>
      ) : (
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold"></div>
      )}
    </div>
  )
}
