/**
 * Admin Notifications — compose and send announcements
 * to all users or a specific user ID.
 */
import { useState } from 'react'
import api from '../../services/api'

export default function AdminNotifications() {
  const [message, setMessage] = useState('')
  const [target, setTarget]   = useState('all')
  const [sending, setSending] = useState(false)
  const [result, setResult]   = useState('')
  const [error, setError]     = useState('')

  async function handleSend(e) {
    e.preventDefault()
    setResult(''); setError('')
    setSending(true)
    try {
      const r = await api.post('/admin/notifications/send', { message, target })
      setResult(`Sent to ${r.data.sent} user(s).`)
      setMessage('')
    } catch {
      setError('Could not send notification.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div>
      <h1 className='font-display text-4xl font-bold text-plum'>Notifications</h1>
      <p className='mt-1 text-sm text-plum/60'>Send announcements and alerts to users.</p>

      <form onSubmit={handleSend} className='mt-8 max-w-lg space-y-5'>
        <div>
          <label className='text-sm font-semibold text-plum'>Target</label>
          <select
            value={target} onChange={e => setTarget(e.target.value)}
            className='mt-1 block min-h-11 w-full rounded-xl border-2 border-plum/20 bg-white px-4 text-sm focus:border-rose focus:outline-none'
          >
            <option value='all'>All users</option>
            <option value='custom'>Specific user ID</option>
          </select>
        </div>
        {target === 'custom' && (
          <div>
            <label className='text-sm font-semibold text-plum'>User ID</label>
            <input
              required placeholder='MongoDB user _id'
              onChange={e => setTarget(e.target.value)}
              className='mt-1 block min-h-11 w-full rounded-xl border-2 border-plum/20 bg-white px-4 text-sm focus:border-rose focus:outline-none'
            />
          </div>
        )}
        <div>
          <label className='text-sm font-semibold text-plum'>Message *</label>
          <textarea
            required rows={4} value={message} onChange={e => setMessage(e.target.value)}
            placeholder='Type your announcement here...'
            className='mt-1 block w-full rounded-xl border-2 border-plum/20 bg-white px-4 py-3 text-sm focus:border-rose focus:outline-none'
          />
        </div>
        {error  && <p className='text-sm font-semibold text-rose'>{error}</p>}
        {result && <p className='text-sm font-semibold text-green-600'>{result}</p>}
        <button
          type='submit' disabled={sending || !message.trim()}
          className='min-h-11 rounded-full bg-rose px-8 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60'
        >
          {sending ? 'Sending...' : 'Send announcement'}
        </button>
      </form>
    </div>
  )
}

