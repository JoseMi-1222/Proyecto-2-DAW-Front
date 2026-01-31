import api from '../axios'

export default {
  async obtenerProfesores() {
    const response = await api.get('/profesores')
    return response.data
  },

  async buscarProfesoresPorNombre(nombre) {
    const response = await api.get('/profesores/buscar', {
      params: { nombre }
    })
    return response.data
  },

  async obtenerProfesor(idProfesor) {
    const response = await api.get(`/profesores/${idProfesor}`)
    return response.data
  },

  async obtenerProfesorPorEmailUsuario(email) {
    const response = await api.get(`/profesores/usuario/${email}`)
    return response.data
  }
}
