import api from '../axios'; 

export default {
    // Subir archivo (Importar)
    importarDatos(archivo) {
        const formData = new FormData();
        formData.append('file', archivo);

        return api.post('/datos/importar', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    },

    // Descargar JSON (Exportar Backup)
    exportarJson() {
        return api.get('/datos/exportar/json', {
            responseType: 'blob' // Importante para que el navegador sepa que es un archivo
        });
    },

    // Descargar TXT (Exportar Horario)
    exportarTxt() {
        return api.get('/datos/exportar/txt', {
            responseType: 'blob' // Importante para que el navegador sepa que es un archivo
        });
    }
};