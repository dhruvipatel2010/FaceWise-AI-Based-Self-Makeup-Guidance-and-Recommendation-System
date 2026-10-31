/**
 * Admin Reports — daily scans line chart, face-shape distribution
 * bar chart, and summary numbers for the last 7 days.
 */
import { useEffect, useState } from 'react'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'
import api from '../../services/api'

export default function AdminReports() {
  const [data, setData]   = useState(null)
  const [loading, setL]   = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/admin/reports/summary')
      .then(r => setData(r.data))
      .catch(() => setError('Could not load report data.'))
      .finally(() => setL(false))
  }, [])

  if (loading) return <p className='text-plum/60'>Loading report…</p>
  if (error)   return <p className='font-semibold text-rose'>{error}</p>

  return (
    <div>
      <h1 className='font-display text-4xl font-bold text-plum'>Reports</h1>
      <p className='mt-1 text-sm text-plum/60'>Last 7 days — live data from MongoDB</p>

      {/* Summary numbers */}
      <div className='mt-6 grid grid-cols-3 gap-4'>
        {[
          ['Total users',    data.total_users],
          ['Total scans',    data.total_scans],
          ['Total products', data.total_products],
        ].map(([label, value]) => (
          <div key={label} className='rounded-2xl border border-plum/10 bg-white p-5'>
            <p className='text-sm text-plum/60'>{label}</p>
            <p className='mt-1 font-display text-3xl font-bold'>{value}</p>
          </div>
        ))}
      </div>

      {/* Daily scans line chart */}
      <div className='mt-6 rounded-2xl border border-plum/10 bg-white p-6'>
        <h2 className='font-semibold text-plum'>Scans per day (7 days)</h2>
        <ResponsiveContainer width='100%' height={220} className='mt-4'>
          <LineChart data={data.daily_scans}>
            <CartesianGrid strokeDasharray='3 3' stroke='#EFE9FA' />
            <XAxis dataKey='date' tick={{ fontSize: 11 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
            <Tooltip />
            <Line type='monotone' dataKey='scans' stroke='#C23A61' strokeWidth={2} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Face shape bar chart */}
      <div className='mt-6 rounded-2xl border border-plum/10 bg-white p-6'>
        <h2 className='font-semibold text-plum'>Face shape distribution (all time)</h2>
        <ResponsiveContainer width='100%' height={200} className='mt-4'>
          <BarChart data={data.face_shape_distribution} barCategoryGap='35%'>
            <XAxis dataKey='shape' axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
            <YAxis hide />
            <Tooltip cursor={{ fill: '#EFE9FA' }} />
            <Bar dataKey='count' radius={[6, 6, 0, 0]} fill='#9B8EC4' />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

