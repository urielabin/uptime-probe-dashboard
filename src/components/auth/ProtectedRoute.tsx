import { Navigate } from 'react-router-dom'
import { useSession } from '../../hooks/useSession.js'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useSession()

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-secondary">Loading…</div>
  }
  if (!session) {
    return <Navigate to="/login" replace />
  }
  return <>{children}</>
}
