import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import AdminLayout from './components/AdminLayout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Teachers from './pages/Teachers'
import Banners from './pages/Banners'
import Orders from './pages/Orders'
import Users from './pages/Users'
import Cases from './pages/Cases'
import Feedbacks from './pages/Feedbacks'
import Demands from './pages/Demands'
import CustomerService from './pages/CustomerService'
import ServiceTypes from './pages/ServiceTypes'

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
    return (
      <ConfigProvider locale={zhCN}>
        <Login onLogin={handleLogin} />
      </ConfigProvider>
    )
  }

  return (
    <ConfigProvider locale={zhCN}>
      <AdminLayout adminInfo={adminInfo} onLogout={handleLogout}>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/teachers" element={<Teachers />} />
          <Route path="/banners" element={<Banners />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/users" element={<Users />} />
          <Route path="/cases" element={<Cases />} />
          <Route path="/feedbacks" element={<Feedbacks />} />
          <Route path="/demands" element={<Demands />} />
          <Route path="/demands" element={<Demands />} />
          <Route path="/service-types" element={<ServiceTypes />} />
          <Route path="/customer-service" element={<CustomerService />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AdminLayout>
    </ConfigProvider>
  )
}

export default App
