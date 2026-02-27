import api from '../axios'; 

export default {
    obtenerAusencias(idUsuario) {
        return api.get(`/ausencias?idusuario=${idUsuario}`).then(res => res.data);
    },

    obtenerTodasLasAusencias() {
        return api.get('/ausencias/todas').then(res => res.data);
    },

    subirArchivo(file) {
        const formData = new FormData();
        formData.append("file", file);
        return api.post('/ausencias/upload-archivo', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        }).then(res => res.data);
    },

    crearAusencia(datosAusencia) {
        return api.post('/ausencias', datosAusencia).then(res => res.data);
    },

    eliminarAusencia(id = null, fecha = null, idProfesor = null) {
        const payload = {};
        if (id) payload.id = id;
        if (fecha) {
            payload.fecha = new Date(fecha).toISOString().split('T')[0];
            if (idProfesor) payload.idProfesor = idProfesor;
        }

        return api.delete('/ausencias', { data: payload }).then(res => res.data);
    },

    justificarDia(fecha, idProfesor, justificante = null) {
        const payload = {
            fecha: new Date(fecha).toISOString().split('T')[0],
            idProfesor: idProfesor
        };
        
        if (justificante) {
            payload.justificante = justificante;
        }
        
        return api.patch('/ausencias/justificar-dia', payload).then(res => res.data);
    }
};