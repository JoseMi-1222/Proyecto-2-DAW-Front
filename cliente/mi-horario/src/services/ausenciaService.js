import api from '../axios'; 

export default {
    // Obtener ausencias de un usuario
    obtenerAusencias(idUsuario) {
        return api.get(`/ausencias?idusuario=${idUsuario}`).then(res => res.data);
    },

    // Obtener TODAS las ausencias (Solo Admin)
    obtenerTodasLasAusencias() {
        return api.get('/ausencias/todas').then(res => res.data);
    },

    // NUEVO: Subir archivo y recibir el nombre generado por el backend
    subirArchivo(file) {
        const formData = new FormData();
        formData.append("file", file);
        return api.post('/ausencias/upload-archivo', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        }).then(res => res.data);
    },

    // Crear una nueva ausencia (datosAusencia ya incluirá el nombre del archivo adjunto si lo hay)
    crearAusencia(datosAusencia) {
        return api.post('/ausencias', datosAusencia).then(res => res.data);
    },

    // Eliminar ausencia (por ID o por Fecha)
    eliminarAusencia(id = null, fecha = null, idProfesor = null) {
        const payload = {};
        if (id) payload.id = id;
        if (fecha) {
            payload.fecha = new Date(fecha).toISOString().split('T')[0];
            if (idProfesor) payload.idProfesor = idProfesor;
        }

        return api.delete('/ausencias', { data: payload }).then(res => res.data);
    },

    // Justificar ausencias de un día entero
    justificarDia(fecha, idProfesor) {
        const payload = {
            fecha: new Date(fecha).toISOString().split('T')[0],
            idProfesor: idProfesor
        };
        return api.patch('/ausencias/justificar-dia', payload).then(res => res.data);
    }
};