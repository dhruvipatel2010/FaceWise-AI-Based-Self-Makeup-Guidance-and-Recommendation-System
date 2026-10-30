import axios from 'axios'

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = 'Bearer ' + token
  return config
})

export function errorMessage(err) {
  if (!err.response) return 'Cannot reach the server. Is the backend running?'
  const detail = err.response.data?.detail
  if (typeof detail === 'string') return detail
  if (err.response.status === 422) return 'Please check your details. Password needs 8 or more characters.'
  return 'Something went wrong on the server. Please try again.'
}

export default api
