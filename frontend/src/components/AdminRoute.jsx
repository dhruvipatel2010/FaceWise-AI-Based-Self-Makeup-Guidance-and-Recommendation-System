/**
 * AdminRoute — guards any route that requires role === 'admin'.
 * Redirects to /admin/login if not authenticated or not an admin.
 */
import { Navigate } from 'react-router-dom'
import { useAuth } from '../services/AuthContext'

export default function AdminRoute({ children }) {
  const { token, role } = useAuth()
  if (!token) return <Navigate to='/admin/login' replace />
  if (role !== 'admin') return <Navigate to='/' replace />
  return children
}

