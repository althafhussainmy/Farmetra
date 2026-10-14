import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import FarmingProducts from './pages/FarmingProducts'
import FarmerProducts from './pages/FarmerProducts'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Orders from './pages/Orders'
import Profile from './pages/Profile'
import Complaints from './pages/Complaints'
import Workers from './pages/Workers'
import WorkRequests from './pages/WorkRequests'
import CropRecommendation from './pages/CropRecommendation'
import MyProducts from './pages/MyProducts'
import AdminVerifyFarmers from './pages/admin/AdminVerifyFarmers'
import AdminFarmingProducts from './pages/admin/AdminFarmingProducts'
import AdminUsers from './pages/admin/AdminUsers'
import AdminUserOrders from './pages/admin/AdminUserOrders'
import AdminFpOrders from './pages/admin/AdminFpOrders'
import AdminComplaints from './pages/admin/AdminComplaints'
import AdminWorkers from './pages/admin/AdminWorkers'
import AdminWorkRequests from './pages/admin/AdminWorkRequests'
import AdminSeedRequests from './pages/admin/AdminSeedRequests'
import AdminSubsidy from './pages/admin/AdminSubsidy'
import AdminSchemes from './pages/admin/AdminSchemes'
import AdminCropDiseaseReports from './pages/admin/AdminCropDiseaseReports'
import AdminNotifications from './pages/admin/AdminNotifications'
import AdminOfficers from './pages/admin/AdminOfficers'
import OfficerDashboard from './pages/admin/OfficerDashboard'
import SeedRequests from './pages/SeedRequests'
import Subsidy from './pages/Subsidy'
import CropDiseaseReport from './pages/CropDiseaseReport'
import Notifications from './pages/Notifications'
import { useAuth } from './context/AuthContext'

function PrivateRoute({ children }) {
  const { token } = useAuth()
  if (!token) return <Navigate to="/login" replace />
  return children
}

function AdminRoute({ children }) {
  const { token, role } = useAuth()
  if (!token) return <Navigate to="/login" replace />
  if (role !== 'admin') return <Navigate to="/" replace />
  return children
}

function StaffRoute({ children }) {
  const { token, role } = useAuth()
  if (!token) return <Navigate to="/login" replace />
  if (role !== 'admin' && role !== 'officer') return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="products/farming" element={<FarmingProducts />} />
        <Route path="products/farmer-products" element={<FarmerProducts />} />
        <Route path="products/farmer-products/:id" element={<ProductDetail />} />
        <Route path="my-products" element={<PrivateRoute><MyProducts /></PrivateRoute>} />
        <Route path="cart" element={<PrivateRoute><Cart /></PrivateRoute>} />
        <Route path="orders" element={<PrivateRoute><Orders /></PrivateRoute>} />
        <Route path="profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="complaints" element={<PrivateRoute><Complaints /></PrivateRoute>} />
        <Route path="workers" element={<PrivateRoute><Workers /></PrivateRoute>} />
        <Route path="work-requests" element={<PrivateRoute><WorkRequests /></PrivateRoute>} />
        <Route path="crop-recommendation" element={<PrivateRoute><CropRecommendation /></PrivateRoute>} />
        <Route path="officer/dashboard" element={<StaffRoute><OfficerDashboard /></StaffRoute>} />
        <Route path="admin/dashboard" element={<StaffRoute><OfficerDashboard /></StaffRoute>} />
        <Route path="admin/verify-farmers" element={<StaffRoute><AdminVerifyFarmers /></StaffRoute>} />
        <Route path="admin/farming-products" element={<StaffRoute><AdminFarmingProducts /></StaffRoute>} />
        <Route path="admin/users" element={<StaffRoute><AdminUsers /></StaffRoute>} />
        <Route path="admin/user-orders" element={<StaffRoute><AdminUserOrders /></StaffRoute>} />
        <Route path="admin/fp-orders" element={<StaffRoute><AdminFpOrders /></StaffRoute>} />
        <Route path="admin/complaints" element={<StaffRoute><AdminComplaints /></StaffRoute>} />
        <Route path="admin/workers" element={<StaffRoute><AdminWorkers /></StaffRoute>} />
        <Route path="admin/work-requests" element={<StaffRoute><AdminWorkRequests /></StaffRoute>} />
        <Route path="admin/seed-requests" element={<StaffRoute><AdminSeedRequests /></StaffRoute>} />
        <Route path="admin/subsidy" element={<StaffRoute><AdminSubsidy /></StaffRoute>} />
        <Route path="admin/schemes" element={<StaffRoute><AdminSchemes /></StaffRoute>} />
        <Route path="admin/crop-disease-reports" element={<StaffRoute><AdminCropDiseaseReports /></StaffRoute>} />
        <Route path="admin/notifications" element={<StaffRoute><AdminNotifications /></StaffRoute>} />
        <Route path="admin/officers" element={<AdminRoute><AdminOfficers /></AdminRoute>} />
        <Route path="seed-requests" element={<PrivateRoute><SeedRequests /></PrivateRoute>} />
        <Route path="subsidy" element={<PrivateRoute><Subsidy /></PrivateRoute>} />
        <Route path="crop-disease-report" element={<PrivateRoute><CropDiseaseReport /></PrivateRoute>} />
        <Route path="notifications" element={<PrivateRoute><Notifications /></PrivateRoute>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
