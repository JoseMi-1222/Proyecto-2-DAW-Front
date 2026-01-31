<template>
  <nav class="navbar navbar-dark bg-dark fixed-top px-3 shadow-sm" style="height: 60px; z-index: 9999;">
    <div class="d-flex align-items-center gap-3">
      
      <button 
        class="btn border-0 p-0 d-flex align-items-center justify-content-center" 
        type="button" 
        @click="abrirMenuLateral"
        title="Abrir menú"
        style="width: 40px; height: 40px;"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="white" viewBox="0 0 16 16">
          <path fill-rule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z"/>
        </svg>
      </button>

      <a class="navbar-brand d-flex align-items-center m-0" href="#">
        <span class="fw-normal text-white">Horario IES Polígono Sur</span>
      </a>
    </div>

    <div class="dropdown position-relative">
      <button 
        class="btn btn-dark dropdown-toggle d-flex align-items-center gap-2 text-white border-0" 
        type="button" 
        @click.stop="toggleUsuarioDropdown"
      >
        <div class="bg-light text-dark rounded-circle d-flex justify-content-center align-items-center" style="width: 32px; height: 32px;">
             <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
        </div>
        <span class="d-none d-sm-inline ms-2">{{ auth.usuario?.nombre || 'Usuario' }}</span>
      </button>
      
      <ul 
        class="dropdown-menu dropdown-menu-end dropdown-menu-dark shadow" 
        :class="{ 'show': dropdownAbierto }"
        style="position: absolute; right: 0; top: 100%; margin-top: 5px;"
      >
        <li><button class="dropdown-item" @click="navegar('/perfil')">Mi Perfil</button></li>
        <li><hr class="dropdown-divider"></li>
        <li><button class="dropdown-item text-danger" @click="logout">Cerrar Sesión</button></li>
      </ul>
    </div>
  </nav>

  <div v-if="cargando"
    class="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-dark bg-opacity-75"
    style="z-index: 2000">
    <div class="text-center text-white">
      <div class="spinner-border text-light" role="status"></div>
      <p class="mt-3 fw-bold">Procesando...</p>
    </div>
  </div>

  <div 
    class="offcanvas offcanvas-start text-bg-dark" 
    tabindex="-1" 
    id="sidePanel" 
    data-bs-backdrop="true"
    style="z-index: 10000;"
  >
    <div class="offcanvas-header border-bottom border-secondary">
      <h5 class="offcanvas-title">Menú de Gestión</h5>
      <button type="button" class="btn-close btn-close-white" data-bs-dismiss="offcanvas"></button>
    </div>
    
    <div class="offcanvas-body">
      <div class="d-flex flex-column gap-2">
        
        <input ref="fileInput" type="file" @change="subirArchivoSelec" style="display: none" />

        <button class="btn btn-menu text-start" @click="navegar('/home')">
          <span class="me-2">🏠</span> Inicio
        </button>

        <button class="btn btn-menu text-start" @click="navegar('/mis-ausencias')">
          <span class="me-2">📅</span> Ausencias
        </button>

        <div v-if="auth.usuario?.rol === 'administrador'" class="mt-3 border-top border-secondary pt-3">
           <small class="text-muted text-uppercase fw-bold ms-2 mb-2 d-block">Administración</small>
           
           <button class="btn btn-menu text-start" @click="abrirArchivoSelec">
             <span class="me-2">📤</span> Subir archivo de datos
           </button>

           <button class="btn btn-menu text-start" @click="navegar('/datos-profesorado')">
             <span class="me-2">👨‍🏫</span> Datos profesorado
           </button>

           <button class="btn btn-menu text-start" @click="generarParteDiario">
             <span class="me-2">📄</span> Generar partes diario
           </button>
        </div>

      </div>
    </div>
  </div>

  <modalmensaje 
    :visible="modalVisible" 
    :titulo="modalTitulo" 
    :mensaje="modalMensaje" 
    :tipo="modalTipo"
    @cerrar="cerrarModal" 
  />
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import adminService from '../services/adminService'
import { Offcanvas } from 'bootstrap'
import modalmensaje from '../components/ModalMensaje.vue' // Recuperamos el modal

const router = useRouter()
const auth = useAuthStore()

// --- ESTADO ---
let bsOffcanvas = null
const dropdownAbierto = ref(false)
const cargando = ref(false)
const fileInput = ref(null)

// Variables Modal
const modalVisible = ref(false)
const modalTitulo = ref('')
const modalMensaje = ref('')
const modalTipo = ref('info')

onMounted(() => {
  // Inicializar Menú Lateral
  const sidebarEl = document.getElementById('sidePanel')
  if(sidebarEl) {
    bsOffcanvas = new Offcanvas(sidebarEl)
  }
  
  // Evento para cerrar dropdown al clicar fuera
  document.addEventListener('click', cerrarDropdownAlClickeoFuera)

  // Verificar mensajes pendientes tras recarga
  if (localStorage.getItem('mostrarModalImportacion') === '1') {
    mostrarModal('Importación exitosa', 'Archivo importado correctamente.', 'success')
    localStorage.removeItem('mostrarModalImportacion')
  }
})

onUnmounted(() => {
  document.removeEventListener('click', cerrarDropdownAlClickeoFuera)
})

// --- FUNCIONES MENÚ LATERAL ---
function abrirMenuLateral() {
  if(bsOffcanvas) bsOffcanvas.show()
}

function navegar(ruta) {
  if(bsOffcanvas) bsOffcanvas.hide()
  dropdownAbierto.value = false
  setTimeout(() => {
    router.push(ruta)
  }, 350)
}

// --- FUNCIONES MENÚ USUARIO ---
function toggleUsuarioDropdown() {
  dropdownAbierto.value = !dropdownAbierto.value
}

function cerrarDropdownAlClickeoFuera(event) {
  const dropdownEl = document.querySelector('.dropdown')
  if (dropdownEl && !dropdownEl.contains(event.target)) {
    dropdownAbierto.value = false
  }
}

function logout() {
  auth.logout()
  router.push('/login')
}

// --- LÓGICA DE ADMINISTRADOR (RECUPERADA) ---

function abrirArchivoSelec() {
  // Cerramos el menú para que se vea el diálogo de archivo
  if(bsOffcanvas) bsOffcanvas.hide()
  if (fileInput.value) {
    fileInput.value.value = ''
    fileInput.value.click()
  }
}

function subirArchivoSelec(event) {
  const file = event.target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = async () => {
    const base64File = reader.result.split(',')[1]
    cargando.value = true

    try {
      await adminService.importarHorariosDesdeBase64(base64File)
      mostrarModal('Importación exitosa', 'Datos importados correctamente', 'success')
    } catch (error) {
      console.error(error)
      mostrarModal('Error', 'Error al importar el archivo.', 'error')
    } finally {
      cargando.value = false
    }
  }
  reader.readAsDataURL(file)
}

async function generarParteDiario() {
  if(bsOffcanvas) bsOffcanvas.hide()
  cargando.value = true
  
  try {
    const base64PDF = await adminService.generarParteAusencias()
    const byteCharacters = atob(base64PDF)
    const byteNumbers = new Array(byteCharacters.length).fill(0).map((_, i) => byteCharacters.charCodeAt(i))
    const byteArray = new Uint8Array(byteNumbers)
    const blob = new Blob([byteArray], { type: 'application/pdf' })

    const fecha = new Date()
    const nombreArchivo = `parte-${fecha.getDate()}-${fecha.getMonth() + 1}.pdf`
    
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = nombreArchivo
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } catch (error) {
    console.error(error)
    mostrarModal('Error', 'No se pudo generar el parte.', 'error')
  } finally {
    cargando.value = false
  }
}

// --- FUNCIONES MODAL ---
function mostrarModal(titulo, mensaje, tipo = 'info') {
  modalTitulo.value = titulo
  modalMensaje.value = mensaje
  modalTipo.value = tipo
  modalVisible.value = true
}

function cerrarModal() {
  modalVisible.value = false
}
</script>

<style scoped>
.btn-menu {
  color: #e0e0e0;
  background-color: transparent;
  border: none;
  padding: 10px 15px;
  width: 100%;
  border-radius: 5px;
  transition: background 0.2s;
  text-align: left; /* Asegura alineación a la izquierda */
}
.btn-menu:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
}
</style>