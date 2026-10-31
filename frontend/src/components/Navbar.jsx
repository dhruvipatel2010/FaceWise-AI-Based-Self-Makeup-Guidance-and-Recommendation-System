import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../services/AuthContext'

const pill = 'inline-flex min-h-11 items-center rounded-full px-6 text-sm font-semibold transition-all duration-200'

export default function Navbar() {
  const { token, logout, role } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/')
  }

  const navItem = ({ isActive }) =>
    'px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ' +
    (isActive
      ? 'bg-rose text-white shadow-xs'
      : 'text-plum/80 hover:text-rose hover:bg-rose/5')

  return (
    <header className='sticky top-0 z-50 border-b border-plum/10 bg-page/90 backdrop-blur-md'>
      <div className='mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-4 px-6 py-4 md:px-12 lg:px-16'>
        {/* Brand Logo */}
        <Link to='/' className='flex items-center gap-2.5 group'>
          <div className='flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-rose to-plum text-white shadow-sm transition-transform duration-300 group-hover:scale-105'>
            <span className='font-display text-lg font-bold'>F</span>
          </div>
          <div>
            <span className='font-display text-2xl font-bold tracking-tight text-plum'>FaceWise</span>
            <span className='hidden text-[10px] font-bold tracking-widest text-rose uppercase sm:block'>
              AI Beauty Studio
            </span>
          </div>
        </Link>

        {/* Navigation links */}
        <nav className='flex flex-wrap items-center gap-1.5 md:gap-2'>
          <NavLink to='/' end className={navItem}>Home</NavLink>
          <NavLink to='/makeup' className={navItem}>💄 Makeup</NavLink>
          <NavLink to='/skincare' className={navItem}>🧴 Skincare</NavLink>
          <NavLink to='/hairdressing' className={navItem}>💇 Hairdressing</NavLink>
          {token && <NavLink to='/dashboard' className={navItem}>Dashboard</NavLink>}
          {token && role === 'admin' && (
            <Link
              to='/admin'
              className='rounded-full bg-plum px-4 py-2 text-xs font-bold text-white transition hover:bg-plum/90'
            >
              Admin Panel ⚡
            </Link>
          )}
        </nav>

        {/* User Auth Buttons */}
        <div className='flex items-center gap-3'>
          {token ? (
            <button
              onClick={handleLogout}
              className={pill + ' border-2 border-plum text-plum hover:bg-plum hover:text-white'}
            >
              Log out
            </button>
          ) : (
            <>
              <Link
                to='/login'
                className={pill + ' border-2 border-plum text-plum hover:bg-plum hover:text-white'}
              >
                Log in
              </Link>
              <Link
                to='/register'
                className={pill + ' bg-rose text-white shadow-sm hover:opacity-95 hover:shadow-md'}
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
