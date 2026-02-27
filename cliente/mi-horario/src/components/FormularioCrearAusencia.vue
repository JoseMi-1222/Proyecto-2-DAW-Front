<template>
  <div class="card mb-4 border-primary shadow-sm">
    <div class="card-body">
      <h5 class="card-title mb-4">
        <i class="bi bi-clock-history me-2"></i>Registrar nueva ausencia
      </h5>

      <form @submit.prevent="crearAusencia">
        <div class="row g-3">

          <div class="col-md-6">
            <label class="form-label fw-bold">1. Selecciona la Fecha</label>
            <input type="date" v-model="nuevaAusencia.fecha" class="form-control form-control-lg" required />
          </div>

          <div class="col-md-6">
            <label class="form-label fw-bold">2. Instrucciones</label>
            <input type="text" v-model="nuevaAusencia.motivo" class="form-control form-control-lg"
              placeholder="Ej: Tareas al profesor de guardia" />
          </div>

          <div class="mb-3 mt-3">
            <label class="form-label"><b>3. Adjuntar Tareas (Opcional)</b></label>
            <input type="file" class="form-control" @change="capturarArchivo"
              accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg">
            <small class="text-muted">Formatos permitidos: PDF, Word, TXT o Imágenes.</small>
          </div>

          <div class="col-12">
            <label class="form-label fw-bold">4. Selecciona las clases a las que faltarás</label>
            <p class="text-muted small mb-2">
              <i class="bi bi-info-circle me-1"></i>Todas tus clases vienen seleccionadas por defecto. Puedes hacer clic en ellas para desmarcarlas si vas a venir a alguna.
            </p>

            <div v-if="!nuevaAusencia.fecha" class="alert alert-info py-2">
              <i class="bi bi-calendar-event me-2"></i>Por favor, selecciona una fecha para ver tus clases.
            </div>

            <div v-else-if="cargandoHorario" class="text-center py-3">
              <div class="spinner-border spinner-border-sm text-primary" role="status"></div>
              <span class="ms-2">Consultando tu horario...</span>
            </div>

            <div v-else-if="clasesDelDia.length > 0" class="row row-cols-1 row-cols-md-3 g-2 mt-1">
              <div v-for="tramo in clasesDelDia" :key="tramo.id" class="col">
                <div class="card h-100 clase-card border-2"
                  :class="esSeleccionada(tramo) ? 'border-success bg-success-subtle' : 'border-light bg-light opacity-50'"
                  @click="toggleSeleccion(tramo)">
                  <div class="card-body p-2">
                    <div class="d-flex justify-content-between align-items-start">
                      <h6 class="card-title mb-2 fw-bold text-wrap" style="font-size: 0.9rem; line-height: 1.2;">
                        {{ tramo.materia || tramo.asignatura?.nombre }}
                      </h6>
                      <i v-if="esSeleccionada(tramo)" class="bi bi-check-circle-fill text-success ms-2"></i>
                      <i v-else class="bi bi-circle text-muted ms-2"></i>
                    </div>
                    <p class="card-text small mb-1 text-muted">
                      <i class="bi bi-clock me-1"></i>{{ tramo.hora_inicio || tramo.franja?.horaInicio }} - {{
                        tramo.hora_fin || tramo.franja?.horaFin }}
                    </p>
                    <span class="badge bg-secondary-subtle text-secondary" style="font-size: 0.7rem;">
                      {{ tramo.aula?.codigo || tramo.aula || 'Aula TBD' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div v-else class="alert alert-warning py-2 mt-1">
              <i class="bi bi-exclamation-triangle me-2"></i>No tienes clases registradas para este día.
            </div>
          </div>

          <div class="col-12 d-flex justify-content-end mt-4">
            <button type="submit" class="btn btn-success btn-lg px-5" :disabled="clasesSeleccionadas.length === 0">
              <i class="bi bi-plus-circle me-2"></i>Confirmar {{ clasesSeleccionadas.length }} Ausencia(s)
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import horarioService from '../services/horarioService'
import ausenciaService from '../services/ausenciaService'

const emit = defineEmits(['ausenciaCreada', 'error'])

const props = defineProps({
  idProfesor: {
    type: Number,
    required: true
  }
})

const nuevaAusencia = ref({
  fecha: '',
  motivo: ''
})

const clasesSeleccionadas = ref([])
const archivoSeleccionado = ref(null) 

const horarioCompleto = ref([])
const clasesDelDia = ref([])
const cargandoHorario = ref(false)

onMounted(() => {
  if (props.idProfesor) {
    cargarHorarioProfesor(props.idProfesor)
  }
})

watch(() => props.idProfesor, (newId) => {
  if (newId) cargarHorarioProfesor(newId)
})

async function cargarHorarioProfesor(id) {
  try {
    cargandoHorario.value = true
    const data = await horarioService.obtenerHorarioProfesor(id)
    horarioCompleto.value = data
  } catch (error) {
    console.error(error)
  } finally {
    cargandoHorario.value = false
  }
}

watch(() => nuevaAusencia.value.fecha, (nuevaFecha) => {
  clasesSeleccionadas.value = []

  if (!nuevaFecha) {
    clasesDelDia.value = []
    return
  }

  const mapaDiasBackend = {
    'Lunes': 'L',
    'Martes': 'M',
    'Miércoles': 'X',
    'Jueves': 'J',
    'Viernes': 'V',
    'Sábado': 'S',
    'Domingo': 'D'
  }

  const dateObj = new Date(nuevaFecha + 'T12:00:00')
  const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
  const diaNombre = diasSemana[dateObj.getDay()]
  const letraDia = mapaDiasBackend[diaNombre] || ''

  clasesDelDia.value = horarioCompleto.value.filter(h => {
    const diaBackend = h.dia || h.dia_semana || h.franja?.dia || ''
    return diaBackend.toString().toUpperCase() === letraDia
  }).sort((a, b) => {
    const horaA = a.hora_inicio || a.franja?.horaInicio || '00:00'
    const horaB = b.hora_inicio || b.franja?.horaInicio || '00:00'
    return horaA > horaB ? 1 : -1
  })

  clasesSeleccionadas.value = [...clasesDelDia.value]
})

function toggleSeleccion(tramo) {
  const index = clasesSeleccionadas.value.indexOf(tramo)
  if (index === -1) {
    clasesSeleccionadas.value.push(tramo)
  } else {
    clasesSeleccionadas.value.splice(index, 1)
  }
}

function esSeleccionada(tramo) {
  return clasesSeleccionadas.value.includes(tramo)
}

function capturarArchivo(event) {
  archivoSeleccionado.value = event.target.files[0]
}

async function crearAusencia() {
  if (clasesSeleccionadas.value.length === 0) {
    return
  }

  try {
    let nombreArchivoGuardado = null;

    if (archivoSeleccionado.value) {
      nombreArchivoGuardado = await ausenciaService.subirArchivo(archivoSeleccionado.value);
    }

    const peticiones = clasesSeleccionadas.value.map(tramo => {
      const payload = {
        fecha: nuevaAusencia.value.fecha,
        horaInicio: tramo.hora_inicio || tramo.franja?.horaInicio,
        horaFin: tramo.hora_fin || tramo.franja?.horaFin,
        motivo: nuevaAusencia.value.motivo,
        idProfesor: props.idProfesor,
        archivoAdjunto: nombreArchivoGuardado 
      }
      return ausenciaService.crearAusencia(payload)
    })

    await Promise.all(peticiones)

    emit('ausenciaCreada')

    nuevaAusencia.value = { fecha: '', motivo: '' }
    clasesSeleccionadas.value = []
    archivoSeleccionado.value = null;

    const fileInput = document.querySelector('input[type="file"]')
    if(fileInput) fileInput.value = ''

  } catch (error) {
    console.error("Error completo:", error);
    const mensaje = error.response?.data?.message || 'Error al registrar algunas ausencias o subir el archivo.'
    emit('error', mensaje)
  }
}
</script>

<style scoped>
.clase-card {
  cursor: pointer;
  transition: all 0.2s ease-in-out;
}

.clase-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  background-color: #f8f9fa;
}

.clase-card.border-success {
  background-color: #f0fff4 !important;
  border-color: #198754 !important;
}
</style>