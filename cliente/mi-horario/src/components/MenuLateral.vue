<template>
  <nav class="navbar navbar-dark bg-dark fixed-top px-3 shadow-sm" style="height: 60px; z-index: 9999;">
    <div class="d-flex align-items-center gap-3">
      
      <button 
        class="btn border-0 p-0 d-flex align-items-center justify-content-center" 
        type="button" 
        @click="abrirMenuLateral"
        :title="$t('menu.open')"
        style="width: 40px; height: 40px;"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="white" viewBox="0 0 16 16">
          <path fill-rule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z"/>
        </svg>
      </button>

      <a class="navbar-brand d-flex align-items-center m-0" href="#">
        <span class="fw-normal text-white">{{ $t('menu.brand') }}</span>
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
        <span class="d-none d-sm-inline ms-2">{{ auth.usuario?.nombre || $t('common.user') }}</span>
      </button>
      
      <ul 
        class="dropdown-menu dropdown-menu-end dropdown-menu-dark shadow" 
        :class="{ 'show': dropdownAbierto }"
        style="position: absolute; right: 0; top: 100%; margin-top: 5px;"
      >
        <li><button class="dropdown-item" @click="navegar('/perfil')">{{ $t('menu.perfil') }}</button></li>
        <li><hr class="dropdown-divider"></li>
        <li><button class="dropdown-item text-danger" @click="logout">{{ $t('menu.logout') }}</button></li>
      </ul>
    </div>
  </nav>

  <div 
    class="offcanvas offcanvas-start text-bg-dark" 
    tabindex="-1" 
    id="sidePanel" 
    data-bs-backdrop="true"
    style="z-index: 10000;"
  >
    <div class="offcanvas-header border-bottom border-secondary">
      <h5 class="offcanvas-title">{{ $t('menu.titulo') }}</h5>
      <button type="button" class="btn-close btn-close-white" data-bs-dismiss="offcanvas"></button>
    </div>
    
    <div class="offcanvas-body">
      <div class="d-flex flex-column h-100">
        
        <div class="mb-4">
          <small class="text-muted text-uppercase fw-bold ms-2 mb-2 d-block">{{ $t('menu.languageLabel') }}</small>
          <div class="d-flex gap-2 px-2">
            <button 
              @click="cambiarIdioma('es')" 
              class="btn btn-sm flex-fill d-flex align-items-center justify-content-center gap-2"
              :class="locale === 'es' ? 'btn-primary' : 'btn-outline-secondary text-white'"
            >
              {{ $t('menu.idioma.es') }}
            </button>
            <button 
              @click="cambiarIdioma('en')" 
              class="btn btn-sm flex-fill d-flex align-items-center justify-content-center gap-2"
              :class="locale === 'en' ? 'btn-primary' : 'btn-outline-secondary text-white'"
            >
              {{ $t('menu.idioma.en') }}
            </button>
          </div>
        </div>

        <div class="d-flex flex-column gap-2 flex-grow-1">
          <button class="btn btn-menu text-start" @click="navegar('/home')">
            <span class="me-2">🏠</span> {{ $t('menu.inicio') }}
          </button>

          <button 
            v-if="!esAdmin" 
            class="btn btn-menu text-start" 
            @click="navegar('/mis-ausencias')"
          >
            <span class="me-2">📅</span> {{ $t('menu.mis_ausencias') }}
          </button>

          <div v-if="esAdmin" class="mt-3 border-top border-secondary pt-3">
             <small class="text-muted text-uppercase fw-bold ms-2 mb-2 d-block">{{ $t('menu.administration') }}</small>

             <button class="btn btn-menu text-start text-danger fw-bold bg-danger bg-opacity-10" @click="navegar('/guardias')">
               <span class="me-2">🚨</span> {{ $t('menu.guardias') }}
             </button>
             
             <button class="btn btn-menu text-start text-warning" @click="navegar('/admin/ausencias')">
               <span class="me-2">🛡️</span> {{ $t('menu.gestion_ausencias') }}
             </button>

             <button class="btn btn-menu text-start" @click="navegar('/datos-profesorado')">
               <span class="me-2">👨‍🏫</span> {{ $t('menu.profesores') }}
             </button>
             
             <button class="btn btn-menu text-start" @click="navegar('/gestion-datos')">
               <span class="me-2">💾</span> {{ $t('menu.datos') }}
             </button>
          </div>
        </div>

      </div>
    </div>
  </div>

  <div v-if="cargando" class="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-dark bg-opacity-75" style="z-index: 2000">
    <div class="text-center text-white">
      <div class="spinner-border text-light" role="status"></div>
      <p class="mt-3 fw-bold">{{ $t('common.processing') }}</p>
    </div>
  </div>

  <modalmensaje :visible="modalVisible" :titulo="modalTitulo" :mensaje="modalMensaje" :tipo="modalTipo" @cerrar="cerrarModal" />
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { Offcanvas } from 'bootstrap'
import modalmensaje from '../components/ModalMensaje.vue'
import { useI18n } from 'vue-i18n' // 👈 Importamos i18n

const router = useRouter()
const auth = useAuthStore()
const { locale } = useI18n() // 👈 Extraemos el locale actual

let bsOffcanvas = null
const dropdownAbierto = ref(false)
const cargando = ref(false)

const modalVisible = ref(false)
const modalTitulo = ref('')
const modalMensaje = ref('')
const modalTipo = ref('info')

const esAdmin = computed(() => {
  const rol = auth.usuario?.rol || ''
  return rol.toUpperCase() === 'ADMINISTRADOR' || rol.toUpperCase() === 'ROLE_ADMINISTRADOR'
})

onMounted(() => {
  // Cargar idioma guardado
  const savedLang = localStorage.getItem('lang')
  if (savedLang) {
    locale.value = savedLang
  }

  const sidebarEl = document.getElementById('sidePanel')
  if(sidebarEl) {
    bsOffcanvas = new Offcanvas(sidebarEl)
  }
  document.addEventListener('click', cerrarDropdownAlClickeoFuera)
})

onUnmounted(() => {
  document.removeEventListener('click', cerrarDropdownAlClickeoFuera)
})

// Función para cambiar idioma
function cambiarIdioma(lang) {
  locale.value = lang
  localStorage.setItem('lang', lang)
}

function abrirMenuLateral() {
  if(bsOffcanvas) bsOffcanvas.show()
}

function navegar(ruta) {
  if(bsOffcanvas) bsOffcanvas.hide()
  dropdownAbierto.value = false
  setTimeout(() => {
    router.push(ruta)
  }, 300)
}

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
  text-align: left;
}
.btn-menu:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
}
.text-warning {
  color: #ffc107 !important;
}

/* Estilo para los botones de idioma */
.btn-outline-secondary:hover {
  background-color: rgba(255, 255, 255, 0.2);
}
</style>