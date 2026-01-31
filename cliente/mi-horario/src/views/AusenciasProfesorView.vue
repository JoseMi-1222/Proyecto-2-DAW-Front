<template>
  <MenuLateral />
  
  <div class="contenedor-ausencias">
    <div>
      <h2 class="mb-4">Mis Ausencias</h2>

      <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-3">
        <button 
          class="btn" 
          :class="mostrarFormulario ? 'btn-secondary' : 'btn-primary'"
          @click="mostrarFormulario = !mostrarFormulario"
          :disabled="!idProfesorReal"
        >
          <i class="bi" :class="mostrarFormulario ? 'bi-x-lg' : 'bi-plus-lg'"></i>
          {{ mostrarFormulario ? 'Cancelar registro' : 'Registrar Nueva Ausencia' }}
        </button>

        <div class="filtro-fecha">
          <label class="form-label mb-0 fw-bold">Filtrar por fecha:</label>
          <div class="d-flex align-items-center gap-2 flex-wrap">
            <input type="text" class="form-control" placeholder="Día" v-model="filtroDia" style="width: 60px;" />
            <input type="text" class="form-control" placeholder="Mes" v-model="filtroMes" style="width: 60px;" />
            <input type="text" class="form-control" placeholder="Año" v-model="filtroAnio" style="width: 80px;" />
            <button class="btn btn-outline-primary" @click="filtrarPorFechaAvanzado"><i class="bi bi-search"></i></button>
            <button class="btn btn-outline-secondary" @click="resetearFiltro"><i class="bi bi-arrow-counterclockwise"></i></button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="cargandoId" class="alert alert-warning">
       <div class="spinner-border spinner-border-sm me-2"></div> Cargando perfil de profesor...
    </div>

    <div v-if="mostrarFormulario && idProfesorReal" class="mb-4">
      <FormularioCrearAusencia 
        :idProfesor="idProfesorReal" 
        @ausenciaCreada="alCrearAusencia"
        @error="manejarErrorFormulario"
      />
    </div>

    <TablaAusencias 
      :ausencias="ausenciasOrdenadasFiltradas" 
      @eliminarDia="prepararEliminacion"
      @eliminarUna="prepararEliminacion"
      @justificarDia="justificarAusenciasDia"
    />

  </div>

  <ModalMensaje 
    :visible="modalVisible" 
    :titulo="modalTitulo" 
    :mensaje="modalMensaje" 
    :tipo="modalTipo"
    @cerrar="modalVisible = false" 
  />

  <ModalConfirmacion 
    :visible="mostrarConfirmacion"
    mensaje="¿Seguro que quieres eliminar este registro? Esta acción no se puede deshacer."
    @cerrar="mostrarConfirmacion = false"
    @confirmar="ejecutarEliminacion"
  />
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import ausenciaService from '../services/ausenciaService'
import horarioService from '../services/horarioService'
import { useAuthStore } from '../stores/auth'

import ModalMensaje from '../components/ModalMensaje.vue'
import ModalConfirmacion from '../components/ModalConfirmacion.vue' // <--- IMPORTADO
import MenuLateral from '../components/MenuLateral.vue'
import FormularioCrearAusencia from '../components/FormularioCrearAusencia.vue'
import TablaAusencias from '../components/TablaAusencias.vue'

const auth = useAuthStore()

// Estado
const ausencias = ref([])
const mostrarFormulario = ref(false)
const idProfesorReal = ref(null)
const cargandoId = ref(true)

// Estado Confirmación Borrado
const mostrarConfirmacion = ref(false)
const itemParaEliminar = ref(null)

// Filtros
const ausenciasFiltradas = ref([])
const filtroDia = ref('')
const filtroMes = ref('')
const filtroAnio = ref('')

// Modal Mensajes
const modalVisible = ref(false)
const modalTitulo = ref('')
const modalMensaje = ref('')
const modalTipo = ref('info')

// --- LÓGICA DE INICIO ---
onMounted(async () => {
  if (!auth.usuario?.email) {
    mostrarModal('Error', 'No hay usuario logueado', 'error')
    return
  }

  try {
    const dataProfesor = await horarioService.obtenerIdProfesorPorEmail(auth.usuario.email)
    idProfesorReal.value = dataProfesor.idProfesor || dataProfesor.id || dataProfesor

    cargarAusencias()
  } catch (error) {
    console.error(error)
    mostrarModal('Error', 'No se pudo identificar el perfil de profesor.', 'error')
  } finally {
    cargandoId.value = false
  }
})

// --- CARGA DE DATOS ---
const cargarAusencias = async () => {
  if (!idProfesorReal.value) return

  try {
    const data = await ausenciaService.obtenerAusencias(auth.usuario.id)
    ausencias.value = data
    ausenciasFiltradas.value = [...ausencias.value]
    if(filtroDia.value || filtroMes.value || filtroAnio.value) filtrarPorFechaAvanzado()
  } catch (error) {
    console.error('Error cargando ausencias:', error)
  }
}

// --- LÓGICA DE ELIMINACIÓN CON MODAL ---

// 1. Se llama desde la tabla al pulsar la papelera
const prepararEliminacion = ({ id = null, fecha = null }) => {
  // Guardamos qué queremos borrar y mostramos el modal
  itemParaEliminar.value = { id, fecha }
  mostrarConfirmacion.value = true
}

// 2. Se llama cuando el usuario confirma en el modal
const ejecutarEliminacion = async () => {
  mostrarConfirmacion.value = false // Cerramos modal confirmación
  
  if (!itemParaEliminar.value) return

  const { id, fecha } = itemParaEliminar.value

  try {
    await ausenciaService.eliminarAusencia(id, fecha, idProfesorReal.value)
    await cargarAusencias()
    mostrarModal('Éxito', 'Eliminado correctamente', 'success')
  } catch (error) {
    mostrarModal('Error', 'No se pudo eliminar', 'error')
  } finally {
    itemParaEliminar.value = null
  }
}

// --- JUSTIFICAR ---
const justificarAusenciasDia = async (fecha) => {
  try {
    await ausenciaService.justificarDia(fecha, idProfesorReal.value)
    await cargarAusencias()
    mostrarModal('Éxito', 'Día justificado', 'success')
  } catch (error) {
    mostrarModal('Error', 'Fallo al justificar', 'error')
  }
}

// --- UTILIDADES FORMULARIO ---
const alCrearAusencia = () => {
  mostrarFormulario.value = false 
  mostrarModal('Éxito', 'Ausencia registrada.', 'success')
  cargarAusencias()
}
const manejarErrorFormulario = (msg) => mostrarModal('Error', msg, 'error')

// --- FILTROS ---
const filtrarPorFechaAvanzado = () => {
  const d = filtroDia.value.padStart(2,'0'), m = filtroMes.value.padStart(2,'0'), a = filtroAnio.value
  ausenciasFiltradas.value = ausencias.value.filter(x => {
    const f = new Date(x.fecha)
    return (!d||d==f.getDate().toString().padStart(2,'0')) && 
           (!m||m==(f.getMonth()+1).toString().padStart(2,'0')) && 
           (!a||a==f.getFullYear().toString())
  })
}
const resetearFiltro = () => {
  filtroDia.value=''; filtroMes.value=''; filtroAnio.value=''
  ausenciasFiltradas.value = [...ausencias.value]
}

const ausenciasOrdenadasFiltradas = computed(() =>
  [...ausenciasFiltradas.value].sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
)

const mostrarModal = (t, m, tp='info') => {
  modalTitulo.value=t; modalMensaje.value=m; modalTipo.value=tp; modalVisible.value=true
}
</script>

<style scoped>
.contenedor-ausencias { margin-top: 100px; padding: 0 50px 50px; }
.filtro-fecha { display: flex; align-items: center; gap: 0.5rem; }
</style>