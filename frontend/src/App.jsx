import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import DashboardSuperadmin from './pages/DashboardSuperadmin'
import DashboardAdmin from './pages/DashboardAdmin'
import AdminShell from './pages/Admin/AdminShell'
import { MakePost, AdminPosts, RejectedPostsAdmin, PostRequest, BuildAdminProfile } from './pages/Admin/Placeholders'
import DashboardUser from './pages/DashboardUser'
import UserShell from './pages/User/UserShell'
import { Network, Posts, Internships, Jobs, Events } from './pages/User/UserPlaceholders'
import AddAdmin from './pages/Superadmin/AddAdmin'
import SuperAdminShell from './pages/Superadmin/AdminShell'
import Profile from './pages/Profile'
import Institutes from './pages/Superadmin/Institutes'
import Corporate from './pages/Superadmin/Corporate'
import School from './pages/Superadmin/School'
import { useAuth } from './context/AuthContext'
import HierarchyRequests from './pages/Subadmin/HierarchyRequests'
import SubAdminProtectedRoute from './components/SubAdminProtectedRoute'
import ManageUserRequests from './pages/Subadmin/ManageUserRequests'
import ManageAlumni from './pages/Subadmin/ManageAlumni'
import RejectedRequests from './pages/Subadmin/RejectedRequests'
import PostRequests from './pages/Subadmin/PostRequests'
import SubadminShell from './pages/Subadmin/SubadminShell'

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, ready } = useAuth()
  // Wait for auth to initialize before redirecting to login. This avoids
  // a brief flash/redirect during page refresh when token exists but user
  // hasn't been fetched yet.
  if (!ready) return <div className="p-6">Loading...</div>
  if (!user) return <Navigate to="/login" replace />
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/login" replace />
  return children
}

const HomeRedirect = () => {
  const { user, ready } = useAuth()
  if (!ready) return <div className="p-6">Loading...</div>
  if (!user) return <Navigate to="/login" replace />
  // Superadmin goes to system console
  if (user.role === 'superadmin') return <Navigate to="/superadmin/dashboard" replace />
  // If user has an adminHierarchy, route them to subadmin dashboard
  if (user.adminHierarchy) return <Navigate to="/subadmin/dashboard" replace />
  // Admin role goes to admin dashboard
  if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />
  // Default user dashboard
  return <Navigate to="/user/dashboard" replace />
}

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

  <Route path="/superadmin" element={<ProtectedRoute allowedRoles={["superadmin"]}><SuperAdminShell /></ProtectedRoute>}>
        <Route index element={<Navigate to="/superadmin/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardSuperadmin />} />
        <Route path="profile" element={<Profile />} />
        <Route path="institutes" element={<Institutes />} />
        <Route path="corporate" element={<Corporate />} />
        <Route path="school" element={<School />} />
        <Route path="add-admin" element={<AddAdmin />} />
      </Route>

      {/* top-level profile route for non-superadmin users */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      <Route path="/admin" element={<ProtectedRoute allowedRoles={["admin"]}><AdminShell /></ProtectedRoute>}>
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardAdmin />} />
        <Route path="requests" element={<ManageUserRequests />} />
        <Route path="manage-alumni" element={<ManageAlumni />} />
        <Route path="add-alumni" element={<ManageAlumni />} />
        <Route path="rejected-requests" element={<RejectedRequests />} />
        <Route path="make-post" element={<MakePost />} />
        <Route path="admin-posts" element={<AdminPosts />} />
        <Route path="rejected-posts" element={<RejectedPostsAdmin />} />
        <Route path="post-request" element={<PostRequest />} />
        <Route path="build-profile" element={<BuildAdminProfile />} />
      </Route>

      <Route path="/user" element={<ProtectedRoute allowedRoles={["user"]}><UserShell /></ProtectedRoute>}>
        <Route index element={<Navigate to="/user/dashboard" replace />} />
        <Route path="dashboard" element={<ProtectedRoute allowedRoles={["user"]}><DashboardUser /></ProtectedRoute>} />
        <Route path="profile" element={<ProtectedRoute allowedRoles={["user"]}><Profile /></ProtectedRoute>} />
        <Route path="network" element={<ProtectedRoute allowedRoles={["user"]}><Network /></ProtectedRoute>} />
        <Route path="posts" element={<ProtectedRoute allowedRoles={["user"]}><Posts /></ProtectedRoute>} />
        <Route path="internships" element={<ProtectedRoute allowedRoles={["user"]}><Internships /></ProtectedRoute>} />
        <Route path="jobs" element={<ProtectedRoute allowedRoles={["user"]}><Jobs /></ProtectedRoute>} />
        <Route path="events" element={<ProtectedRoute allowedRoles={["user"]}><Events /></ProtectedRoute>} />
      </Route>

  <Route path="*" element={<div className="p-8">Not Found</div>} />
      <Route path="/subadmin" element={<SubAdminProtectedRoute><SubadminShell /></SubAdminProtectedRoute>}>
        <Route index element={<Navigate to="/subadmin/dashboard" replace />} />
        <Route path="hierarchy-requests" element={<SubAdminProtectedRoute minLevel={2}><HierarchyRequests /></SubAdminProtectedRoute>} />
        <Route path="dashboard" element={<SubAdminProtectedRoute minLevel={3}><DashboardAdmin /></SubAdminProtectedRoute>} />
        <Route path="network-requests" element={<SubAdminProtectedRoute minLevel={3}><ManageUserRequests /></SubAdminProtectedRoute>} />
        <Route path="manage-alumni" element={<SubAdminProtectedRoute minLevel={3}><ManageAlumni /></SubAdminProtectedRoute>} />
  <Route path="rejected-requests" element={<SubAdminProtectedRoute minLevel={2}><RejectedRequests /></SubAdminProtectedRoute>} />
  <Route path="post-requests" element={<SubAdminProtectedRoute minLevel={2}><PostRequests /></SubAdminProtectedRoute>} />

  {/* Post-related placeholder routes available to subadmins */}
  <Route path="post-creation" element={<SubAdminProtectedRoute minLevel={3}><MakePost /></SubAdminProtectedRoute>} />
  <Route path="admin-posts" element={<SubAdminProtectedRoute minLevel={3}><AdminPosts /></SubAdminProtectedRoute>} />
  <Route path="rejected-posts" element={<SubAdminProtectedRoute minLevel={2}><RejectedPostsAdmin /></SubAdminProtectedRoute>} />
      </Route>
    </Routes>
  )
}

export default App
