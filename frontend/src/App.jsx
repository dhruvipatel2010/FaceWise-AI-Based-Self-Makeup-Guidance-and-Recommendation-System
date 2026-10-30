import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Makeup from './pages/Makeup'
import Skincare from './pages/Skincare'
import Hairdressing from './pages/Hairdressing'
import Scan from './pages/Scan'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path='/' element={<Home />} />
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
        <Route path='/makeup' element={<Makeup />} />
        <Route path='/skincare' element={<Skincare />} />
        <Route path='/hairdressing' element={<Hairdressing />} />
        <Route path='/scan' element={<Scan />} />
        <Route path='/dashboard' element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      </Route>
    </Routes>
  )
}
