import { useEffect, useState } from 'react'
import api from '../services/api'

export default function Dashboard() {
  const [me, setMe] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/auth/me')
      .then((res) => setMe(res.data))
      .catch(() => setError('Could not load your profile. Please log in again.'))
  }, [])

  return (
    <main className='mx-auto max-w-6xl px-6 py-10 md:px-12'>
      <h1 className='font-display text-4xl'>Dashboard</h1>
      {error && <p role='alert' className='mt-4 font-semibold text-rose'>{error}</p>}
      {me && (
        <div className='mt-6 max-w-md rounded-3xl border border-plum/10 bg-white p-7'>
          <p className='text-sm text-plum/70'>Signed in as</p>
          <p className='mt-1 font-display text-2xl'>{me.name}</p>
          <p className='text-sm'>{me.email}</p>
          <p className='mt-3 inline-block rounded-full bg-lilac px-4 py-1 text-sm font-semibold'>Role: {me.role}</p>
        </div>
      )}
    </main>
  )
}
