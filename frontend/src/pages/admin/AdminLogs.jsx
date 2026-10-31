/**
 * Admin Audit Logs — paginated, read-only table of all admin actions.
 */
import { useEffect, useState } from 'react'
import api from '../../services/api'

export default function AdminLogs() {
  const [logs, setLogs]   = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setL]   = useState(true)
  const [error, setE]     = useState('')

  useEffect(() => {
    api.get('/admin/logs')
      .then(r => { setLogs(r.data.logs); setTotal(r.data.total) })
      .catch(() => setE('Could not load audit logs.'))
      .finally(() => setL(false))
  }, [])

  function fmt(iso) {
    if (!iso) return '—'
    return new Date(iso).toLocaleString()
  }

  return (
    <div>
      <h1 className='font-display text-4xl font-bold text-plum'>Audit logs</h1>
      <p className='mt-1 text-sm text-plum/60'>{total} entries (showing latest 50)</p>
      {error && <p className='mt-4 font-semibold text-rose'>{error}</p>}
      {loading && <p className='mt-6 text-plum/60'>Loading...</p>}
      {!loading && (
        <div className='mt-6 overflow-x-auto rounded-2xl border border-plum/10 bg-white'>
          <table className='w-full text-sm'>
            <thead>
              <tr className='border-b border-plum/10 text-left text-plum/60'>
                <th className='px-5 py-3 font-medium'>Action</th>
                <th className='px-5 py-3 font-medium'>Collection</th>
                <th className='px-5 py-3 font-medium'>Record ID</th>
                <th className='px-5 py-3 font-medium'>Admin ID</th>
                <th className='px-5 py-3 font-medium'>Time</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 && (
                <tr><td colSpan={5} className='px-5 py-8 text-center text-plum/40'>No log entries yet</td></tr>
              )}
              {logs.map(l => (
                <tr key={l.id} className='border-b border-plum/5 last:border-0'>
                  <td className='px-5 py-3 font-medium text-rose'>{l.action}</td>
                  <td className='px-5 py-3 text-plum/70'>{l.target_collection || '—'}</td>
                  <td className='px-5 py-3 font-mono text-xs text-plum/50'>{l.record_id || '—'}</td>
                  <td className='px-5 py-3 font-mono text-xs text-plum/50'>{l.admin_id}</td>
                  <td className='px-5 py-3 text-plum/60'>{fmt(l.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

