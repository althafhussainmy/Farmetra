import toast from 'react-hot-toast'

const base = {
  style: {
    borderRadius: '12px',
    padding: '12px 14px',
    boxShadow: '0 12px 30px rgba(0,0,0,0.12)',
  },
}

export const showSuccess = (message) =>
  toast.success(message, {
    ...base,
    iconTheme: { primary: '#2e7d32', secondary: '#ffffff' },
  })

export const showError = (message) =>
  toast.error(message, {
    ...base,
    iconTheme: { primary: '#dc2626', secondary: '#ffffff' },
  })

export const showLoading = (message) =>
  toast.loading(message, {
    ...base,
  })

export default toast
