/**
 * AdminLayout — dark plum sidebar + main content area.
 * Matches the approved admin panel design:
 *   - Sidebar: FaceWise Admin logo, nav links, active state in rose
 *   - Header: page title slot, global search, log-out button
 */
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../services/AuthContext'

const NAV = [
  { label: 'Dashboard',        to: '/admin' },
  { label: 'Users',            to: '/admin/users' },
  { label: 'Makeup products',  to: '/admin/products/makeup' },
  { label: 'Skincare',         to: '/admin/products/skincare' },
  { label: 'Hair products',    to: '/admin/products/hair' },
  { label: 'Hairstyles',       to: '/admin/hairstyles' },
  { label: 'AI/ML models',     to: '/admin/models' },
  { label: 'Scan monitoring',  to: '/admin/scans' },
  { label: 'Recommendations',  to: '/admin/recommendations' },
  { label: 'Reports',          to: '/admin/reports' },
  { label: 'Notifications',    to: '/admin/notifications' },
  { label: 'Feedback',         to: '/admin/feedback' },
  { label: 'Content',          to: '/admin/content' },
  { label: 'Audit logs',       to: '/admin/logs' },
  { label: 'Settings',         to: '/admin/settings' },
]

export default function AdminLayout() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/admin/login')
  }

  return (
    <div className='flex min-h-screen' style={{ background: '#F7F5FB' }}>
      {/* ── Sidebar ─────────────────────────────────────────────── */}
      <aside
        className='flex w-52 shrink-0 flex-col overflow-y-auto'
        style={{ background: '#2A1B3D', color: '#fff' }}
      >
        <div className='px-5 py-6'>
          <span className='font-display text-lg font-bold text-white'>FaceWise Admin</span>
        </div>

        <nav className='flex-1 px-3 pb-6'>
          {NAV.map(({ label, to }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/admin'}
              className={({ isActive }) =>
                'block rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ' +
                (isActive
                  ? 'bg-rose text-white'
                  : 'text-white/70 hover:bg-white/10 hover:text-white')
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* ── Main area ────────────────────────────────────────────── */}
      <div className='flex flex-1 flex-col'>
        {/* Top bar */}
        <header className='flex items-center justify-end gap-4 border-b border-plum/10 bg-white px-8 py-4'>
          <input
            placeholder='Search users, products'
            className='min-h-10 rounded-full border-2 border-plum/20 bg-page px-5 text-sm focus:border-rose focus:outline-none'
            style={{ width: 240 }}
          />
          <button
            onClick={handleLogout}
            className='min-h-10 rounded-full border-2 border-plum px-6 text-sm font-semibold hover:bg-plum hover:text-white transition-colors'
          >
            Log out
          </button>
        </header>

        {/* Page content */}
        <main className='flex-1 overflow-auto p-8'>
          <Outlet />
        </main>
      </div>
    </div>
  )
}

