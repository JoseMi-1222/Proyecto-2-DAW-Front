<template>
  <MenuLateral />
  
  <div class="contenedor-gestion">
    <div class="header-gestion d-flex justify-content-between align-items-center mb-4">
      <div>
        <h2 class="fw-bold mb-1"><i class="bi bi-people-fill me-2"></i>Gestión de Profesorado</h2>
      </div>
      
      <div class="d-flex gap-2">
        <button class="btn btn-primary" @click="abrirModalCrear">
          <i class="bi bi-plus-lg me-2"></i>Nuevo Profesor
        </button>
      </div>
    </div>

    <transition name="fade">
      <div v-if="mensajeExito" class="alert alert-success d-flex align-items-center shadow-sm mb-4" role="alert">
        <i class="bi bi-check-circle-fill me-2 fs-5"></i>
        <div>{{ mensajeExito }}</div>
        <button type="button" class="btn-close ms-auto" @click="mensajeExito = ''"></button>
      </div>
    </transition>

    <div class="card border-0 shadow-sm mb-4">
      <div class="card-body p-3 bg-light rounded-top">
        <div class="input-group">
          <span class="input-group-text bg-white border-end-0"><i class="bi bi-search"></i></span>
          <input 
            type="text" 
            class="form-control border-start-0 ps-0" 
            placeholder="Buscar por nombre..." 
            v-model="busqueda"
            @input="buscarConRetraso"
          >
        </div>
      </div>
    </div>

    <div v-if="cargando" class="text-center py-5">
      <div class="spinner-border text-primary"></div>
    </div>

    <div v-else class="card border-0 shadow-sm">
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th class="ps-4">Profesor</th>
              <th>Usuario / Email</th>
              <th>Asignaturas</th>
              <th class="text-end pe-4" style="min-width: 150px;">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="profesores.length === 0">
              <td colspan="4" class="text-center py-4 text-muted">No se encontraron resultados.</td>
            </tr>
            <tr v-for="prof in profesores" :key="prof.idProfesor">
              <td class="ps-4">
                <div class="d-flex align-items-center">
                  <div class="avatar-circle me-3 bg-primary text-white">
                    {{ obtenerIniciales(prof.nombre) }}
                  </div>
                  <div>
                    <div class="fw-bold">{{ prof.nombre }}</div>
                  </div>
                </div>
              </td>
              <td>
                <div v-if="prof.usuario">
                  <small class="d-block text-dark"><i class="bi bi-envelope me-1"></i>{{ prof.usuario.email }}</small>
                  <span class="badge bg-success bg-opacity-10 text-success" style="font-size: 0.7rem;">Activo</span>
                </div>
                <div v-else>
                  <span class="badge bg-secondary bg-opacity-10 text-secondary">Sin usuario</span>
                </div>
              </td>
              <td>
                <small class="text-muted" v-if="!prof.horarios || prof.horarios.length === 0">Sin asignaturas</small>
                <div v-else class="d-flex flex-wrap gap-1">
                   <span v-for="(asig, i) in obtenerAsignaturasUnicas(prof.horarios)" :key="i" class="badge bg-light text-dark border">{{ asig }}</span>
                </div>
              </td>
              
              <td class="text-end pe-4">
                <div class="d-flex justify-content-end gap-2">
                  <button class="btn btn-sm btn-light text-dark" title="Gestionar Horario" @click="abrirHorario(prof)">
                    <i class="bi bi-calendar3"></i>
                  </button>
                  
                  <button class="btn btn-sm btn-light text-primary" title="Editar Datos" @click="abrirModalEditar(prof)">
                    <i class="bi bi-pencil"></i>
                  </button>
                  
                  <button class="btn btn-sm btn-light text-danger" title="Eliminar" @click="confirmarBorrado(prof)">
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
              </td>
              </tr>
          </tbody>
        </table>
      </div>
      
      <div class="card-footer bg-white py-3 d-flex justify-content-between align-items-center">
        <span class="text-muted small">Página {{ paginaActual + 1 }} de {{ totalPaginas }}</span>
        <div class="btn-group">
          <button class="btn btn-outline-secondary btn-sm" :disabled="paginaActual === 0" @click="cambiarPagina(-1)">Anterior</button>
          <button class="btn btn-outline-secondary btn-sm" :disabled="paginaActual >= totalPaginas - 1" @click="cambiarPagina(1)">Siguiente</button>
        </div>
      </div>
    </div>

    <ModalProfesor 
      :visible="mostrarModalProfe"
      :profesorAEditar="profesorSeleccionado"
      @cerrar="cerrarModalProfe"
      @guardar-exito="manejarExito"
    />

    <ModalConfirmacion 
      :visible="mostrarModalBorrar"
      mensaje="¿Seguro que quieres eliminar a este profesor? Esta acción no se puede deshacer."
      @cerrar="mostrarModalBorrar = false"
      @confirmar="eliminarProfesor"
    />

   

    <ModalHorario 
      :visible="mostrarModalHorario" 
      :profesor="profesorHorarioSeleccionado"
      @cerrar="mostrarModalHorario = false"
      @guardar-exito="manejarExito"
    />

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import profesorService from '../services/profesorService'
import MenuLateral from '../components/MenuLateral.vue'
import ModalProfesor from '../components/ModalProfesor.vue'
import ModalConfirmacion from '../components/ModalConfirmacion.vue'
import ModalHorario from '../components/ModalHorario.vue'

const profesores = ref([])
const busqueda = ref('')
const paginaActual = ref(0)
const totalPaginas = ref(0)
const elementosPorPagina = ref(10)
const cargando = ref(false)
const mensajeExito = ref('') 
let timeoutBusqueda = null

const mostrarModalProfe = ref(false)
const profesorSeleccionado = ref(null) 

const mostrarModalBorrar = ref(false)
const profesorABorrar = ref(null)

const mostrarModalUsuario = ref(false)

const mostrarModalHorario = ref(false)
const profesorHorarioSeleccionado = ref(null)

onMounted(() => {
  cargarProfesores()
})

const cargarProfesores = async () => {
  cargando.value = true
  try {
    const data = await profesorService.obtenerProfesoresGestion(
      busqueda.value, paginaActual.value, elementosPorPagina.value
    )
    profesores.value = data.content
    totalPaginas.value = data.totalPages
  } catch (error) {
    console.error(error)
  } finally {
    cargando.value = false
  }
}

const buscarConRetraso = () => {
  if (timeoutBusqueda) clearTimeout(timeoutBusqueda)
  timeoutBusqueda = setTimeout(() => {
    paginaActual.value = 0
    cargarProfesores()
  }, 500)
}

const cambiarPagina = (delta) => {
  paginaActual.value += delta
  cargarProfesores()
}

const mostrarNotificacion = (msg) => {
  mensajeExito.value = msg
  setTimeout(() => { mensajeExito.value = '' }, 3000)
}

const manejarExito = (mensajeRecibido) => {
  cargarProfesores()
  const texto = typeof mensajeRecibido === 'string' ? mensajeRecibido : 'Operación realizada con éxito'
  mostrarNotificacion(texto)
}

const abrirModalCrear = () => {
  profesorSeleccionado.value = null
  mostrarModalProfe.value = true
}

const abrirModalEditar = (profesor) => {
  profesorSeleccionado.value = { ...profesor }
  mostrarModalProfe.value = true
}

const cerrarModalProfe = () => {
  mostrarModalProfe.value = false
  profesorSeleccionado.value = null
}

const confirmarBorrado = (profesor) => {
  profesorABorrar.value = profesor
  mostrarModalBorrar.value = true
}

const eliminarProfesor = async () => {
  mostrarModalBorrar.value = false
  if (!profesorABorrar.value) return
  
  try {
    await profesorService.eliminarProfesor(profesorABorrar.value.idProfesor)
    manejarExito('Profesor eliminado correctamente.')
  } catch (e) {
    console.error(e)
    alert("No se pudo eliminar. Puede que tenga horarios asignados.")
  }
}

const abrirModalUsuario = () => {
  mostrarModalUsuario.value = true 
}

const abrirHorario = (profesor) => {
  profesorHorarioSeleccionado.value = profesor
  mostrarModalHorario.value = true
}

const obtenerAsignaturasUnicas = (horarios) => {
  if (!horarios) return []
  const asignaturas = horarios.map(h => h.asignatura?.nombre).filter(n => n)
  return [...new Set(asignaturas)].slice(0, 3)
}

const obtenerIniciales = (nombre) => {
  if (!nombre) return '?'
  return nombre.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
}
</script>

<style scoped>
.contenedor-gestion { 
  margin-top: 80px; 
  padding: 20px 50px; 
  margin-left: 250px;
}

@media (max-width: 768px) { 
  .contenedor-gestion { 
    margin-left: 0; 
    padding: 20px; 
  } 
}

.avatar-circle { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.5s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>