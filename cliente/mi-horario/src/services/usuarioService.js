import api from '../axios'

function arrayBufferToDataUrl(arrayBuffer, contentType) {
  const tipo = contentType || 'image/jpeg'
  const base64 = btoa(
    new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
  )
  return `data:${tipo};base64,${base64}`
}

export default {
  async obtenerImagenDataUrl(idUsuario) {
    if (!idUsuario) return null

    const response = await api.get(`/usuarios/${idUsuario}/imagen`, {
      responseType: 'arraybuffer',
      validateStatus: status => status === 200
    })

    const contentType = response.headers?.['content-type']
    return arrayBufferToDataUrl(response.data, contentType)
  },

  async subirImagen(idUsuario, formData) {
    const response = await api.post(`/usuarios/${idUsuario}/imagen`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },

  async cambiarContrasena(idUsuario, contrasenaActual, nuevaContrasena) {
    const payload = {
      contrasenaActual: contrasenaActual,
      nuevaContrasena: nuevaContrasena    
    }
    
    const response = await api.put(`/usuarios/${idUsuario}/cambiar-contrasena`, payload)
    return response.data
  },

  async crearConProfesor(idProfesor, payload) {
    const response = await api.post(`/usuarios/crear-con-profesor/${idProfesor}`, payload)
    return response.data
  },

  async actualizar(idUsuario, payload) {
    const response = await api.put(`/usuarios/${idUsuario}`, payload)
    return response.data
  },

  async eliminar(idUsuario) {
    const response = await api.delete(`/usuarios/${idUsuario}`)
    return response.data
  }
}