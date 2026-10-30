import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../services/AuthContext'

const pill = 'inline-flex min-h-11 items-center rounded-full px-6 font-semibold'

export default function Navbar() {
  const { token, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <header className='flex flex-wrap items-center justify-between gap-4 px-6 py-5 md:px-12'>
      <Link to='/' className='font-display text-2xl'>FaceWise</Link>
      <nav className='flex flex-wrap items-center gap-6 text-sm'>
        <Link to='/' className='hover:text-rose'>Home</Link>
        <Link to='/makeup' className='hover:text-rose'>Makeup</Link>
        <Link to='/skincare' className='hover:text-rose'>Skincare</Link>
        <Link to='/hairdressing' className='hover:text-rose'>Hairdressing</Link>
        {token && <Link to='/dashboard' className='hover:text-rose'>Dashboard</Link>}
      </nav>
      <div className='flex items-center gap-3'>
        {token ? (
          <button onClick={handleLogout} className={pill + ' border-2 border-plum hover:bg-plum hover:text-white'}>
            Log out
          </button>
        ) : (
          <>
            <Link to='/login' className={pill + ' border-2 border-plum hover:bg-plum hover:text-white'}>Log in</Link>
            <Link to='/register' className={pill + ' bg-rose text-white hover:opacity-90'}>Sign up</Link>
          </>
        )}
      </div>
    </header>
  )
}
