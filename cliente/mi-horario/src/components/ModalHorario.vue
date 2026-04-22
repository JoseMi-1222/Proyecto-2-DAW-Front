<template>
  <div v-if="visible" class="modal-backdrop fade show"></div>

  <div v-if="visible" class="modal fade show d-block" tabindex="-1" @click.self="cerrar">
    <div class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content border-0 shadow-lg">
        
        <div class="modal-header bg-dark text-white">
          <h5 class="modal-title fw-bold">
            <i class="bi bi-calendar-week me-2"></i>{{ $t('scheduleModal.title') }}: {{ profesor?.nombre }}
          </h5>
          <button type="button" class="btn-close btn-close-white" @click="cerrar"></button>
        </div>

        <div class="modal-body p-0 bg-light">
          <div v-if="cargando" class="text-center py-5">
            <div class="spinner-border text-primary"></div>
            <p class="mt-2 text-muted">{{ $t('scheduleModal.loading') }}</p>
          </div>

          <div v-else class="p-4">
            <div class="table-responsive rounded shadow-sm bg-white">
              <table class="table table-bordered text-center mb-0 align-middle">
                <thead class="bg-secondary text-white small text-uppercase">
                  <tr>
                    <th style="width: 100px;">{{ $t('schedule.time') }}</th>
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
                             {{ getCelda(dia, franja.inicio).curso?.nombre || $t('schedule.noCourse') }}
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
            <i class="bi bi-info-circle me-1"></i>{{ $t('scheduleModal.clickCellToEdit') }}
          </div>
          <button type="button" class="btn btn-light" @click="cerrar">{{ $t('common.cancel') }}</button>
          <button type="button" class="btn btn-primary" @click="guardarCambios" :disabled="guardando">
            <span v-if="guardando" class="spinner-border spinner-border-sm me-2"></span>
            {{ $t('teacherModal.saveChanges') }}
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
            <label class="form-label small fw-bold">{{ $t('scheduleModal.subject') }}</label>
            
            <input 
              type="text" 
              class="form-control form-control-sm" 
              :placeholder="$t('scheduleModal.searchSubject')" 
              v-model="busquedaAsignatura"
              @focus="mostrarLista = true"
              autocomplete="off"
            >
            
            <div v-if="mostrarLista && busquedaAsignatura" class="lista-flotante shadow-sm border rounded">
              <ul class="list-unstyled mb-0">
                <li @click="seleccionarAsignatura(null)" class="p-2 border-bottom text-muted fst-italic">
                  {{ $t('scheduleModal.freeSlotDelete') }}
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
                  {{ $t('scheduleModal.noMatches') }}
                </li>
              </ul>
            </div>

            <div v-if="asignaturaSeleccionada" class="mt-1 small text-primary fw-bold">
              <i class="bi bi-check-circle me-1"></i> {{ asignaturaSeleccionada.nombre }}
            </div>
          </div>

          <div class="mb-3">
            <label class="form-label small fw-bold">{{ $t('scheduleModal.courseGroup') }}</label>
            <select class="form-select form-select-sm" v-model="cursoSeleccionado">
              <option :value="null">{{ $t('scheduleModal.noSpecificCourse') }}</option>
              <option v-for="curso in listaCursos" :key="curso.id" :value="curso">
                {{ curso.nombre }}
              </option>
            </select>
          </div>
          
          <button class="btn btn-primary btn-sm w-100" @click="confirmarEdicionCelda">{{ $t('scheduleModal.applyChange') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import horarioService from '../services/horarioService'

const props = defineProps({
  visible: Boolean,
  profesor: Object
})

const emit = defineEmits(['cerrar', 'guardar-exito'])

const horarioActual = ref([])
const listaAsignaturas = ref([])
const listaCursos = ref([])
const cargando = ref(false)
const guardando = ref(false)

const celdaEditando = ref(null) 
const asignaturaSeleccionada = ref(null)
const cursoSeleccionado = ref(null)

const busquedaAsignatura = ref('')
const mostrarLista = ref(false)
const { t } = useI18n()

const diasSemana = computed(() => [
  t('schedule.days.monday'),
  t('schedule.days.tuesday'),
  t('schedule.days.wednesday'),
  t('schedule.days.thursday'),
  t('schedule.days.friday')
])
const mapaDias = {
  'L': 'monday', 'M': 'tuesday', 'X': 'wednesday', 'MI': 'wednesday',
  'J': 'thursday', 'V': 'friday', 'S': 'saturday', 'D': 'sunday'
}
const franjasDefecto = [
  { id: 1, inicio: '08:15', fin: '09:15' },
  { id: 2, inicio: '09:15', fin: '10:15' },
  { id: 3, inicio: '10:15', fin: '11:15' },
  { id: 4, inicio: '11:45', fin: '12:45' },
  { id: 5, inicio: '12:45', fin: '13:45' },
  { id: 6, inicio: '13:45', fin: '14:45' },

  { id: 7, inicio: '15:00', fin: '16:00' },
  { id: 8, inicio: '16:00', fin: '17:00' },
  { id: 9, inicio: '17:00', fin: '18:00' },
  { id: 10, inicio: '18:15', fin: '19:15' },
  { id: 11, inicio: '19:15', fin: '20:15' },
  { id: 12, inicio: '20:15', fin: '21:15' }
]

const asignaturasFiltradas = computed(() => {
  if (!busquedaAsignatura.value) return []
  const termino = busquedaAsignatura.value.toLowerCase()
  return listaAsignaturas.value.filter(a => 
    a.nombre.toLowerCase().includes(termino)
  )
})

watch(() => props.visible, async (val) => {
  if (val && props.profesor) {
    cargando.value = true
    try {
      if (listaAsignaturas.value.length === 0) {
        listaAsignaturas.value = await horarioService.obtenerAsignaturas()
      }
      
      if (listaCursos.value.length === 0) {
          listaCursos.value = await horarioService.obtenerCursos()
      }

      horarioActual.value = await horarioService.obtenerHorarioProfesor(props.profesor.idProfesor)
    } catch (e) {
      console.error("Error cargando datos:", e)
    } finally {
      cargando.value = false
    }
  }
})

const getCelda = (diaColumna, franjaInicio) => {
  const [horaTabla, minTabla] = franjaInicio.split(':').map(Number)

  return horarioActual.value.find(h => {
    if (!h.franja) return false
    
    const diaBackRaw = h.dia ? h.dia.toUpperCase().trim() : ''
    const diaBackNormalizado = mapaDias[diaBackRaw]
    const diaTraducido = diaBackNormalizado ? t(`schedule.days.${diaBackNormalizado}`) : diaBackRaw
    const coincideDia = diaTraducido === diaColumna

    let horaBack, minBack
    const val = h.franja.horaInicio
    if (Array.isArray(val)) { horaBack = val[0]; minBack = val[1] } 
    else if (typeof val === 'string') { const p = val.split(':'); horaBack = Number(p[0]); minBack = Number(p[1]) } 
    else return false
    
    return coincideDia && (horaBack === horaTabla) && (minBack === minTabla)
  })
}

const editarCelda = (dia, franja) => {
  const celda = getCelda(dia, franja.inicio)
  celdaEditando.value = { dia, franja }
  
  if (celda) {
      asignaturaSeleccionada.value = celda.asignatura
      cursoSeleccionado.value = celda.curso
      busquedaAsignatura.value = celda.asignatura.nombre
  } else {
      asignaturaSeleccionada.value = null
      cursoSeleccionado.value = null
      busquedaAsignatura.value = ''
  }
    mostrarLista.value = false
}

const seleccionarAsignatura = (asig) => {
    asignaturaSeleccionada.value = asig
    if (asig) {
        busquedaAsignatura.value = asig.nombre
    } else {
        busquedaAsignatura.value = ''
    }
    mostrarLista.value = false
}

const cerrarEdicionCelda = () => {
  celdaEditando.value = null
  asignaturaSeleccionada.value = null
  cursoSeleccionado.value = null
  busquedaAsignatura.value = ''
}

const confirmarEdicionCelda = () => {
  const { dia, franja } = celdaEditando.value
  
  horarioActual.value = horarioActual.value.filter(h => {
    const diaBackRaw = h.dia ? h.dia.toUpperCase().trim() : ''
    const diaBackNormalizado = mapaDias[diaBackRaw] ? t(`schedule.days.${mapaDias[diaBackRaw]}`) : diaBackRaw
    
    let horaBack, minBack
    const val = h.franja.horaInicio
    if (Array.isArray(val)) { horaBack=val[0]; minBack=val[1]; }
    else if (typeof val==='string') { const p=val.split(':'); horaBack=Number(p[0]); minBack=Number(p[1]); }
    
    const [hTabla, mTabla] = franja.inicio.split(':').map(Number)
    return !(diaBackNormalizado === dia && horaBack === hTabla && minBack === mTabla)
  })
  
  if (asignaturaSeleccionada.value) {
    const [hTabla, mTabla] = franja.inicio.split(':').map(Number)
    
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
      curso: cursoSeleccionado.value
    })
  }
  
  cerrarEdicionCelda()
}

const guardarCambios = async () => {
  guardando.value = true
  try {
    await horarioService.guardarHorario(props.profesor.idProfesor, horarioActual.value)
    emit('guardar-exito', t('scheduleModal.updatedSuccessfully'))
    emit('cerrar')
  } catch (e) {
    console.error(e)
    alert(t('scheduleModal.saveError'))
  } finally {
    guardando.value = false
  }
}

const cerrar = () => emit('cerrar')
</script>

<style scoped>
.modal.show { display: block; }
.celda-horario:hover { background-color: #f8f9fa; }
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