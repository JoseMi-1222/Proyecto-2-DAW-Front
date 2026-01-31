import api from '../axios'; 

export default {
    obtenerHorarios(idProfesor = null) {
        const params = {}
        if (idProfesor) params.idProfesor = idProfesor
        return api.get('/horarios', { params }).then(res => res.data);
    },
    
    obtenerHorarioProfesor(idProfesor) {
        return api.get(`/horarios?idProfesor=${idProfesor}`).then(res => res.data);
    },

    obtenerIdProfesorPorEmail(email) {
        return api.get(`/profesores/usuario/${email}`).then(res => res.data);
    }
};