import { defineStore } from 'pinia'
import authService from '../services/authService'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || null,
    logueado: localStorage.getItem('logueado') === 'true',
    usuario: JSON.parse(localStorage.getItem('usuario')) || null
  }),

  actions: {
    async login(username, password) {
      try {
        const data = await authService.login(username, password)
    
        console.log('📨 Token recibido:', data.token)
        console.log('👤 Usuario recibido:', data.usuario)
    
        this.token = data.token
        this.usuario = data.usuario
        this.logueado = true
    
        localStorage.setItem('token', this.token)
        localStorage.setItem('usuario', JSON.stringify(this.usuario))
        localStorage.setItem('logueado', 'true')
    
        return true
      } catch (error) {
        console.error(' Error en login:', error)
        console.log('⚠️ error.response:', error.response)
        console.log('📩 error.response.data:', error.response?.data)
    
        return false
      }
    }
    ,

    logout() {
      this.token = null
      this.usuario = null
      this.logueado = false

      localStorage.removeItem('token')
      localStorage.removeItem('usuario')
      localStorage.removeItem('logueado')
    }
  }
})
