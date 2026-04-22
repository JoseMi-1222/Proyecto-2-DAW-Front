<template>
  <MenuLateral />
  <ModalCambioContraseña :visible="mostrarModalPassword" @cerrar="mostrarModalPassword = false" />

  <div class="container-fluid mx-4" style="margin-top: 100px; max-width: 95%;">
    
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2 class="text-primary fw-bold">
        <i class="bi bi-calendar-week me-2"></i>
        {{ esAdmin ? $t('home.adminTitle') : $t('home.teacherTitle') }}
      </h2>
      
      <div v-if="!esAdmin && auth.usuario" class="text-muted d-none d-md-block">
        {{ $t('home.greeting') }}, <strong>{{ auth.usuario.nombre }}</strong>
      </div>
    </div>

    <div v-if="esAdmin" class="card shadow-sm p-4 mb-4 bg-white border-0">
      <div class="row align-items-center">
        <div class="col-md-5">
          <label class="form-label fw-bold text-secondary small text-uppercase">{{ $t('home.searchTeacher') }}</label>
          
          <div class="position-relative">
            <div class="input-group">
              <span class="input-group-text bg-light border-end-0">
                <i class="bi bi-search text-muted"></i>
              </span>
              <input 
                type="text" 
                class="form-control border-start-0 ps-0" 
                :placeholder="$t('home.searchPlaceholder')" 
                v-model="busquedaProfesor"
                @focus="mostrarLista = true"
                @input="mostrarLista = true"
                @keydown.down.prevent="mostrarLista = true"
                autocomplete="off"
              >
              <button
                class="btn btn-outline-secondary border-start-0"
                type="button"
                @click="mostrarLista = !mostrarLista"
                :aria-expanded="mostrarLista"
                :title="$t('home.showTeacherList')"
              >
                <i class="bi" :class="mostrarLista ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
              </button>
              <button v-if="idProfesorSeleccionado" class="btn btn-outline-secondary border-start-0" @click="limpiarSeleccion">
                <i class="bi bi-x-lg"></i>
              </button>
            </div>

            <div v-if="mostrarLista" class="lista-flotante shadow rounded border">
              <ul class="list-unstyled mb-0">
                <li 
                  v-for="profe in profesoresFiltrados" 
                  :key="profe.idProfesor" 
                  @click="seleccionarProfesor(profe)"
                  class="p-2 border-bottom d-flex align-items-center"
                >
                  <div class="avatar-circle me-2 bg-primary text-white small">
                    {{ obtenerIniciales(profe.nombre) }}
                  </div>
                  <div>
                    <div class="fw-bold text-dark">{{ obtenerNombreCompleto(profe) }}</div>
                    <small class="text-muted" style="font-size: 0.75rem;">{{ profe.email }}</small>
                  </div>
                </li>
                
                <li v-if="profesoresFiltrados.length === 0" class="p-3 text-center text-muted small">
                  <i class="bi bi-emoji-frown me-1"></i>
                  {{ busquedaProfesor ? $t('home.noMatches') : $t('home.noTeachers') }}
                </li>
              </ul>
            </div>
          </div>

        </div>
        
        <div class="col-md-7 text-secondary small mt-3 mt-md-0 ps-md-4 border-start-md">
          <div v-if="idProfesorSeleccionado" class="d-flex align-items-center text-success animate__animated animate__fadeIn">
             <i class="bi bi-check-circle-fill fs-4 me-2"></i>
             <div>
               <strong class="d-block">{{ $t('home.selectedTeacher') }}</strong>
               {{ $t('home.viewingScheduleOf') }}: {{ nombreProfesorSeleccionado }}
             </div>
          </div>
          <div v-else class="d-flex align-items-center">
             <i class="bi bi-arrow-left-circle fs-4 me-2 text-primary"></i>
             <span>{{ $t('home.searchHelp') }}</span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="idCalculado" class="card shadow border-0 p-3">
      <Horario :idProfesor="idCalculado" :key="idCalculado" />
    </div>

    <div v-else class="text-center py-5">
      <div v-if="cargandoId">
          <div class="spinner-border text-primary" role="status"></div>
         <p class="mt-2 text-muted">{{ $t('home.loadingProfile') }}</p>
      </div>
      
      <div v-else-if="esAdmin && !idProfesorSeleccionado" class="text-muted opacity-50">
         <i class="bi bi-calendar-range display-1 mb-3 d-block"></i>
        <h4>{{ $t('home.waitingSelection') }}</h4>
      </div>
      
      <div v-else class="text-danger bg-white p-4 border rounded d-inline-block shadow-sm">
         <i class="bi bi-person-x-fill fs-1 mb-2"></i>
        <h4>{{ $t('home.linkErrorTitle') }}</h4>
        <p class="mb-0">{{ $t('home.linkErrorMessage') }}</p>
        <small>{{ $t('home.linkErrorHelp') }}</small>
      </div>
    </div>

  </div>

  <div v-if="mostrarLista" class="fondo-transparente" @click="mostrarLista = false"></div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import profesorService from '../services/profesorService'

import MenuLateral from '../components/MenuLateral.vue'
import Horario from '../components/Horario.vue'
import ModalCambioContraseña from '../components/ModalCambioContraseña.vue'

const auth = useAuthStore()
const mostrarModalPassword = ref(false)
const listaProfesores = ref([])

const busquedaProfesor = ref('')
const idProfesorSeleccionado = ref(null)
const nombreProfesorSeleccionado = ref('')
const mostrarLista = ref(false)

const profesorEncontrado = ref(null)
const cargandoId = ref(false)

const esAdmin = computed(() => auth.usuario?.rol === 'administrador')

const profesoresFiltrados = computed(() => {
  const termino = busquedaProfesor.value.toLowerCase().trim()

  const profesoresOrdenados = [...listaProfesores.value].sort((a, b) =>
    obtenerNombreCompleto(a).localeCompare(obtenerNombreCompleto(b), 'es', { sensitivity: 'base' })
  )

  if (!termino) {
    return profesoresOrdenados.slice(0, 200)
  }

  return profesoresOrdenados.filter(p => {
    const nombreCompleto = obtenerNombreCompleto(p).toLowerCase()
    return nombreCompleto.includes(termino) || (p.email && p.email.toLowerCase().includes(termino))
  }).slice(0, 12)
})

const idCalculado = computed(() => {
  if (esAdmin.value) {
    return idProfesorSeleccionado.value
  }
  return profesorEncontrado.value?.idProfesor || null
})

onMounted(async () => {
  if (auth.usuario?.cambiarContraseña) {
    mostrarModalPassword.value = true
  }
  await cargarYBuscarProfesor()
})

const seleccionarProfesor = (profe) => {
  idProfesorSeleccionado.value = profe.idProfesor
  nombreProfesorSeleccionado.value = obtenerNombreCompleto(profe)
  busquedaProfesor.value = nombreProfesorSeleccionado.value
  mostrarLista.value = false
}

const limpiarSeleccion = () => {
  idProfesorSeleccionado.value = null
  busquedaProfesor.value = ''
  nombreProfesorSeleccionado.value = ''
  mostrarLista.value = false
}

const obtenerIniciales = (nombre) => {
  if (!nombre) return '?'
  return nombre.substring(0, 2).toUpperCase()
}

const obtenerNombreCompleto = (profe) => `${profe.nombre} ${profe.apellido || ''}`.trim()

async function cargarYBuscarProfesor() {
  cargandoId.value = true
  try {
    listaProfesores.value = await profesorService.obtenerProfesores()

    if (!esAdmin.value && auth.usuario) {
      const emailUser = auth.usuario.email?.toLowerCase().trim()
      const nombreUser = auth.usuario.nombre?.toLowerCase().trim()

      let encontrado = listaProfesores.value.find(p => 
        p.email && p.email.toLowerCase().trim() === emailUser
      )

      if (!encontrado && nombreUser) {
        encontrado = listaProfesores.value.find(p => {
           const nombreProfe = (p.nombre + " " + (p.apellido || "")).toLowerCase()
           const palabrasProfe = nombreProfe.split(/[\s,]+/).filter(w => w.length > 2)
           const palabrasUser = nombreUser.split(/[\s,]+/).filter(w => w.length > 2)
           const coincidencias = palabrasUser.filter(w => palabrasProfe.includes(w))
           return coincidencias.length >= 2
        })
      }

      if (encontrado) {
        profesorEncontrado.value = encontrado
      }
    }

  } catch (error) {
    console.error('Error cargando profesores:', error)
  } finally {
    cargandoId.value = false
  }
}
</script>

<style scoped>
.container-fluid { transition: all 0.3s ease; }
.lista-flotante {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  max-height: 250px;
  overflow-y: auto;
  background: white;
  z-index: 1000;
  margin-top: 5px;
}

.lista-flotante li {
  cursor: pointer;
  transition: background-color 0.2s;
}

.lista-flotante li:hover {
  background-color: #f0f7ff;
}
.avatar-circle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}
.fondo-transparente {
  position: fixed;
  top: 0; left: 0; width: 100%; height: 100%;
  z-index: 999;
  cursor: default;
}
@media (min-width: 768px) {
  .border-start-md {
    border-left: 1px solid #dee2e6;
  }
}
</style>