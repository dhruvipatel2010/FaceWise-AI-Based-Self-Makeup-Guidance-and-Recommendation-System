import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../services/AuthContext'
import { errorMessage } from '../services/api'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  function fillDemoUser() {
    setEmail('d@gmail.com')
    setPassword('dhruvi1234')
  }

  return (
    <div className='min-h-[calc(100vh-80px)] w-full flex flex-col md:flex-row overflow-hidden bg-page'>
      {/* ── Left Editorial Showcase (Full Screen Luxury Visuals) ───── */}
      <div className='relative hidden md:flex md:w-1/2 lg:w-7/12 flex-col justify-between p-10 lg:p-16 overflow-hidden bg-gradient-to-br from-[#2A1B3D] via-[#3D1E4A] to-[#1C1028] text-white'>
        {/* Soft background glow orbs */}
        <div className='pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-rose/25 blur-3xl'></div>
        <div className='pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-lilac/20 blur-3xl'></div>

        {/* Top Header */}
        <div className='relative z-10 flex items-center gap-3'>
          <div className='flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-rose to-plum text-white font-bold text-xl shadow-lg border border-white/20'>
            F
          </div>
          <div>
            <span className='font-display text-2xl font-bold tracking-tight'>FaceWise</span>
            <span className='block text-[10px] font-bold tracking-widest uppercase text-rose/90'>
              AI Beauty Studio & Diagnostic Suite
            </span>
          </div>
        </div>

        {/* Center Editorial Hero Content */}
        <div className='relative z-10 my-auto py-8 max-w-xl'>
          <span className='inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold tracking-wider text-rose border border-white/10 backdrop-blur-md mb-6'>
            ✨ Private In-Browser Facial Intelligence
          </span>

          <h2 className='font-display text-4xl lg:text-5xl font-bold leading-tight tracking-tight text-white'>
            Reveal your most harmonious look with real-time AI.
          </h2>

          <p className='mt-4 text-base text-white/75 leading-relaxed'>
            Experience live camera lipstick shade matching, skin diagnostic moisture metrics, and haircut silhouettes tailored specifically to your facial bone architecture.
          </p>

          {/* Luxury Feature Cards */}
          <div className='mt-8 grid grid-cols-3 gap-3.5'>
            <div className='rounded-2xl border border-white/15 bg-white/5 p-4 backdrop-blur-md transition-all hover:bg-white/10'>
              <span className='text-2xl'>💄</span>
              <h4 className='mt-2 font-display text-sm font-bold text-white'>Makeup Studio</h4>
              <p className='mt-1 text-[11px] text-white/60'>Real-time shade match</p>
            </div>

            <div className='rounded-2xl border border-white/15 bg-white/5 p-4 backdrop-blur-md transition-all hover:bg-white/10'>
              <span className='text-2xl'>🧴</span>
              <h4 className='mt-2 font-display text-sm font-bold text-white'>Skin Diagnostic</h4>
              <p className='mt-1 text-[11px] text-white/60'>T-zone & tone balance</p>
            </div>

            <div className='rounded-2xl border border-white/15 bg-white/5 p-4 backdrop-blur-md transition-all hover:bg-white/10'>
              <span className='text-2xl'>💇‍♀️</span>
              <h4 className='mt-2 font-display text-sm font-bold text-white'>Hair Consultation</h4>
              <p className='mt-1 text-[11px] text-white/60'>Face shape haircuts</p>
            </div>
          </div>
        </div>

        {/* Bottom Safety & Privacy Note */}
        <div className='relative z-10 flex items-center justify-between border-t border-white/10 pt-4 text-xs text-white/50'>
          <span>100% Client-Side Vision · Zero Camera Uploads</span>
          <span>FastAPI · MongoDB Atlas</span>
        </div>
      </div>

      {/* ── Right Column: Sign In Form (Sleek Glassmorphic Portal) ── */}
      <div className='flex flex-1 items-center justify-center p-6 md:p-12 lg:p-16'>
        <div className='w-full max-w-md rounded-[32px] border border-plum/10 bg-white p-8 sm:p-10 shadow-xl'>
          <div className='flex items-center justify-between'>
            <span className='text-xs font-bold uppercase tracking-wider text-rose'>Welcome Back</span>
            <button
              type='button'
              onClick={fillDemoUser}
              className='rounded-full bg-lilac/60 px-3 py-1 text-[11px] font-bold text-plum hover:bg-lilac transition'
              title='Auto-fill test credentials'
            >
              ⚡ Quick Fill
            </button>
          </div>

          <h1 className='mt-2 font-display text-3xl font-bold tracking-tight text-plum'>Sign in</h1>
          <p className='mt-1 text-xs text-plum/60 leading-relaxed'>
            Enter your credentials to unlock live AI camera try-ons and personal beauty prescriptions.
          </p>

          <form onSubmit={handleSubmit} className='mt-6 space-y-4'>
            <div>
              <label htmlFor='email' className='text-xs font-bold text-plum/80 block'>
                Email Address
              </label>
              <input
                id='email'
                type='email'
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder='name@example.com'
                className='mt-1.5 block min-h-12 w-full rounded-2xl border-2 border-plum/15 bg-page/50 px-4 text-sm text-plum focus:border-rose focus:bg-white focus:outline-none transition shadow-2xs'
              />
            </div>

            <div>
              <div className='flex items-center justify-between'>
                <label htmlFor='password' className='text-xs font-bold text-plum/80 block'>
                  Password
                </label>
                <span className='text-[11px] text-plum/50'>Case-sensitive</span>
              </div>
              <input
                id='password'
                type='password'
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder='••••••••••••'
                className='mt-1.5 block min-h-12 w-full rounded-2xl border-2 border-plum/15 bg-page/50 px-4 text-sm text-plum focus:border-rose focus:bg-white focus:outline-none transition shadow-2xs'
              />
            </div>

            {error && (
              <div role='alert' className='rounded-xl border border-rose/30 bg-rose/10 p-3 text-xs font-semibold text-rose'>
                {error}
              </div>
            )}

            <button
              type='submit'
              disabled={loading}
              className='mt-2 min-h-12 w-full rounded-full bg-gradient-to-r from-rose to-rose/90 font-bold text-white shadow-md hover:opacity-95 hover:shadow-lg disabled:opacity-60 transition-all duration-200 text-sm'
            >
              {loading ? 'Authenticating...' : 'Sign in to FaceWise →'}
            </button>
          </form>

          {/* Footer Navigation */}
          <div className='mt-6 flex flex-col items-center gap-3 border-t border-plum/10 pt-5 text-xs text-plum/70'>
            <p>
              Don't have an account yet?{' '}
              <Link to='/register' className='font-bold text-rose hover:underline'>
                Create an account
              </Link>
            </p>
            <Link to='/admin/login' className='text-[11px] text-plum/50 hover:text-plum transition'>
              Are you staff? Open Admin Portal ⚡
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
