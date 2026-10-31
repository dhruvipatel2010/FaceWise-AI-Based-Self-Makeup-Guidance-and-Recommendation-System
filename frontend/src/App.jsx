import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import AdminLayout from './components/AdminLayout'
import AdminRoute from './components/AdminRoute'

// User pages
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Makeup from './pages/Makeup'
import Skincare from './pages/Skincare'
import Hairdressing from './pages/Hairdressing'
import Scan from './pages/Scan'

// Admin pages
import AdminLogin from './pages/admin/AdminLogin'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminUsers from './pages/admin/AdminUsers'
import AdminProducts from './pages/admin/AdminProducts'
import AdminFeedback from './pages/admin/AdminFeedback'
import AdminNotifications from './pages/admin/AdminNotifications'
import AdminReports from './pages/admin/AdminReports'
import AdminLogs from './pages/admin/AdminLogs'
import AdminScanMonitoring from './pages/admin/AdminScanMonitoring'
import {
  AdminHairstyles,
  AdminModels,
  AdminRecommendations,
  AdminContent,
  AdminSettings,
} from './pages/admin/AdminMisc'

export default function App() {
  return (
    <Routes>
      {/* ── User panel ──────────────────────────────────── */}
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

      {/* ── Admin login (no sidebar) ────────────────────── */}
      <Route path='/admin/login' element={<AdminLogin />} />

      {/* ── Admin panel (sidebar layout, admin-gated) ───── */}
      <Route
        path='/admin'
        element={<AdminRoute><AdminLayout /></AdminRoute>}
      >
        <Route index element={<AdminDashboard />} />
        <Route path='users' element={<AdminUsers />} />

        {/* Product management — one page, three categories */}
        <Route path='products/makeup'   element={<AdminProducts category='makeup'   title='Makeup products' />} />
        <Route path='products/skincare' element={<AdminProducts category='skincare' title='Skincare products' />} />
        <Route path='products/hair'     element={<AdminProducts category='hair'     title='Hair products' />} />

        <Route path='hairstyles'      element={<AdminHairstyles />} />
        <Route path='models'          element={<AdminModels />} />
        <Route path='scans'           element={<AdminScanMonitoring />} />
        <Route path='recommendations' element={<AdminRecommendations />} />
        <Route path='reports'         element={<AdminReports />} />
        <Route path='notifications'   element={<AdminNotifications />} />
        <Route path='feedback'        element={<AdminFeedback />} />
        <Route path='content'         element={<AdminContent />} />
        <Route path='logs'            element={<AdminLogs />} />
        <Route path='settings'        element={<AdminSettings />} />
      </Route>
    </Routes>
  )
}
