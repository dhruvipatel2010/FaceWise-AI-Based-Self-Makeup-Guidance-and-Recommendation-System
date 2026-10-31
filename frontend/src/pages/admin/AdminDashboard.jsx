/**
 * Admin Dashboard — headline stats, scans-by-category chart,
 * AI/ML model status, recent scans table, latest feedback,
 * and quick-action buttons.
 * Matches the approved design mockup exactly.
 */
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import api from '../../services/api'

const COLORS = { Makeup: '#C23A61', Skincare: '#2A1B3D', Hairdressing: '#9B8EC4' }

function StatCard({ label, value }) {
  return (
    <div className='rounded-2xl border border-plum/10 bg-white p-6'>
      <p className='text-sm text-plum/60'>{label}</p>
      <p className='mt-2 font-display text-4xl font-bold'>{value ?? '—'}</p>
    </div>
  )
}

export default function AdminDashboard() {
  const [stats, setStats]       = useState(null)
  const [chartData, setChart]   = useState([])
  const [recentScans, setScans] = useState([])
  const [feedback, setFeedback] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/admin/stats').then(r => setStats(r.data)).catch(() => {})
    api.get('/admin/scans/by-category').then(r => setChart(r.data)).catch(() => {})
    api.get('/admin/scans/recent?limit=4').then(r => setScans(r.data)).catch(() => {})
    api.get('/admin/feedback?limit=2').then(r => setFeedback(r.data.feedback ?? [])).catch(() => {})
  }, [])

  function fmt(iso) {
    if (!iso) return '—'
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div>
      <h1 className='font-display text-4xl font-bold text-plum'>Dashboard</h1>

      {/* ── Stat cards ─────────────────────────────────────────── */}
      <div className='mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4'>
        <StatCard label='Total users'        value={stats?.total_users} />
        <StatCard label='Scans today'        value={stats?.scans_today} />
        <StatCard label='Recommendations'    value={stats?.total_recommendations} />
        <StatCard label='Open feedback'      value={stats?.open_feedback} />
      </div>

      {/* ── Chart + Model status ────────────────────────────────── */}
      <div className='mt-6 grid gap-4 lg:grid-cols-3'>
        {/* Bar chart */}
        <div className='col-span-2 rounded-2xl border border-plum/10 bg-white p-6'>
          <h2 className='font-semibold text-plum'>Scans by category</h2>
          <p className='mt-0.5 text-xs text-plum/50'>Sample layout, real data comes from MongoDB</p>
          <ResponsiveContainer width='100%' height={220} className='mt-4'>
            <BarChart data={chartData} barCategoryGap='35%'>
              <XAxis dataKey='category' axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
              <YAxis hide />
              <Tooltip cursor={{ fill: '#EFE9FA' }} />
              <Bar dataKey='scans' radius={[6, 6, 0, 0]}>
                {chartData.map((entry) => (
                  <Cell key={entry.category} fill={COLORS[entry.category] ?? '#9B8EC4'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* AI/ML status */}
        <div className='rounded-2xl border border-plum/10 bg-white p-6'>
          <h2 className='font-semibold text-plum'>AI/ML model status</h2>
          <p className='mt-4 text-xs font-semibold text-rose'>Face-shape model</p>
          <p className='mt-1 font-display text-lg font-bold'>Version v1.0 · Accuracy —</p>
          <p className='mt-4 text-xs text-plum/60'>Failed scans (7 days)</p>
          <p className='mt-0.5 font-display text-2xl font-bold'>—</p>
          <button
            onClick={() => navigate('/admin/models')}
            className='mt-5 min-h-10 rounded-full border-2 border-plum px-5 text-sm font-semibold hover:bg-plum hover:text-white transition-colors'
          >
            View evaluation
          </button>
        </div>
      </div>

      {/* ── Recent scans table ──────────────────────────────────── */}
      <div className='mt-6 rounded-2xl border border-plum/10 bg-white p-6'>
        <div className='flex items-center justify-between'>
          <h2 className='font-semibold text-plum'>Recent scans</h2>
          <button
            onClick={() => navigate('/admin/scans')}
            className='min-h-9 rounded-full border-2 border-plum px-5 text-sm font-semibold hover:bg-plum hover:text-white transition-colors'
          >
            View all
          </button>
        </div>
        <table className='mt-4 w-full text-sm'>
          <thead>
            <tr className='border-b border-plum/10 text-left text-plum/60'>
              <th className='pb-2 font-medium'>User</th>
              <th className='pb-2 font-medium'>Category</th>
              <th className='pb-2 font-medium'>Face shape</th>
              <th className='pb-2 font-medium'>Time</th>
              <th className='pb-2 font-medium'>Status</th>
            </tr>
          </thead>
          <tbody>
            {recentScans.length === 0 && (
              <tr>
                <td colSpan={5} className='py-6 text-center text-plum/40'>No scans yet</td>
              </tr>
            )}
            {recentScans.map((s) => (
              <tr key={s.id} className='border-b border-plum/5 last:border-0'>
                <td className='py-2.5 pr-4'>{s.user_name}</td>
                <td className='py-2.5 pr-4 capitalize'>{s.category}</td>
                <td className='py-2.5 pr-4'>{s.face_shape}</td>
                <td className='py-2.5 pr-4'>{fmt(s.created_at)}</td>
                <td className='py-2.5'>
                  <span
                    className={
                      'rounded-full px-3 py-0.5 text-xs font-semibold ' +
                      (s.status === 'success'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-600')
                    }
                  >
                    {s.status === 'success' ? 'Success' : 'Failed'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Feedback + Quick actions ────────────────────────────── */}
      <div className='mt-6 grid gap-4 lg:grid-cols-2'>
        {/* Latest feedback */}
        <div className='rounded-2xl border border-plum/10 bg-white p-6'>
          <h2 className='font-bold text-plum'>Latest feedback</h2>
          {feedback.length === 0 && (
            <p className='mt-4 text-sm text-plum/40'>No feedback yet</p>
          )}
          {feedback.map((f) => (
            <p key={f.id} className='mt-3 text-sm text-rose'>
              {f.rating ? `${f.rating}★ · ` : ''}
              <span className='text-plum/70'>{f.text || '—'}</span>
            </p>
          ))}
        </div>

        {/* Quick actions */}
        <div className='rounded-2xl border border-plum/10 bg-white p-6'>
          <h2 className='font-bold text-plum'>Quick actions</h2>
          <div className='mt-4 flex flex-wrap gap-3'>
            <button
              onClick={() => navigate('/admin/products/makeup')}
              className='min-h-10 rounded-full bg-rose px-6 text-sm font-semibold text-white hover:opacity-90'
            >
              Add product
            </button>
            <button
              onClick={() => navigate('/admin/notifications')}
              className='min-h-10 rounded-full border-2 border-plum px-6 text-sm font-semibold hover:bg-plum hover:text-white transition-colors'
            >
              Send announcement
            </button>
          </div>
          <button
            onClick={() => navigate('/admin/reports')}
            className='mt-3 min-h-10 rounded-full border-2 border-plum px-6 text-sm font-semibold hover:bg-plum hover:text-white transition-colors'
          >
            Generate report
          </button>
        </div>
      </div>
    </div>
  )
}

