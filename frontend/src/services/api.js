import axios from 'axios'

const baseURL = '/api'

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true
      const refresh = localStorage.getItem('refresh')
      if (refresh) {
        try {
          const { data } = await axios.post(`${baseURL}/auth/token/refresh/`, { refresh })
          localStorage.setItem('access', data.access)
          original.headers.Authorization = `Bearer ${data.access}`
          return api(original)
        } catch (_) {
          localStorage.removeItem('access')
          localStorage.removeItem('refresh')
          window.location.href = '/login'
        }
      }
    }
    return Promise.reject(err)
  }
)

// Auth
export const login = (username, password) =>
  api.post('/auth/token/', { username, password }).then((r) => r.data)
export const getCurrentUser = () => api.get('/auth/me/').then((r) => r.data)

export const registerFarmer = (body) => api.post('/auth/register/farmer/', body).then((r) => r.data)
export const registerUser = (body) => api.post('/auth/register/user/', body).then((r) => r.data)
export const registerWorker = (body) => api.post('/auth/register/worker/', body).then((r) => r.data)

export const getFarmerProfile = () => api.get('/auth/profile/farmer/').then((r) => r.data)
export const getUserProfile = () => api.get('/auth/profile/user/').then((r) => r.data)
export const getWorkerProfile = () => api.get('/auth/profile/worker/').then((r) => r.data)
export const updateFarmerProfile = (data) => api.patch('/auth/profile/farmer/', data).then((r) => r.data)
export const updateUserProfile = (data) => api.patch('/auth/profile/user/', data).then((r) => r.data)
export const updateWorkerProfile = (data) => api.patch('/auth/profile/worker/', data).then((r) => r.data)
export const changePassword = (old_password, new_password) =>
  api.post('/auth/password-change/', { old_password, new_password }).then((r) => r.data)

// Products
export const getFarmingProducts = (params) => api.get('/products/farming/', { params }).then((r) => r.data)
export const getFarmingProduct = (id) => api.get(`/products/farming/${id}/`).then((r) => r.data)
export const getFarmerProducts = (params) => api.get('/products/farmer-products/', { params }).then((r) => r.data)
export const getFarmerProduct = (id) => api.get(`/products/farmer-products/${id}/`).then((r) => r.data)
export const createFarmerProduct = (data) => {
  const form = new FormData()
  ;['name', 'description', 'stock', 'price'].forEach((k) => { if (data[k] != null && data[k] !== '') form.append(k, data[k]) })
  if (data.image && data.image instanceof File) form.append('image', data.image)
  return api.post('/products/farmer-products/create/', form, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data)
}

// Cart & Orders
export const getCart = () => api.get('/orders/cart/').then((r) => r.data)
export const addToCart = (farmer_product_id, quantity = 1) =>
  api.post('/orders/cart/', { farmer_product_id, quantity }).then((r) => r.data)
export const updateCartItem = (id, quantity) => api.patch(`/orders/cart/${id}/`, { quantity }).then((r) => r.data)
export const removeFromCart = (id) => api.delete(`/orders/cart/${id}/`)

export const checkout = (paymentMethod) =>
  api.post('/orders/checkout/', { payment_method: paymentMethod }).then((r) => r.data)
export const getUserOrders = () => api.get('/orders/user-orders/').then((r) => r.data)
export const getFpOrders = () => api.get('/orders/fp-orders/').then((r) => r.data)
export const getFarmerProductOrders = () => api.get('/orders/farmer-product-orders/').then((r) => r.data)
export const farmerAcceptOrder = (id) => api.patch(`/orders/farmer-product-orders/${id}/accept/`).then((r) => r.data)
export const farmerShipOrder = (id) => api.patch(`/orders/farmer-product-orders/${id}/ship/`).then((r) => r.data)
export const farmerDeliverOrder = (id) => api.patch(`/orders/farmer-product-orders/${id}/deliver/`).then((r) => r.data)

// Complaints
export const getComplaints = () => api.get('/complaints/').then((r) => r.data)
export const createComplaint = (complaint) => api.post('/complaints/', { complaint }).then((r) => r.data)

// Workers & Work requests
export const getWorkers = (params) => api.get('/workers/', { params }).then((r) => r.data)
export const getWorkRequests = () => api.get('/workers/requests/').then((r) => r.data)
export const createWorkRequest = (body) => api.post('/workers/requests/', body).then((r) => r.data)
export const approveWorkRequest = (id) => api.patch(`/workers/requests/${id}/approve/`)
export const rejectWorkRequest = (id) => api.patch(`/workers/requests/${id}/reject/`)

// Crop recommendation
export const getCropRecommendation = (body) =>
  api.post('/crop-recommendation/', body).then((r) => r.data)

// Admin (staff only)
export const adminGetDashboard = () => api.get('/admin/dashboard/').then((r) => r.data)
export const adminGetFarmers = () => api.get('/admin/farmers/').then((r) => r.data)
export const adminApproveFarmer = (id) => api.patch(`/admin/farmers/${id}/approve/`).then((r) => r.data)
export const adminRejectFarmer = (id) => api.patch(`/admin/farmers/${id}/reject/`).then((r) => r.data)
export const adminGetUsers = () => api.get('/admin/users/').then((r) => r.data)
export const adminApproveUser = (id) => api.patch(`/admin/users/${id}/approve/`).then((r) => r.data)
export const adminUnapproveUser = (id) => api.patch(`/admin/users/${id}/unapprove/`).then((r) => r.data)
export const adminGetWorkers = () => api.get('/admin/workers/').then((r) => r.data)
export const adminApproveWorker = (id) => api.patch(`/admin/workers/${id}/approve/`).then((r) => r.data)
export const adminUnapproveWorker = (id) => api.patch(`/admin/workers/${id}/unapprove/`).then((r) => r.data)
export const adminGetOfficers = () => api.get('/admin/officers/').then((r) => r.data)
export const adminCreateOfficer = (data) => api.post('/admin/officers/', data).then((r) => r.data)
export const adminDeleteOfficer = (id) => api.delete(`/admin/officers/${id}/`)
export const adminGetFarmingProducts = () => api.get('/admin/farming-products/').then((r) => r.data)
export const adminCreateFarmingProduct = (data) => {
  const form = new FormData()
  ;['name', 'description', 'stock', 'price'].forEach((k) => { if (data[k] != null && data[k] !== '') form.append(k, data[k]) })
  if (data.image && data.image instanceof File) form.append('image', data.image)
  return api.post('/admin/farming-products/', form, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data)
}
export const adminGetOrders = () => api.get('/admin/orders/').then((r) => r.data)
export const adminGetFpOrders = () => api.get('/admin/fp-orders/').then((r) => r.data)
export const adminGetComplaints = () => api.get('/admin/complaints/').then((r) => r.data)
export const adminReplyComplaint = (id, reply) => api.patch(`/admin/complaints/${id}/reply/`, { reply }).then((r) => r.data)
export const adminGetSeedRequests = () => api.get('/admin/seed-requests/').then((r) => r.data)
export const adminApproveSeedRequest = (id, adminNotes) => api.patch(`/admin/seed-requests/${id}/approve/`, { admin_notes: adminNotes }).then((r) => r.data)
export const adminRejectSeedRequest = (id, adminNotes) => api.patch(`/admin/seed-requests/${id}/reject/`, { admin_notes: adminNotes }).then((r) => r.data)
export const adminGetStockItems = () => api.get('/admin/stock-items/').then((r) => r.data)
export const adminCreateStockItem = (data) => api.post('/admin/stock-items/', data).then((r) => r.data)
export const adminGetSubsidySchemes = () => api.get('/admin/subsidy-schemes/').then((r) => r.data)
export const adminCreateSubsidyScheme = (data) => api.post('/admin/subsidy-schemes/', data).then((r) => r.data)
export const adminGetSubsidyApplications = () => api.get('/admin/subsidy-applications/').then((r) => r.data)
export const adminApproveSubsidyApplication = (id, adminNotes) => api.patch(`/admin/subsidy-applications/${id}/approve/`, { admin_notes: adminNotes }).then((r) => r.data)
export const adminRejectSubsidyApplication = (id, adminNotes) => api.patch(`/admin/subsidy-applications/${id}/reject/`, { admin_notes: adminNotes }).then((r) => r.data)
export const adminGetCropDiseaseReports = () => api.get('/admin/crop-disease-reports/').then((r) => r.data)
export const adminReplyCropDiseaseReport = (id, adminReply) => api.patch(`/admin/crop-disease-reports/${id}/reply/`, { admin_reply: adminReply }).then((r) => r.data)
export const adminGetNotifications = () => api.get('/admin/notifications/').then((r) => r.data)
export const adminCreateNotification = (data) => api.post('/admin/notifications/', data).then((r) => r.data)

// Seed/fertilizer requests (farmer)
export const getStockItems = () => api.get('/auth/stock-items/').then((r) => r.data)
export const getSeedRequests = () => api.get('/auth/seed-requests/').then((r) => r.data)
export const createSeedRequest = (payload) => api.post('/auth/seed-requests/', payload).then((r) => r.data)

// Subsidy (farmer)
export const getSubsidySchemes = () => api.get('/auth/subsidy-schemes/').then((r) => r.data)
export const getSubsidyApplications = () => api.get('/auth/subsidy-applications/').then((r) => r.data)
export const createSubsidyApplication = (schemeId) => api.post('/auth/subsidy-applications/', { scheme_id: schemeId }).then((r) => r.data)

// Crop disease (farmer)
export const getCropDiseaseReports = () => api.get('/auth/crop-disease-reports/').then((r) => r.data)
export const createCropDiseaseReport = (data) => {
  const form = new FormData()
  form.append('description', data.description)
  if (data.image && data.image instanceof File) form.append('image', data.image)
  return api.post('/auth/crop-disease-reports/', form, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data)
}

// Notifications (farmer)
export const getNotifications = () => api.get('/auth/notifications/').then((r) => r.data)

export default api
