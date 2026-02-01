import api from '../axios'; 

export default {
    obtenerHorarios(idProfesor = null) {
        const params = {}
        if (idProfesor) params.idProfesor = idProfesor
        return api.get('/horarios', { params }).then(res => res.data);
    },
    
    obtenerHorarioProfesor(idProfesor) {
        return api.get(`/horarios/profesor/${idProfesor}`).then(res => res.data);
    },

    guardarHorario(idProfesor, horarios) {
        return api.post(`/horarios/profesor/${idProfesor}`, horarios).then(res => res.data);
    },

    obtenerAsignaturas() {
        return api.get('/horarios/asignaturas').then(res => res.data);
    },

    obtenerCursos() {
        return api.get('/horarios/cursos').then(res => res.data);
    },
    
    obtenerIdProfesorPorEmail(email) {
        return api.get(`/profesores/usuario/${email}`).then(res => res.data);
    }
};