/**
 * Admin Feedback — paginated table of user ratings and comments.
 * Admin can mark items as read.
 */
import { useEffect, useState } from 'react'
import api from '../../services/api'

const STARS = n => '★'.repeat(n) + '☆'.repeat(5 - n)

export default function AdminFeedback() {
  const [rows, setRows]     = useState([])
  const [total, setTotal]   = useState(0)
  const [loading, setLoad]  = useState(true)
  const [error, setError]   = useState('')

  function load() {
    setLoad(true)
    api.get('/admin/feedback')
      .then(r => { setRows(r.data.feedback ?? []); setTotal(r.data.total) })
      .catch(() => setError('Could not load feedback.'))
      .finally(() => setLoad(false))
  }

  useEffect(load, [])

  async function markRead(id) {
    await api.patch(`/admin/feedback/${id}/read`)
    load()
  }

  return (
    <div>
      <h1 className='font-display text-4xl font-bold text-plum'>Feedback</h1>
      <p className='mt-1 text-sm text-plum/60'>{total} entries</p>
      {error && <p className='mt-4 font-semibold text-rose'>{error}</p>}
      {loading && <p className='mt-6 text-plum/60'>Loading...</p>}
      {!loading && (
        <div className='mt-6 space-y-3'>
          {rows.length === 0 && <p className='text-plum/40'>No feedback yet.</p>}
          {rows.map(f => (
            <div
              key={f.id}
              className={
                'rounded-2xl border p-5 ' +
                (f.read_by_admin ? 'border-plum/10 bg-white' : 'border-rose/30 bg-rose/5')
              }
            >
              <div className='flex items-start justify-between gap-4'>
                <div>
                  <p className='text-sm font-semibold text-plum'>{f.user_name}</p>
                  {f.rating && (
                    <p className='text-sm text-rose'>{STARS(f.rating)}</p>
                  )}
                  <p className='mt-1 text-sm text-plum/70'>{f.text || '—'}</p>
                </div>
                {!f.read_by_admin && (
                  <button
                    onClick={() => markRead(f.id)}
                    className='shrink-0 text-xs font-semibold text-plum/50 hover:text-rose'
                  >
                    Mark read
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

