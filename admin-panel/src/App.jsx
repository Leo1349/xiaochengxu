import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import AdminLayout from './components/AdminLayout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Teachers from './pages/Teachers'
import Banners from './pages/Banners'
import Orders from './pages/Orders'
import Users from './pages/Users'
import Feedbacks from './pages/Feedbacks'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [adminInfo, setAdminInfo] = useState(null)

  useEffect(() => {
    // 检查本地存储的登录状态
    const token = localStorage.getItem('adminToken')
    const admin = localStorage.getItem('adminInfo')
    if (token && admin) {
      setIsLoggedIn(true)
      setAdminInfo(JSON.parse(admin))
    }
  }, [])

  const handleLogin = (admin) => {
    setIsLoggedIn(true)
    setAdminInfo(admin)
    localStorage.setItem('adminToken', admin.token)
    localStorage.setItem('adminInfo', JSON.stringify(admin))
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setAdminInfo(null)
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminInfo')
  }

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />
  }

  return (
    <AdminLayout adminInfo={adminInfo} onLogout={handleLogout}>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/teachers" element={<Teachers />} />
        <Route path="/banners" element={<Banners />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/users" element={<Users />} />
        <Route path="/feedbacks" element={<Feedbacks />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AdminLayout>
  )
}

export default App
