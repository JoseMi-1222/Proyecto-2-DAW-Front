<template>
  <div v-if="visible" class="modal-backdrop fade show"></div>

  <div v-if="visible" class="modal fade show d-block" tabindex="-1" @click.self="cerrar">
    <div class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content border-0 shadow-lg">
        
        <div class="modal-header bg-dark text-white">
          <h5 class="modal-title fw-bold">
            <i class="bi bi-calendar-week me-2"></i>Horario: {{ profesor?.nombre }}
          </h5>
          <button type="button" class="btn-close btn-close-white" @click="cerrar"></button>
        </div>

        <div class="modal-body p-0 bg-light">
          <div v-if="cargando" class="text-center py-5">
            <div class="spinner-border text-primary"></div>
            <p class="mt-2 text-muted">Cargando horario...</p>
          </div>

          <div v-else class="p-4">
            <div class="table-responsive rounded shadow-sm bg-white">
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
                      class="celda-horario position-relative p-0"
                      :class="{'bg-white': !getCelda(dia, franja.inicio), 'bg-primary bg-opacity-10': getCelda(dia, franja.inicio)}"
                      @click="editarCelda(dia, franja)"
                      style="cursor: pointer; transition: background 0.2s;"
                    >
                      <div class="w-100 h-100 p-2 d-flex flex-column justify-content-center" style="min-height: 80px;">
                        
                        <div v-if="getCelda(dia, franja.inicio)">
                          <div class="fw-bold text-primary small">{{ getCelda(dia, franja.inicio).asignatura.nombre }}</div>
                          <div class="text-muted small" style="font-size: 0.75rem;">
                             {{ getCelda(dia, franja.inicio).curso?.nombre || 'Sin curso' }}
                          </div>
                        </div>
                        
                        <div v-else class="text-muted opacity-25">
                          <i class="bi bi-plus-lg fs-4"></i>
                        </div>

                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div class="modal-footer bg-white">
          <div class="me-auto text-muted small">
            <i class="bi bi-info-circle me-1"></i>Haz clic en una casilla para editar.
          </div>
          <button type="button" class="btn btn-light" @click="cerrar">Cancelar</button>
          <button type="button" class="btn btn-primary" @click="guardarCambios" :disabled="guardando">
            <span v-if="guardando" class="spinner-border spinner-border-sm me-2"></span>
            Guardar Cambios
          </button>
        </div>

      </div>
    </div>
  </div>

  <div v-if="celdaEditando" class="modal fade show d-block" style="z-index: 1060;" tabindex="-1">
    <div class="modal-backdrop fade show" style="z-index: 1055;"></div>
    <div class="modal-dialog modal-sm modal-dialog-centered" style="z-index: 1065;">
      <div class="modal-content shadow border-0">
        <div class="modal-header py-2 bg-primary text-white">
          <strong class="modal-title small">{{ celdaEditando.dia }} - {{ celdaEditando.franja.inicio }}</strong>
          <button type="button" class="btn-close btn-close-white btn-sm" @click="cerrarEdicionCelda"></button>
        </div>
        
        <div class="modal-body">
          
          <div class="mb-3 position-relative">
            <label class="form-label small fw-bold">Asignatura</label>
            
            <input 
              type="text" 
              class="form-control form-control-sm" 
              placeholder="Buscar asignatura..." 
              v-model="busquedaAsignatura"
              @focus="mostrarLista = true"
              autocomplete="off"
            >
            
            <div v-if="mostrarLista && busquedaAsignatura" class="lista-flotante shadow-sm border rounded">
              <ul class="list-unstyled mb-0">
                <li @click="seleccionarAsignatura(null)" class="p-2 border-bottom text-muted fst-italic">
                  -- Hora Libre (Borrar) --
                </li>
                <li 
                  v-for="asig in asignaturasFiltradas" 
                  :key="asig.id" 
                  @click="seleccionarAsignatura(asig)"
                  class="p-2 border-bottom"
                >
                  {{ asig.nombre }}
                </li>
                <li v-if="asignaturasFiltradas.length === 0" class="p-2 text-muted text-center small">
                  No hay coincidencias
                </li>
              </ul>
            </div>

            <div v-if="asignaturaSeleccionada" class="mt-1 small text-primary fw-bold">
              <i class="bi bi-check-circle me-1"></i> {{ asignaturaSeleccionada.nombre }}
            </div>
          </div>

          <div class="mb-3">
            <label class="form-label small fw-bold">Curso / Grupo</label>
            <select class="form-select form-select-sm" v-model="cursoSeleccionado">
              <option :value="null">-- Sin Curso Específico --</option>
              <option v-for="curso in listaCursos" :key="curso.id" :value="curso">
                {{ curso.nombre }}
              </option>
            </select>
          </div>
          
          <button class="btn btn-primary btn-sm w-100" @click="confirmarEdicionCelda">Aplicar Cambio</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import horarioService from '../services/horarioService'

const props = defineProps({
  visible: Boolean,
  profesor: Object
})

const emit = defineEmits(['cerrar', 'guardar-exito'])

// --- ESTADO ---
const horarioActual = ref([])
const listaAsignaturas = ref([])
const listaCursos = ref([]) // Lista de cursos disponibles
const cargando = ref(false)
const guardando = ref(false)

// Variables para edición
const celdaEditando = ref(null) 
const asignaturaSeleccionada = ref(null)
const cursoSeleccionado = ref(null) // Curso elegido en el modal pequeño

// Variables para el buscador
const busquedaAsignatura = ref('')
const mostrarLista = ref(false)

// Configuración visual
const diasSemana = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES']
const mapaDias = {
  'L': 'LUNES', 'M': 'MARTES', 'X': 'MIERCOLES', 'MI': 'MIERCOLES',
  'J': 'JUEVES', 'V': 'VIERNES', 'S': 'SABADO', 'D': 'DOMINGO'
}
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

// --- COMPUTED: Filtrado del buscador ---
const asignaturasFiltradas = computed(() => {
  if (!busquedaAsignatura.value) return []
  const termino = busquedaAsignatura.value.toLowerCase()
  return listaAsignaturas.value.filter(a => 
    a.nombre.toLowerCase().includes(termino)
  )
})

// --- CARGA DE DATOS ---
watch(() => props.visible, async (val) => {
  if (val && props.profesor) {
    cargando.value = true
    try {
      // 1. Cargar asignaturas
      if (listaAsignaturas.value.length === 0) {
        listaAsignaturas.value = await horarioService.obtenerAsignaturas()
      }
      
      // 2. Cargar cursos (NUEVO)
      if (listaCursos.value.length === 0) {
          listaCursos.value = await horarioService.obtenerCursos()
      }

      // 3. Cargar horario
      horarioActual.value = await horarioService.obtenerHorarioProfesor(props.profesor.idProfesor)
    } catch (e) {
      console.error("Error cargando datos:", e)
    } finally {
      cargando.value = false
    }
  }
})

// --- LÓGICA: Obtener Celda para pintar ---
const getCelda = (diaColumna, franjaInicio) => {
  const [horaTabla, minTabla] = franjaInicio.split(':').map(Number)

  return horarioActual.value.find(h => {
    if (!h.franja) return false
    
    // Normalizar día
    const diaBackRaw = h.dia ? h.dia.toUpperCase().trim() : ''
    const diaBackNormalizado = mapaDias[diaBackRaw] || diaBackRaw
    const coincideDia = diaBackNormalizado === diaColumna

    // Normalizar hora
    let horaBack, minBack
    const val = h.franja.horaInicio
    if (Array.isArray(val)) { horaBack = val[0]; minBack = val[1] } 
    else if (typeof val === 'string') { const p = val.split(':'); horaBack = Number(p[0]); minBack = Number(p[1]) } 
    else return false
    
    return coincideDia && (horaBack === horaTabla) && (minBack === minTabla)
  })
}

// --- LÓGICA: Abrir Modal Edición ---
const editarCelda = (dia, franja) => {
  const celda = getCelda(dia, franja.inicio)
  celdaEditando.value = { dia, franja }
  
  if (celda) {
      // Si ya hay algo, rellenamos los campos
      asignaturaSeleccionada.value = celda.asignatura
      cursoSeleccionado.value = celda.curso // Asignamos el curso actual
      busquedaAsignatura.value = celda.asignatura.nombre // Ponemos el nombre en el input
  } else {
      // Limpiamos si es nuevo
      asignaturaSeleccionada.value = null
      cursoSeleccionado.value = null
      busquedaAsignatura.value = ''
  }
  mostrarLista.value = false // Lista oculta al inicio
}

// --- LÓGICA: Seleccionar desde la lista del buscador ---
const seleccionarAsignatura = (asig) => {
    asignaturaSeleccionada.value = asig
    if (asig) {
        busquedaAsignatura.value = asig.nombre
    } else {
        busquedaAsignatura.value = ''
    }
    mostrarLista.value = false
}

// --- LÓGICA: Cerrar y Limpiar Modal Edición ---
const cerrarEdicionCelda = () => {
  celdaEditando.value = null
  asignaturaSeleccionada.value = null
  cursoSeleccionado.value = null
  busquedaAsignatura.value = ''
}

// --- LÓGICA: Confirmar cambio localmente ---
const confirmarEdicionCelda = () => {
  const { dia, franja } = celdaEditando.value
  
  // 1. Eliminamos cualquier entrada previa en esa celda
  horarioActual.value = horarioActual.value.filter(h => {
    const diaBackRaw = h.dia ? h.dia.toUpperCase().trim() : ''
    const diaBackNormalizado = mapaDias[diaBackRaw] || diaBackRaw
    
    let horaBack, minBack
    const val = h.franja.horaInicio
    if (Array.isArray(val)) { horaBack=val[0]; minBack=val[1]; }
    else if (typeof val==='string') { const p=val.split(':'); horaBack=Number(p[0]); minBack=Number(p[1]); }
    
    const [hTabla, mTabla] = franja.inicio.split(':').map(Number)
    return !(diaBackNormalizado === dia && horaBack === hTabla && minBack === mTabla)
  })
  
  // 2. Si hay asignatura seleccionada, añadimos la nueva entrada
  if (asignaturaSeleccionada.value) {
    const [hTabla, mTabla] = franja.inicio.split(':').map(Number)
    
    // Intentamos recuperar la ID de la franja real si existe en otra celda
    const entradaExistente = horarioActual.value.find(h => {
        let hBack, mBack
        const val = h.franja.horaInicio
        if (Array.isArray(val)) { hBack=val[0]; mBack=val[1]; }
        else if (typeof val==='string') { const p=val.split(':'); hBack=Number(p[0]); mBack=Number(p[1]); }
        return hBack === hTabla && mBack === mTabla
    })
    
    const franjaObjeto = entradaExistente ? entradaExistente.franja : { idFranja: franja.id, horaInicio: franja.inicio }

    horarioActual.value.push({
      dia: dia, 
      franja: franjaObjeto,
      asignatura: asignaturaSeleccionada.value,
      profesor: { idProfesor: props.profesor.idProfesor }, 
      curso: cursoSeleccionado.value // <-- Aquí guardamos el curso
    })
  }
  
  cerrarEdicionCelda()
}

// --- GUARDAR EN BACKEND ---
const guardarCambios = async () => {
  guardando.value = true
  try {
    await horarioService.guardarHorario(props.profesor.idProfesor, horarioActual.value)
    emit('guardar-exito', 'Horario actualizado correctamente.')
    emit('cerrar')
  } catch (e) {
    console.error(e)
    alert('Error al guardar el horario.')
  } finally {
    guardando.value = false
  }
}

const cerrar = () => emit('cerrar')
</script>

<style scoped>
.modal.show { display: block; }
.celda-horario:hover { background-color: #f8f9fa; }

/* Estilos para la lista desplegable del buscador */
.lista-flotante {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  max-height: 150px;
  overflow-y: auto;
  background: white;
  z-index: 1070;
}

.lista-flotante li {
  cursor: pointer;
  font-size: 0.9rem;
}

.lista-flotante li:hover {
  background-color: #e9ecef;
  color: #0d6efd;
}
</style>