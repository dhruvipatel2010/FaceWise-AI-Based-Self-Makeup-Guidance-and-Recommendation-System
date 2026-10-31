/**
 * Admin Login — dark plum left panel + sign-in form on the right.
 * Matches the approved admin login design.
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../services/AuthContext'
import { errorMessage } from '../../services/api'

const inp =
  'mt-1 block min-h-12 w-full rounded-xl border-2 border-plum/20 bg-white px-4 text-base focus:border-rose focus:outline-none'

export default function AdminLogin() {
  const { login, role } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail]     = useState('')
  const [password, setPass]   = useState('')
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      // login() stores role; check after state update via navigate
      navigate('/admin')
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='flex min-h-screen'>
      {/* Left: plum panel */}
      <div
        className='hidden flex-col justify-between p-12 md:flex md:w-5/12'
        style={{ background: '#2A1B3D', color: '#fff' }}
      >
        <span className='font-display text-2xl font-bold'>FaceWise</span>
        <div>
          <h1 className='font-display text-4xl font-bold leading-snug'>Admin panel</h1>
          <p className='mt-3 text-white/60'>
            Manage users, products, AI models, scans and reports in one place.
          </p>
        </div>
        <p className='text-xs text-white/40'>
          Authorized staff only. Actions are recorded in audit logs.
        </p>
      </div>

      {/* Right: form */}
      <div className='flex flex-1 items-center justify-center bg-page px-6 py-12'>
        <div className='w-full max-w-sm rounded-3xl border border-plum/10 bg-white p-8 shadow-sm'>
          <h2 className='font-display text-3xl font-bold text-plum'>Sign in</h2>
          <p className='mt-1 text-sm text-plum/60'>Use your admin account.</p>

          <form onSubmit={handleSubmit} className='mt-6 space-y-5'>
            <div>
              <label htmlFor='email' className='text-sm font-semibold text-plum'>Email</label>
              <input
                id='email' type='email' required placeholder='admin@example.com'
                value={email} onChange={e => setEmail(e.target.value)} className={inp}
              />
            </div>
            <div>
              <label htmlFor='password' className='text-sm font-semibold text-plum'>Password</label>
              <input
                id='password' type='password' required placeholder='Password'
                value={password} onChange={e => setPass(e.target.value)} className={inp}
              />
              <a href='#' className='mt-1 block text-right text-xs text-rose hover:underline'>
                Forgot password?
              </a>
            </div>
            {error && <p role='alert' className='text-sm font-semibold text-rose'>{error}</p>}
            <button
              type='submit' disabled={loading}
              className='min-h-12 w-full rounded-full bg-rose font-semibold text-white hover:opacity-90 disabled:opacity-60'
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

