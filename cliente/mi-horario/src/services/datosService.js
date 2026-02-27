import api from '../axios'; 

export default {
    importarDatos(archivo) {
        const formData = new FormData();
        formData.append('file', archivo);

        return api.post('/datos/importar', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    },

    exportarJson() {
        return api.get('/datos/exportar/json', {
            responseType: 'blob'
        });
    },

    exportarTxt() {
        return api.get('/datos/exportar/txt', {
            responseType: 'blob'
        });
    }
};