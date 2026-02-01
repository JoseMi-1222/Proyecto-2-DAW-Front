<template>
  <div v-if="cargando" class="text-center py-5">
    <div class="spinner-border text-primary" role="status"></div>
    <p class="mt-2 text-muted">Cargando tu horario...</p>
  </div>

  <div v-else class="horario-container">
    
    <div v-if="!horarioActual.length" class="alert alert-warning text-center">
      <i class="bi bi-exclamation-triangle me-2"></i> No hay datos de horario para este profesor.
    </div>

    <div v-else class="table-responsive rounded shadow-sm bg-white">
      <table class="table table-bordered text-center mb-0 align-middle">
        
        <thead class="bg-secondary text-white small text-uppercase">
          <tr>
            <th style="width: 100px;">Hora</th>
            <th v-for="dia in diasSemana" :key="dia">{{ dia }}</th>
          </tr>
        </thead>
        
        <tbody>
          <tr v-for="(franja, index) in franjasDefecto" :key="index">
            
            <td class="bg-light fw-bold text-muted small">
              {{ franja.inicio }}<br>-<br>{{ franja.fin }}
            </td>

            <td 
              v-for="dia in diasSemana" 
              :key="dia" 
              class="celda-horario p-0 position-relative"
              :class="getCelda(dia, franja.inicio) ? 'bg-primary bg-opacity-10' : 'bg-white'"
            >
              <div class="w-100 h-100 p-2 d-flex flex-column justify-content-center" style="min-height: 80px;">
                
                <div v-if="getCelda(dia, franja.inicio)">
                  <div class="fw-bold text-primary small text-uppercase">
                    {{ getCelda(dia, franja.inicio).asignatura.nombre }}
                  </div>
                  
                  <div class="text-muted small mt-1" style="font-size: 0.75rem;">
                     {{ getCelda(dia, franja.inicio).curso?.nombre || 'Sin curso' }}
                  </div>

                  <div v-if="getCelda(dia, franja.inicio).aula" class="mt-1">
                    <span class="badge bg-white text-secondary border shadow-sm" style="font-weight: normal;">
                      Aula {{ getCelda(dia, franja.inicio).aula.codigo }}
                    </span>
                  </div>
                </div>
                
                <div v-else class="text-muted opacity-25 small">
                  -
                </div>

              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import horarioService from '../services/horarioService'

// Props: Recibimos el ID desde el HomeView
const props = defineProps({
  idProfesor: {
    type: Number,
    required: true
  }
})

// --- ESTADO ---
const horarioActual = ref([])
const cargando = ref(false)

// Configuración de Días y Horas (Idéntica al Modal)
const diasSemana = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES']
const mapaDias = {
  'L': 'LUNES', 'M': 'MARTES', 'X': 'MIERCOLES', 'MI': 'MIERCOLES',
  'J': 'JUEVES', 'V': 'VIERNES', 'S': 'SABADO', 'D': 'DOMINGO'
}
// Ajusta estas horas si tu instituto tiene otras
// Configuración de franjas horarias (MAÑANA Y TARDE)
const franjasDefecto = [
  // --- TURNO MAÑANA ---
  { id: 1, inicio: '08:15', fin: '09:15' },
  { id: 2, inicio: '09:15', fin: '10:15' },
  { id: 3, inicio: '10:15', fin: '11:15' },
  // Recreo Mañana (11:15 - 11:45)
  { id: 4, inicio: '11:45', fin: '12:45' },
  { id: 5, inicio: '12:45', fin: '13:45' },
  { id: 6, inicio: '13:45', fin: '14:45' },

  // --- TURNO TARDE (Tu horario) ---
  { id: 7, inicio: '15:00', fin: '16:00' },  // de 3 a 4
  { id: 8, inicio: '16:00', fin: '17:00' },  // de 4 a 5
  { id: 9, inicio: '17:00', fin: '18:00' },  // de 5 a 6
  // Recreo Tarde (18:00 - 18:15)
  { id: 10, inicio: '18:15', fin: '19:15' }, // de 6:15 a 7:15
  { id: 11, inicio: '19:15', fin: '20:15' }, // de 7:15 a 8:15
  { id: 12, inicio: '20:15', fin: '21:15' }  // de 8:15 a 9:15
]

// --- CARGA DE DATOS ---
const cargarHorario = async () => {
  if (!props.idProfesor) return
  
  cargando.value = true
  try {
    horarioActual.value = await horarioService.obtenerHorarioProfesor(props.idProfesor)
  } catch (e) {
    console.error("Error al cargar horario en Home:", e)
  } finally {
    cargando.value = false
  }
}

// Escuchar cambios en el ID (Importante para cuando el Admin cambia el select)
watch(() => props.idProfesor, () => {
  cargarHorario()
}, { immediate: true })

// --- LÓGICA DE PINTADO (Copiada del Modal para consistencia) ---
const getCelda = (diaColumna, franjaInicio) => {
  const [horaTabla, minTabla] = franjaInicio.split(':').map(Number)

  return horarioActual.value.find(h => {
    if (!h.franja) return false
    
    // 1. Normalizar Día
    const diaBackRaw = h.dia ? h.dia.toUpperCase().trim() : ''
    const diaBackNormalizado = mapaDias[diaBackRaw] || diaBackRaw
    const coincideDia = diaBackNormalizado === diaColumna

    // 2. Normalizar Hora
    let horaBack, minBack
    const val = h.franja.horaInicio
    
    // Soporte para Array [8, 15] o String "08:15"
    if (Array.isArray(val)) { 
        horaBack = val[0]; minBack = val[1] 
    } else if (typeof val === 'string') { 
        const p = val.split(':'); horaBack = Number(p[0]); minBack = Number(p[1]) 
    } else {
        return false
    }
    
    return coincideDia && (horaBack === horaTabla) && (minBack === minTabla)
  })
}
</script>

<style scoped>
/* Altura mínima para que las celdas se vean uniformes aunque estén vacías */
.celda-horario {
  height: 100px; 
  vertical-align: middle;
  transition: background-color 0.3s;
}

/* Efecto hover suave para facilitar la lectura */
.celda-horario:hover {
  background-color: #f8f9fa !important; /* Gris muy clarito al pasar el ratón */
}

/* Si la celda está ocupada (azul), oscurecemos un poco el azul al pasar el ratón */
.bg-primary.bg-opacity-10:hover {
    background-color: rgba(13, 110, 253, 0.15) !important;
}
</style>