import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api, { errorMessage } from '../services/api'

export default function Register() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.post('/auth/register', { name, email, password })
      navigate('/login')
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='min-h-[calc(100vh-80px)] w-full flex flex-col md:flex-row overflow-hidden bg-page'>
      {/* ── Left Editorial Showcase (Full Screen Luxury Visuals) ───── */}
      <div className='relative hidden md:flex md:w-1/2 lg:w-7/12 flex-col justify-between p-10 lg:p-16 overflow-hidden bg-gradient-to-br from-[#2A1B3D] via-[#3D1E4A] to-[#1C1028] text-white'>
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
            Start your personalized beauty journey.
          </h2>

          <p className='mt-4 text-base text-white/75 leading-relaxed'>
            Create your account to unlock private facial shape profiling, custom shade palettes, and AI-curated product recommendations backed by real dermatology research.
          </p>

          {/* Testimonial / Trust Points */}
          <div className='mt-8 space-y-3 text-sm text-white/80'>
            <div className='flex items-center gap-3'>
              <span className='flex h-6 w-6 items-center justify-center rounded-full bg-rose/30 text-rose font-bold text-xs'>✓</span>
              <span>Instant camera try-on for lips, blush, and haircuts</span>
            </div>
            <div className='flex items-center gap-3'>
              <span className='flex h-6 w-6 items-center justify-center rounded-full bg-rose/30 text-rose font-bold text-xs'>✓</span>
              <span>100% Client-Side Vision: Video frames never leave your device</span>
            </div>
            <div className='flex items-center gap-3'>
              <span className='flex h-6 w-6 items-center justify-center rounded-full bg-rose/30 text-rose font-bold text-xs'>✓</span>
              <span>Save diagnostic scan history to track your skin progress</span>
            </div>
          </div>
        </div>

        {/* Bottom Safety & Privacy Note */}
        <div className='relative z-10 flex items-center justify-between border-t border-white/10 pt-4 text-xs text-white/50'>
          <span>Protected with On-Device AI Vision</span>
          <span>FastAPI · MongoDB Atlas</span>
        </div>
      </div>

      {/* ── Right Column: Sign Up Form ─────────────────────────────── */}
      <div className='flex flex-1 items-center justify-center p-6 md:p-12 lg:p-16'>
        <div className='w-full max-w-md rounded-[32px] border border-plum/10 bg-white p-8 sm:p-10 shadow-xl'>
          <span className='text-xs font-bold uppercase tracking-wider text-rose'>Get Started</span>
          <h1 className='mt-2 font-display text-3xl font-bold tracking-tight text-plum'>Create account</h1>
          <p className='mt-1 text-xs text-plum/60 leading-relaxed'>
            Sign up in seconds to access your private studio.
          </p>

          <form onSubmit={handleSubmit} className='mt-6 space-y-4'>
            <div>
              <label htmlFor='name' className='text-xs font-bold text-plum/80 block'>
                Full Name
              </label>
              <input
                id='name'
                required
                minLength={2}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder='e.g. Dhruvi Patel'
                className='mt-1.5 block min-h-12 w-full rounded-2xl border-2 border-plum/15 bg-page/50 px-4 text-sm text-plum focus:border-rose focus:bg-white focus:outline-none transition shadow-2xs'
              />
            </div>

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
                <span className='text-[11px] text-plum/50'>Min. 8 characters</span>
              </div>
              <input
                id='password'
                type='password'
                required
                minLength={8}
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
              {loading ? 'Creating Account...' : 'Create Account →'}
            </button>
          </form>

          {/* Footer Navigation */}
          <div className='mt-6 border-t border-plum/10 pt-5 text-center text-xs text-plum/70'>
            Already have an account?{' '}
            <Link to='/login' className='font-bold text-rose hover:underline'>
              Log in
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
