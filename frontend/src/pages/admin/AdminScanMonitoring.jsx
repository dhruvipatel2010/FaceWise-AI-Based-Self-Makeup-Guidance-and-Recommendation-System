/**
 * Admin Scan Monitoring — recent scan table + quick stats.
 * Full scan history for admin review.
 */
import { useEffect, useState } from 'react'
import api from '../../services/api'

export default function AdminScanMonitoring() {
  const [scans, setScans] = useState([])
  const [loading, setL]   = useState(true)
  const [error, setE]     = useState('')

  useEffect(() => {
    api.get('/admin/scans/recent?limit=50')
      .then(r => setScans(r.data))
      .catch(() => setE('Could not load scans.'))
      .finally(() => setL(false))
  }, [])

  function fmt(iso) {
    if (!iso) return '—'
    return new Date(iso).toLocaleString()
  }

  return (
    <div>
      <h1 className='font-display text-4xl font-bold text-plum'>Scan monitoring</h1>
      <p className='mt-1 text-sm text-plum/60'>Latest 50 scans across all users and categories</p>
      {error && <p className='mt-4 font-semibold text-rose'>{error}</p>}
      {loading && <p className='mt-6 text-plum/60'>Loading...</p>}
      {!loading && (
        <div className='mt-6 overflow-x-auto rounded-2xl border border-plum/10 bg-white'>
          <table className='w-full text-sm'>
            <thead>
              <tr className='border-b border-plum/10 text-left text-plum/60'>
                <th className='px-5 py-3 font-medium'>User</th>
                <th className='px-5 py-3 font-medium'>Category</th>
                <th className='px-5 py-3 font-medium'>Face shape</th>
                <th className='px-5 py-3 font-medium'>Time</th>
                <th className='px-5 py-3 font-medium'>Status</th>
              </tr>
            </thead>
            <tbody>
              {scans.length === 0 && (
                <tr><td colSpan={5} className='px-5 py-8 text-center text-plum/40'>No scans yet</td></tr>
              )}
              {scans.map(s => (
                <tr key={s.id} className='border-b border-plum/5 last:border-0'>
                  <td className='px-5 py-3'>{s.user_name}</td>
                  <td className='px-5 py-3 capitalize'>{s.category}</td>
                  <td className='px-5 py-3'>{s.face_shape}</td>
                  <td className='px-5 py-3 text-plum/60'>{fmt(s.created_at)}</td>
                  <td className='px-5 py-3'>
                    <span className={
                      'rounded-full px-3 py-0.5 text-xs font-semibold ' +
                      (s.status === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600')
                    }>
                      {s.status === 'success' ? 'Success' : 'Failed'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

