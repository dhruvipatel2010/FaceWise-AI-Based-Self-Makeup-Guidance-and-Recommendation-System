import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api, { errorMessage } from '../services/api'

const input = 'mt-1 block min-h-12 w-full rounded-xl border-2 border-plum/20 bg-white px-4 text-base focus:border-rose focus:outline-none'

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
    <main className='mx-auto max-w-md px-6 py-12'>
      <div className='rounded-3xl border border-plum/10 bg-white p-8'>
        <h1 className='font-display text-3xl'>Create account</h1>
        <form onSubmit={handleSubmit} className='mt-6 space-y-5'>
          <div>
            <label htmlFor='name' className='text-sm font-semibold'>Name</label>
            <input id='name' required minLength={2} value={name} onChange={(e) => setName(e.target.value)} className={input} />
          </div>
          <div>
            <label htmlFor='email' className='text-sm font-semibold'>Email</label>
            <input id='email' type='email' required value={email} onChange={(e) => setEmail(e.target.value)} className={input} />
          </div>
          <div>
            <label htmlFor='password' className='text-sm font-semibold'>Password (8 or more characters)</label>
            <input id='password' type='password' required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className={input} />
          </div>
          {error && <p role='alert' className='text-sm font-semibold text-rose'>{error}</p>}
          <button type='submit' disabled={loading} className='min-h-12 w-full rounded-full bg-rose font-semibold text-white hover:opacity-90 disabled:opacity-60'>
            {loading ? 'Creating...' : 'Sign up'}
          </button>
        </form>
        <p className='mt-5 text-sm text-plum/70'>
          Already have an account? <Link to='/login' className='font-semibold text-rose'>Log in</Link>
        </p>
      </div>
    </main>
  )
}
