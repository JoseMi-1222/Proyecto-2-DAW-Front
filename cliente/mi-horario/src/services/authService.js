import { publicApi } from '../axios'

export default {
  async login(username, password) {
    const response = await publicApi.post('/login', { username, password })
    return response.data
  },

  async recuperarPassword(correoRecuperacion) {
    const response = await publicApi.post('/recuperacion-password', { correoRecuperacion })
    return response.data
  }
}
