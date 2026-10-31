import { Outlet, Link } from 'react-router-dom'
import Navbar from './Navbar'

export default function Layout() {
  return (
    <div className='min-h-screen flex flex-col justify-between bg-page text-plum'>
      <Navbar />

      {/* Main full-width container */}
      <div className='flex-1 w-full'>
        <Outlet />
      </div>

      {/* Aesthetic Luxury Beauty Footer */}
      <footer className='border-t border-plum/10 bg-white py-12 mt-16'>
        <div className='mx-auto max-w-[1600px] px-6 md:px-12 lg:px-16'>
          <div className='flex flex-wrap items-center justify-between gap-6'>
            <div>
              <div className='flex items-center gap-2'>
                <div className='flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-rose to-plum text-white font-bold text-sm'>
                  F
                </div>
                <span className='font-display text-xl font-bold text-plum'>FaceWise</span>
              </div>
              <p className='mt-2 text-xs text-plum/60 max-w-sm'>
                AI-based self makeup guidance, skin diagnostic metrics, and face-shape haircut recommendations.
              </p>
            </div>

            <div className='flex flex-wrap gap-8 text-xs font-semibold text-plum/70'>
              <Link to='/makeup' className='hover:text-rose transition'>Makeup Studio</Link>
              <Link to='/skincare' className='hover:text-rose transition'>Skin Diagnostic</Link>
              <Link to='/hairdressing' className='hover:text-rose transition'>Hair & Cut Styling</Link>
              <Link to='/admin/login' className='hover:text-rose transition'>Admin Portal</Link>
            </div>
          </div>

          <div className='mt-8 flex flex-wrap items-center justify-between border-t border-plum/10 pt-6 text-[11px] text-plum/50'>
            <p>© {new Date().getFullYear()} FaceWise AI. On-device private facial vision. Skin results are cosmetic guidance, not medical advice.</p>
            <p>Made with MediaPipe · React 19 · FastAPI · MongoDB Atlas</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
