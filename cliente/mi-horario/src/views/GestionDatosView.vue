<template>
  <MenuLateral />
  
  <div class="contenedor-datos">
    <div class="card shadow-lg border-0 rounded-3">
      
      <div class="card-header bg-dark text-white py-3 px-4 d-flex justify-content-between align-items-center">
        <h4 class="mb-0 fw-bold"><i class="bi bi-hdd-network me-2"></i>Centro de Datos</h4>
        <span class="badge bg-secondary">v1.0</span>
      </div>
      
      <div class="card-body p-5">
        
        <div class="row g-5">
          
          <div class="col-lg-6 border-end-lg">
            <div class="d-flex align-items-center mb-4">
              <div class="icon-box bg-primary bg-opacity-10 text-primary me-3">
                <i class="bi bi-cloud-arrow-up fs-3"></i>
              </div>
              <div>
                <h5 class="fw-bold mb-0 text-primary">Importar Datos</h5>
                <small class="text-muted">Actualiza la base de datos desde un archivo</small>
              </div>
            </div>

            <div 
              class="upload-zone p-5 text-center border rounded-3 bg-light position-relative" 
              :class="{'border-primary bg-white shadow-sm': dragging, 'border-success bg-success bg-opacity-10': archivo}"
              @dragover.prevent="dragging = true" 
              @dragleave.prevent="dragging = false"
              @drop.prevent="soltarArchivo"
            >
              
              <div v-if="!archivo">
                <i class="bi bi-file-earmark-arrow-up text-muted display-4 mb-3 d-block"></i>
                <p class="mb-3 text-muted">Arrastra tu archivo <strong>.txt</strong> o <strong>.json</strong> aquí</p>
                <button class="btn btn-outline-primary btn-sm rounded-pill px-4" @click="$refs.fileInput.click()">
                  Buscar en el equipo
                </button>
              </div>

              <div v-else class="text-start">
                <div class="d-flex align-items-center justify-content-between p-3 bg-white rounded shadow-sm border">
                  <div class="d-flex align-items-center">
                    <i class="bi fs-1 me-3" :class="iconoArchivo"></i>
                    <div>
                      <h6 class="mb-0 fw-bold text-truncate" style="max-width: 200px;">{{ archivo.name }}</h6>
                      <small class="text-muted">{{ (archivo.size / 1024).toFixed(1) }} KB</small>
                    </div>
                  </div>
                  <button class="btn-close" @click="archivo = null"></button>
                </div>
                
                <div class="mt-3 text-center">
                  <span class="badge mb-2" :class="esJson ? 'bg-warning text-dark' : 'bg-info text-white'">
                    {{ esJson ? 'MODO RESTAURACIÓN' : 'MODO CARGA INICIAL' }}
                  </span>
                </div>
              </div>

              <input type="file" ref="fileInput" class="d-none" @change="seleccionarArchivo" accept=".json,.txt">
            </div>

            <div class="d-grid mt-4">
              <button class="btn btn-primary btn-lg shadow-sm" @click="pedirConfirmacion" :disabled="!archivo || cargando">
                <span v-if="cargando" class="spinner-border spinner-border-sm me-2"></span>
                {{ textoBotonImportar }}
              </button>
            </div>
          </div>

          <div class="col-lg-6 ps-lg-5">
            <div class="d-flex align-items-center mb-4">
              <div class="icon-box bg-success bg-opacity-10 text-success me-3">
                <i class="bi bi-cloud-arrow-down fs-3"></i>
              </div>
              <div>
                <h5 class="fw-bold mb-0 text-success">Exportar Datos</h5>
                <small class="text-muted">Descarga copias de seguridad o informes</small>
              </div>
            </div>

            <div class="card mb-4 border-0 shadow-sm hover-card">
              <div class="card-body p-4 d-flex align-items-center">
                <div class="me-3 p-3 rounded-circle bg-warning bg-opacity-25 text-warning">
                  <i class="bi bi-database-fill-lock fs-4"></i>
                </div>
                <div class="flex-grow-1">
                  <h6 class="fw-bold mb-1">Copia Completa (JSON)</h6>
                  <p class="text-muted small mb-0 lh-sm">
                    Incluye usuarios, contraseñas, horarios y asignaturas. Ideal para migrar a otro PC.
                  </p>
                </div>
                <button class="btn btn-light rounded-circle border shadow-sm" @click="descargarJson" :disabled="descargando" title="Descargar">
                  <i class="bi bi-download text-dark"></i>
                </button>
              </div>
            </div>

            <div class="card border-0 shadow-sm hover-card">
              <div class="card-body p-4 d-flex align-items-center">
                <div class="me-3 p-3 rounded-circle bg-info bg-opacity-10 text-info">
                  <i class="bi bi-file-text-fill fs-4"></i>
                </div>
                <div class="flex-grow-1">
                  <h6 class="fw-bold mb-1">Horario Oficial (TXT)</h6>
                  <p class="text-muted small mb-0 lh-sm">
                    Archivo de texto plano compatible con el formato del instituto (Séneca/Otros).
                  </p>
                </div>
                <button class="btn btn-light rounded-circle border shadow-sm" @click="descargarTxt" :disabled="descargando" title="Descargar">
                  <i class="bi bi-download text-dark"></i>
                </button>
              </div>
            </div>

          </div>
        </div> 
      </div>
    </div>
  </div>

  <ModalConfirmacion 
    :visible="mostrarConfirmacion"
    :mensaje="textoConfirmacion"
    @cerrar="mostrarConfirmacion = false"
    @confirmar="ejecutarImportacion"
  />

  <ModalMensaje 
    :visible="mostrarMensaje"
    :titulo="tituloMensaje"
    :mensaje="textoMensaje"
    :tipo="tipoMensaje"
    @cerrar="cerrarModalMensaje"
  />

</template>

<script setup>
import { ref, computed } from 'vue'
import datosService from '../services/datosService'
import MenuLateral from '../components/MenuLateral.vue'
import ModalConfirmacion from '../components/ModalConfirmacion.vue' // Tu modal nuevo
import ModalMensaje from '../components/ModalMensaje.vue' // El modal de info que usas en MenuLateral

// Estado básico
const archivo = ref(null)
const cargando = ref(false)
const descargando = ref(false)
const dragging = ref(false)

// Estado Modales
const mostrarConfirmacion = ref(false)
const textoConfirmacion = ref('')

const mostrarMensaje = ref(false)
const tituloMensaje = ref('')
const textoMensaje = ref('')
const tipoMensaje = ref('info')

// Computados
const esJson = computed(() => archivo.value?.name.toLowerCase().endsWith('.json'))
const iconoArchivo = computed(() => esJson.value ? 'bi-filetype-json text-warning' : 'bi-filetype-txt text-info')

const textoBotonImportar = computed(() => {
  if (cargando.value) return 'Procesando...'
  if (!archivo.value) return 'Seleccionar Archivo'
  return esJson.value ? 'Restaurar Copia de Seguridad' : 'Cargar Horarios Iniciales'
})

// --- MÉTODOS DE ARCHIVOS ---
const seleccionarArchivo = (e) => {
  if (e.target.files.length) archivo.value = e.target.files[0]
}

const soltarArchivo = (e) => {
  dragging.value = false
  if (e.dataTransfer.files.length) archivo.value = e.dataTransfer.files[0]
}

// 1. PRIMER PASO: Pedir confirmación con tu modal
const pedirConfirmacion = () => {
  if (!archivo.value) return

  if (esJson.value) {
    textoConfirmacion.value = "Vas a restaurar una copia de seguridad. Se borrarán todos los datos actuales y se reemplazarán por los de la copia."
  } else {
    textoConfirmacion.value = "Vas a cargar un horario inicial (TXT). Esto borrará los horarios actuales para generar los nuevos."
  }
  
  mostrarConfirmacion.value = true
}

// 2. SEGUNDO PASO: Ejecutar importación real (llamado desde el @confirmar del modal)
const ejecutarImportacion = async () => {
  mostrarConfirmacion.value = false // Cerramos el modal de pregunta
  cargando.value = true
  
  try {
    const res = await datosService.importarDatos(archivo.value)
    
    // Mostramos éxito con el ModalMensaje en vez de alert
    mostrarNotificacion('Importación Exitosa', res.data, 'success')
    
    // Pequeño delay para que lean el mensaje antes de recargar
    setTimeout(() => {
        window.location.reload()
    }, 2000)

  } catch (error) {
    console.error(error)
    const msg = error.response?.data || "Error desconocido al conectar con el servidor"
    mostrarNotificacion('Error', msg, 'error')
  } finally {
    cargando.value = false
    archivo.value = null
  }
}

// Helpers para exportación
const descargarArchivo = async (metodoServicio, nombreDefault, extension) => {
  descargando.value = true
  try {
    const response = await metodoServicio()
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    const fecha = new Date().toISOString().slice(0, 10)
    link.setAttribute('download', `${nombreDefault}_${fecha}.${extension}`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (e) {
    console.error(e)
    mostrarNotificacion('Error', 'Error al descargar el archivo.', 'error')
  } finally {
    descargando.value = false
  }
}

const descargarJson = () => descargarArchivo(datosService.exportarJson, 'backup_completo', 'json')
const descargarTxt = () => descargarArchivo(datosService.exportarTxt, 'horario_instituto', 'txt')

// --- LÓGICA MODAL MENSAJES (ÉXITO/ERROR) ---
const mostrarNotificacion = (titulo, mensaje, tipo) => {
  tituloMensaje.value = titulo
  textoMensaje.value = mensaje
  tipoMensaje.value = tipo
  mostrarMensaje.value = true
}

const cerrarModalMensaje = () => {
  mostrarMensaje.value = false
}
</script>

<style scoped>
.contenedor-datos {
  margin-left: 250px;
  padding: 40px;
  margin-top: 60px;
}

.upload-zone {
  border: 2px dashed #dee2e6;
  transition: all 0.3s ease;
  cursor: pointer;
  min-height: 250px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.upload-zone:hover {
  border-color: #0d6efd;
  background-color: #f8f9fa;
}

.icon-box {
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
}

.hover-card {
  transition: transform 0.2s, box-shadow 0.2s;
}

.hover-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 .5rem 1rem rgba(0,0,0,.15)!important;
}

@media (max-width: 768px) {
  .contenedor-datos {
    margin-left: 0;
    padding: 20px;
  }
  .border-end-lg {
    border-right: 0 !important;
    border-bottom: 1px solid #dee2e6;
    padding-bottom: 2rem;
    margin-bottom: 2rem;
  }
}
</style>