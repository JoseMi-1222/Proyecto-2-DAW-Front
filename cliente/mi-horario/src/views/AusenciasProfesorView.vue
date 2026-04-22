<template>
  <MenuLateral />
  
  <div class="contenedor-ausencias">
    <div>
      <h2 class="mb-4">{{ $t('teacherAbsences.title') }}</h2>

      <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-3">
        <button 
          class="btn" 
          :class="mostrarFormulario ? 'btn-secondary' : 'btn-primary'"
          @click="mostrarFormulario = !mostrarFormulario"
          :disabled="!idProfesorReal"
        >
          <i class="bi" :class="mostrarFormulario ? 'bi-x-lg' : 'bi-plus-lg'"></i>
          {{ mostrarFormulario ? $t('teacherAbsences.cancelRegister') : $t('teacherAbsences.newAbsence') }}
        </button>

        <div class="filtro-fecha">
          <label class="form-label mb-0 fw-bold">{{ $t('teacherAbsences.filterByDate') }}</label>
          <div class="d-flex align-items-center gap-2 flex-wrap">
            <input type="text" class="form-control" :placeholder="$t('teacherAbsences.day')" v-model="filtroDia" style="width: 60px;" />
            <input type="text" class="form-control" :placeholder="$t('teacherAbsences.month')" v-model="filtroMes" style="width: 60px;" />
            <input type="text" class="form-control" :placeholder="$t('teacherAbsences.year')" v-model="filtroAnio" style="width: 80px;" />
            <button class="btn btn-outline-primary" @click="filtrarPorFechaAvanzado"><i class="bi bi-search"></i></button>
            <button class="btn btn-outline-secondary" @click="resetearFiltro"><i class="bi bi-arrow-counterclockwise"></i></button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="cargandoId" class="alert alert-warning">
       <div class="spinner-border spinner-border-sm me-2"></div> {{ $t('teacherAbsences.loadingTeacherProfile') }}
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
      @justificarDia="pedirArchivoJustificante"
    />

  </div>

  <input 
    type="file" 
    ref="inputJustificanteRef" 
    style="display: none" 
    accept=".pdf,.png,.jpg,.jpeg"
    @change="subirYJustificar"
  >

  <ModalMensaje 
    :visible="modalVisible" 
    :titulo="modalTitulo" 
    :mensaje="modalMensaje" 
    :tipo="modalTipo"
    @cerrar="modalVisible = false" 
  />

  <ModalConfirmacion 
    :visible="mostrarConfirmacion"
    :mensaje="$t('teacherAbsences.confirmDelete')"
    @cerrar="mostrarConfirmacion = false"
    @confirmar="ejecutarEliminacion"
  />
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import ausenciaService from '../services/ausenciaService'
import horarioService from '../services/horarioService'
import { useAuthStore } from '../stores/auth'

import ModalMensaje from '../components/ModalMensaje.vue'
import ModalConfirmacion from '../components/ModalConfirmacion.vue'
import MenuLateral from '../components/MenuLateral.vue'
import FormularioCrearAusencia from '../components/FormularioCrearAusencia.vue'
import TablaAusencias from '../components/TablaAusencias.vue'

const auth = useAuthStore()
const { t } = useI18n()

const ausencias = ref([])
const mostrarFormulario = ref(false)
const idProfesorReal = ref(null)
const cargandoId = ref(true)

const mostrarConfirmacion = ref(false)
const itemParaEliminar = ref(null)

const inputJustificanteRef = ref(null)
const fechaAJustificar = ref(null)

const ausenciasFiltradas = ref([])
const filtroDia = ref('')
const filtroMes = ref('')
const filtroAnio = ref('')

const modalVisible = ref(false)
const modalTitulo = ref('')
const modalMensaje = ref('')
const modalTipo = ref('info')

onMounted(async () => {
  if (!auth.usuario?.email) {
    mostrarModal(t('common.error'), t('teacherAbsences.noLoggedUser'), 'error')
    return
  }

  try {
    const dataProfesor = await horarioService.obtenerIdProfesorPorEmail(auth.usuario.email)
    idProfesorReal.value = dataProfesor.idProfesor || dataProfesor.id || dataProfesor

    cargarAusencias()
  } catch (error) {
    console.error(error)
    mostrarModal(t('common.error'), t('teacherAbsences.identifyTeacherError'), 'error')
  } finally {
    cargandoId.value = false
  }
})

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

const prepararEliminacion = ({ id = null, fecha = null }) => {
  itemParaEliminar.value = { id, fecha }
  mostrarConfirmacion.value = true
}

const ejecutarEliminacion = async () => {
  mostrarConfirmacion.value = false 
  
  if (!itemParaEliminar.value) return

  const { id, fecha } = itemParaEliminar.value

  try {
    await ausenciaService.eliminarAusencia(id, fecha, idProfesorReal.value)
    await cargarAusencias()
    mostrarModal(t('common.success'), t('teacherAbsences.deletedSuccessfully'), 'success')
  } catch (error) {
    mostrarModal(t('common.error'), t('teacherAbsences.deleteError'), 'error')
  } finally {
    itemParaEliminar.value = null
  }
}


const pedirArchivoJustificante = (fecha) => {
  fechaAJustificar.value = fecha
  inputJustificanteRef.value.click()
}

const subirYJustificar = async (event) => {
  const file = event.target.files[0]
  if (!file) return 

  try {
    mostrarModal(t('teacherAbsences.sending'), t('teacherAbsences.uploadingProof'), 'info')
    
    const nombreArchivoGuardado = await ausenciaService.subirArchivo(file)
    
    await ausenciaService.justificarDia(fechaAJustificar.value, idProfesorReal.value, nombreArchivoGuardado)
    
    await cargarAusencias()
    
    mostrarModal(t('teacherAbsences.sent'), t('teacherAbsences.proofSentPendingReview'), 'success')
  } catch (error) {
    console.error("Fallo al subir justificante:", error)
    mostrarModal(t('common.error'), t('teacherAbsences.uploadProofError'), 'error')
  } finally {
    event.target.value = ''
    fechaAJustificar.value = null
  }
}

const alCrearAusencia = () => {
  mostrarFormulario.value = false 
  mostrarModal(t('common.success'), t('teacherAbsences.absenceRegistered'), 'success')
  cargarAusencias()
}
const manejarErrorFormulario = (msg) => mostrarModal(t('common.error'), msg, 'error')

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