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
  },

  async obtenerProfesoresGestion(busqueda, page = 0, size = 10, verDesactivados = false) {
    const response = await api.get('/profesores/gestion', {
      params: {
        busqueda,
        page,
        size,
        verDesactivados 
      }
    })
    return response.data
  },

  async crearProfesor(datosProfesor) {
    const response = await api.post('/profesores', datosProfesor)
    return response.data
  },
  
  async crearProfesorCompleto(datosProfesorYUsuario) {
    const response = await api.post('/profesores/crear-completo', datosProfesorYUsuario)
    return response.data
  },

  async actualizarProfesor(id, datosProfesor) {
    const response = await api.put(`/profesores/${id}`, datosProfesor)
    return response.data
  },

  async eliminarProfesor(id) {
    await api.delete(`/profesores/${id}`)
  },

  async obtenerProfesoresSinUsuario() {
    const response = await api.get('/profesores/sin-usuario')
    return response.data
  },

  async cambiarEstadoProfesor(id, activo) {
    const response = await api.patch(`/profesores/${id}/estado`, null, {
      params: { activo }
    })
    return response.data
  },

  async asignarUsuario(idProfesor, email, password) {
    const response = await api.post(`/profesores/${idProfesor}/asignar-usuario`, {
      email,
      password
    })
    return response.data
  }
}