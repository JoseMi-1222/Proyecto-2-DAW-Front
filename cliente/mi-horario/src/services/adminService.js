import api from '../axios'

export default {
  async importarHorariosDesdeBase64(base64File) {
    const response = await api.post(
      '/horarios/importacion',
      { file: base64File },
      { headers: { 'Content-Type': 'application/json' } }
    )
    return response.data
  },

  async generarParteAusencias() {
    const response = await api.get('/parte-ausencias')
    return response.data
  }
}
