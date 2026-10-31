/**
 * Admin Users — search, filter by status, paginated table,
 * activate/suspend actions.
 */
import { useEffect, useState } from 'react'
import api from '../../services/api'

export default function AdminUsers() {
  const [users, setUsers]   = useState([])
  const [total, setTotal]   = useState(0)
  const [q, setQ]           = useState('')
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState('')

  function load() {
    setLoading(true)
    setError('')
    const params = {}
    if (search) params.q = search
    if (status) params.status = status
    api.get('/admin/users', { params })
      .then(r => { setUsers(r.data.users); setTotal(r.data.total) })
      .catch(() => setError('Could not load users.'))
      .finally(() => setLoading(false))
  }

  useEffect(load, [search, status])

  async function setUserStatus(id, newStatus) {
    await api.patch(`/admin/users/${id}/status`, { status: newStatus })
    load()
  }

  return (
    <div>
      <h1 className='font-display text-4xl font-bold text-plum'>Users</h1>
      <p className='mt-1 text-sm text-plum/60'>{total} accounts</p>

      {/* Filters */}
      <div className='mt-6 flex flex-wrap gap-3'>
        <form
          onSubmit={e => { e.preventDefault(); setSearch(q.trim()) }}
          className='flex gap-2'
        >
          <input
            value={q} onChange={e => setQ(e.target.value)}
            placeholder='Search name or email'
            className='min-h-11 rounded-full border-2 border-plum/20 bg-white px-5 text-sm focus:border-rose focus:outline-none'
            style={{ width: 260 }}
          />
          <button
            type='submit'
            className='min-h-11 rounded-full bg-rose px-6 text-sm font-semibold text-white hover:opacity-90'
          >
            Search
          </button>
        </form>
        <select
          value={status} onChange={e => setStatus(e.target.value)}
          className='min-h-11 rounded-full border-2 border-plum/20 bg-white px-4 text-sm focus:border-rose focus:outline-none'
        >
          <option value=''>All statuses</option>
          <option value='active'>Active</option>
          <option value='suspended'>Suspended</option>
        </select>
      </div>

      {error && <p role='alert' className='mt-4 font-semibold text-rose'>{error}</p>}
      {loading && <p className='mt-6 text-plum/60'>Loading...</p>}

      {!loading && (
        <div className='mt-6 overflow-x-auto rounded-2xl border border-plum/10 bg-white'>
          <table className='w-full text-sm'>
            <thead>
              <tr className='border-b border-plum/10 text-left text-plum/60'>
                <th className='px-5 py-3 font-medium'>Name</th>
                <th className='px-5 py-3 font-medium'>Email</th>
                <th className='px-5 py-3 font-medium'>Role</th>
                <th className='px-5 py-3 font-medium'>Status</th>
                <th className='px-5 py-3 font-medium'>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 && (
                <tr><td colSpan={5} className='px-5 py-8 text-center text-plum/40'>No users found</td></tr>
              )}
              {users.map(u => (
                <tr key={u.id} className='border-b border-plum/5 last:border-0'>
                  <td className='px-5 py-3'>{u.name}</td>
                  <td className='px-5 py-3 text-plum/70'>{u.email}</td>
                  <td className='px-5 py-3'>
                    <span className='rounded-full bg-lilac px-3 py-0.5 text-xs font-semibold capitalize'>
                      {u.role}
                    </span>
                  </td>
                  <td className='px-5 py-3'>
                    <span
                      className={
                        'rounded-full px-3 py-0.5 text-xs font-semibold ' +
                        (u.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-600')
                      }
                    >
                      {u.status}
                    </span>
                  </td>
                  <td className='px-5 py-3'>
                    {u.role !== 'admin' && (
                      <button
                        onClick={() => setUserStatus(u.id, u.status === 'active' ? 'suspended' : 'active')}
                        className='text-xs font-semibold text-rose hover:underline'
                      >
                        {u.status === 'active' ? 'Suspend' : 'Activate'}
                      </button>
                    )}
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

