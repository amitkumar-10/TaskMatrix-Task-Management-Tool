import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'

import Signup         from './pages/auth/Signup'
import VerifyOtp      from './pages/auth/VerifyOtp'
import Login          from './pages/auth/Login'
import ForgotPassword from './pages/auth/ForgotPassword'
import VerifyResetOtp from './pages/auth/VerifyResetOtp'
import ResetPassword  from './pages/auth/ResetPassword'
import Dashboard      from './pages/Dashboard'
import Organisations from './pages/org/Organisations'
import OrgDetail     from './pages/org/OrgDetail'
import Projects    from './pages/project/Projects'
import ProjectDetail from './pages/project/ProjectDetail'
import AcceptInvite from './pages/org/AcceptInvite'
import Workspace from './pages/workspace/Workspace'
import Notifications from './pages/Notifications'
import MyTasks from './pages/MyTasks'

// redirect logged-in users away from auth pages
function GuestRoute({ children }) {
  const { isLoggedIn, loading } = useAuth()
  if (loading) return null
  if (isLoggedIn) return <Navigate to="/dashboard" replace />
  return children
}

export default function App() {
  return (
    <Routes>

      {/* guest only */}
      <Route path="/signup" element={
        <GuestRoute><Signup /></GuestRoute>
      } />
      <Route path="/verify-otp" element={<VerifyOtp />} />
      <Route path="/login" element={
        <GuestRoute><Login /></GuestRoute>
      } />
      <Route path="/forgot-password" element={
        <GuestRoute><ForgotPassword /></GuestRoute>
      } />
      <Route path="/verify-reset-otp" element={<VerifyResetOtp />} />
      <Route path="/reset-password"   element={<ResetPassword />} />

      {/* protected — wrapped in Layout */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Layout>
            <Dashboard />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/organisations" element={
        <ProtectedRoute>
          <Layout><Organisations /></Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/organisations/:orgId" element={
        <ProtectedRoute>
          <Layout><OrgDetail /></Layout>
        </ProtectedRoute>
      } />

      <Route path="/projects" element={
        <ProtectedRoute>
          <Layout><Projects /></Layout>
        </ProtectedRoute>
      } />

      <Route path="/projects/:projectId" element={
        <ProtectedRoute>
          <Layout><ProjectDetail /></Layout>
        </ProtectedRoute>
      } />

      <Route path="/invite/accept" element={
        <AcceptInvite />} 
      />
  
      <Route path="/workspace" element={
        <ProtectedRoute>
          <Layout><Workspace /></Layout>
        </ProtectedRoute>
      } />

      <Route path="/notifications" element={
        <ProtectedRoute>
          <Layout><Notifications /></Layout>
        </ProtectedRoute>
      } />

      <Route path="/my-tasks" element={
        <ProtectedRoute>
          <Layout><MyTasks /></Layout>
        </ProtectedRoute>
      } />

      {/* default */}
      <Route path="*" element={<Navigate to="/login" replace />} />

    </Routes>
  )
}