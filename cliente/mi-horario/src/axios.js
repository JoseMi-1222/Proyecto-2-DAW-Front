import axios from 'axios'

export const publicApi = axios.create({
  baseURL: 'http://localhost:8081/api'
})

const api = axios.create({
  baseURL: 'http://localhost:8081/api'
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api
