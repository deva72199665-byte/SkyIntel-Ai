import axios from 'axios'

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api/v1', timeout: 15000 })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('rain_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('rain_token')
      localStorage.removeItem('rain_user')
      window.dispatchEvent(new Event('rain:unauthorized'))
    }
    return Promise.reject(error)
  },
)

export const errorMessage = error => error.response?.data?.detail || error.message || 'Something went wrong. Please try again.'

export default api
