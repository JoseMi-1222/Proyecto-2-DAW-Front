<template>
  <div class="container-fluid pt-4">
    
    <div v-if="cargando" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Cargando horario...</span>
      </div>
    </div>

    <div v-else>
      <div class="d-none d-md-block">
        <table class="table table-bordered text-start align-middle w-100 small">
          <thead class="table-dark text-center">
            <tr>
              <th style="width: 100px;">Franja</th>
              <th v-for="dia in diasSemana" :key="dia" style="width: 130px;">{{ dia }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="franja in franjasOrdenadas" :key="franja.horaInicio">
              <td class="bg-light fw-bold text-center">
                {{ franja.horaInicio.slice(0, 5) }} - {{ franja.horaFin.slice(0, 5) }}
              </td>
              <td v-for="dia in diasSemana" :key="dia" style="padding: 4px; font-size: 13px; text-align: left"
                :style="esRecreo(franja) ? estiloRecreo : {}">
                
                <div v-if="esRecreo(franja)"><strong>Recreo</strong></div>
                
                <div v-else>
                  <div v-for="(clase, i) in getClases(dia, franja)" :key="i" class="mb-1 p-1 rounded" 
                       :style="obtenerEstilosAsignatura(clase.asignatura?.nombre)">
                    
                    <strong>{{ clase.asignatura?.nombre || 'Asignatura' }}</strong><br />
                    <span class="text-muted">Aula:</span> {{ clase.aula?.codigo || '-' }}<br />
                    <span class="text-muted">Curso:</span> {{ clase.curso?.nombre || '-' }}
                    <hr v-if="getClases(dia, franja).length > 1 && i < getClases(dia, franja).length - 1" />
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div class="d-md-none text-center text-muted py-4">
          <i class="bi bi-phone-landscape fs-1"></i>
          <p class="mt-2">Por favor, gira el dispositivo para ver la tabla completa.</p>
       </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'

const props = defineProps({
  idProfesor: { type: [Number, String], default: null },
  profesorId: { type: [Number, String], default: null }, 
  fetchAll: { type: Boolean, default: false }
})

const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes']
const horario = ref([])
const cargando = ref(false)
const route = useRoute()

// Calculamos el ID efectivo
const effectiveIdProfesor = computed(() => {
  return props.idProfesor ?? props.profesorId ?? route.params.id ?? null
})

// --- FRANJAS Y HORAS ---
const franjasFijas = [
  { idFranja: 'R1', horaInicio: '18:00:00', horaFin: '18:15:00' },
  { idFranja: 'R2', horaInicio: '11:15:00', horaFin: '11:45:00' }
]

const franjasOrdenadas = computed(() => {
  const mapa = new Map()
  for (const h of horario.value) {
    const clave = h.franja.horaInicio
    if (!mapa.has(clave)) mapa.set(clave, h.franja)
  }
  const recreoSiempre = franjasFijas.find(f => f.horaInicio === '11:15:00')
  if (recreoSiempre && !mapa.has(recreoSiempre.horaInicio)) mapa.set(recreoSiempre.horaInicio, recreoSiempre)
  
  const tieneClasesDespuesDe18 = horario.value.some(h => h.franja.horaInicio > '18:00:00')
  const recreoTarde = franjasFijas.find(f => f.horaInicio === '18:00:00')
  if (tieneClasesDespuesDe18 && recreoTarde && !mapa.has(recreoTarde.horaInicio)) mapa.set(recreoTarde.horaInicio, recreoTarde)

  return Array.from(mapa.values()).sort((a, b) => a.horaInicio.localeCompare(b.horaInicio))
})

function getClases(dia, franja) {
  return horario.value.filter(
    h => h.dia === dia && h.franja.horaInicio.slice(0, 5) === franja.horaInicio.slice(0, 5)
  )
}

function esRecreo(franja) {
  return franjasFijas.some(f => f.horaInicio === franja.horaInicio)
}

const estiloRecreo = { backgroundColor: 'rgba(255, 183, 77, 0.6)', border: '2px dashed orange', textAlign: 'center' }

// --- CARGA DE DATOS ---
async function cargarHorario() {
  if (!effectiveIdProfesor.value && !props.fetchAll) {
    horario.value = []
    return
  }

  cargando.value = true
  try {
    let url = 'http://localhost:8081/api/horarios'
    if (effectiveIdProfesor.value) {
      url += `?idProfesor=${effectiveIdProfesor.value}`
    }
    
    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    
    const diaMap = { L: 'Lunes', M: 'Martes', X: 'Miércoles', J: 'Jueves', V: 'Viernes' }
    
    // Mapeo directo sin filtros extraños
    horario.value = response.data.map(item => ({ 
      ...item, 
      dia: diaMap[item.dia] || item.dia 
    }))

  } catch (error) {
    console.error('Error al cargar el horario:', error)
    horario.value = []
  } finally {
    cargando.value = false
  }
}

onMounted(() => { cargarHorario() })

watch(effectiveIdProfesor, (newVal, oldVal) => {
  if (newVal !== oldVal) cargarHorario()
})

// --- ESTILOS VISUALES ---
const coloresAsignaturas = ref({})
const paletaColoresSuaves = ['#E3F2FD', '#E8F5E9', '#FFF3E0', '#F3E5F5', '#FFEBEE', '#E0F7FA']

function obtenerEstilosAsignatura(asignatura) {
  if (!asignatura) return {}
  if (!coloresAsignaturas.value[asignatura]) {
    const total = Object.keys(coloresAsignaturas.value).length
    coloresAsignaturas.value[asignatura] = paletaColoresSuaves[total % paletaColoresSuaves.length]
  }
  return { backgroundColor: coloresAsignaturas.value[asignatura], border: '1px solid rgba(0,0,0,0.1)' }
}
</script>

<style scoped>
table, table th, table td {
  border: 1px solid #dee2e6 !important;
  border-collapse: collapse !important;
}
</style>