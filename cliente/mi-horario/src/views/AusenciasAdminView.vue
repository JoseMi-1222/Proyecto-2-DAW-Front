<template>
  <MenuLateral />
  
  <div class="contenedor-admin">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2 class="fw-bold"><i class="bi bi-shield-lock me-2"></i>{{ $t('adminAbsences.title') }}</h2>
      
      <div class="input-group" style="max-width: 300px;">
        <span class="input-group-text bg-white border-end-0"><i class="bi bi-search"></i></span>
        <input 
          type="text" 
          class="form-control border-start-0 ps-0" 
          :placeholder="$t('adminAbsences.searchTeacher')" 
          v-model="busqueda"
        >
      </div>
    </div>

    <div v-if="cargando" class="text-center py-5">
      <div class="spinner-border text-primary"></div>
      <p class="mt-2 text-muted">{{ $t('adminAbsences.loading') }}</p>
    </div>

    <div v-else>
      <div v-if="ausenciasAgrupadas.length === 0" class="alert alert-info text-center">
        {{ $t('adminAbsences.noRecords') }}
      </div>

      <div v-for="grupo in ausenciasAgrupadas" :key="grupo.key" class="card mb-4 shadow-sm border-0">
        
        <div class="card-header bg-light border-0 d-flex justify-content-between align-items-center py-3">
          <h5 class="mb-0 fw-bold text-primary d-flex align-items-center">
            <i class="bi bi-calendar-event me-2"></i>
            {{ formatearFechaVisual(grupo.fecha) }}
            <span class="text-dark ms-2 fs-6"> - {{ grupo.profesorNombre }}</span>
          </h5>
          
          <div class="d-flex align-items-center gap-3">
            <button 
              v-if="tieneJustificantePendiente(grupo.ausencias)"
              class="btn btn-sm btn-success fw-bold px-3 shadow-sm" 
              :title="$t('adminAbsences.approveDay')"
              @click="aprobarJustificante(grupo.fecha, grupo.idProfesor)"
            >
              <i class="bi bi-check-circle-fill me-1"></i> {{ $t('adminAbsences.justifyAbsence') }}
            </button>
            
            <span class="badge bg-secondary">{{ grupo.ausencias.length }} {{ $t('adminAbsences.absencesCount') }}</span>
          </div>
        </div>
        
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-hover mb-0 align-middle">
              <thead class="table-light">
                <tr>
                  <th class="ps-4">{{ $t('adminAbsences.table.teacher') }}</th>
                  <th>{{ $t('adminAbsences.table.time') }}</th>
                  <th>{{ $t('adminAbsences.table.subjectGroup') }}</th>
                  <th class="text-center">{{ $t('adminAbsences.table.tasks') }}</th>
                  <th class="text-center">{{ $t('adminAbsences.table.proof') }}</th>
                  <th class="text-center">{{ $t('adminAbsences.table.status') }}</th>
                  <th class="text-center">{{ $t('adminAbsences.table.actions') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="ausencia in grupo.ausencias" :key="ausencia.id">
                  
                  <td class="ps-4">
                    <div class="d-flex align-items-center">
                      <div class="avatar-circle me-2 bg-primary text-white">
                        {{ obtenerIniciales(ausencia.horario?.profesor?.nombre) }}
                      </div>
                      <span class="fw-bold">
                        {{ ausencia.horario?.profesor?.nombre || $t('common.unknown') }}
                      </span>
                    </div>
                  </td>

                  <td class="text-nowrap font-monospace small">
                    {{ formatearHora(ausencia.horario?.franja?.horaInicio) }} - 
                    {{ formatearHora(ausencia.horario?.franja?.horaFin) }}
                  </td>

                  <td>
                    <span class="d-block text-truncate" style="max-width: 250px;">
                      {{ ausencia.horario?.asignatura?.nombre || $t('adminAbsences.noSubject') }}
                    </span>
                    <small class="text-muted">
                      {{ ausencia.horario?.curso?.nombre || '' }}
                      <span v-if="ausencia.horario?.aula?.codigo">
                         ({{ $t('common.classroom') }} {{ ausencia.horario.aula.codigo }})
                      </span>
                    </small>
                  </td>

                  <td class="text-center">
                    <div class="d-flex flex-column gap-1 align-items-center">
                      <span class="text-muted fst-italic text-wrap" style="max-width: 200px;">
                        "{{ ausencia.descripcion || ausencia.motivo || $t('adminAbsences.noInstructions') }}"
                      </span>
                      <button 
                        v-if="ausencia.archivoAdjunto"
                        @click="descargarArchivo(ausencia.archivoAdjunto)" 
                        class="btn btn-sm btn-outline-primary mt-1"
                        :title="$t('adminAbsences.downloadTask')"
                      >
                        <i class="bi bi-paperclip"></i> {{ $t('adminAbsences.task') }}
                      </button>
                    </div>
                  </td>

                  <td class="text-center">
                    <button 
                      v-if="ausencia.justificante"
                      @click="descargarArchivo(ausencia.justificante)" 
                      class="btn btn-sm btn-outline-info"
                      :title="$t('adminAbsences.downloadProof')"
                    >
                      <i class="bi bi-file-medical"></i> {{ $t('adminAbsences.viewProof') }}
                    </button>
                    <span v-else class="text-muted small">{{ $t('common.dash') }}</span>
                  </td>

                  <td class="text-center">
                    <span class="badge rounded-pill" 
                          :class="ausencia.justificada ? 'bg-success' : 'bg-warning text-dark'">
                      {{ ausencia.justificada ? $t('common.approved') : $t('common.pending') }}
                    </span>
                  </td>

                  <td class="text-center">
                    <button 
                      class="btn btn-sm btn-outline-danger border-0" 
                      :title="$t('adminAbsences.deleteAbsence')"
                      @click="confirmarEliminacion(ausencia)"
                    >
                      <i class="bi bi-trash-fill"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>

  <ModalConfirmacion 
    :visible="mostrarModal"
    :mensaje="$t('adminAbsences.confirmDelete')"
    @cerrar="mostrarModal = false"
    @confirmar="eliminarAusencia"
  />
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import ausenciaService from '../services/ausenciaService'
import MenuLateral from '../components/MenuLateral.vue'
import ModalConfirmacion from '../components/ModalConfirmacion.vue'
import api from '../axios' 

const ausencias = ref([])
const cargando = ref(true)
const busqueda = ref('')
const { t, locale } = useI18n()

const mostrarModal = ref(false)
const itemABorrar = ref(null)

onMounted(async () => {
  await cargarDatos()
})

const cargarDatos = async () => {
  cargando.value = true
  try {
    const data = await ausenciaService.obtenerTodasLasAusencias()
    ausencias.value = data
  } catch (error) {
    console.error("Error al cargar:", error)
  } finally {
    cargando.value = false
  }
}

const normalizarFecha = (fecha) => {
  if (!fecha) return t('adminAbsences.noDate')
  if (Array.isArray(fecha)) {
    const y = fecha[0]
    const m = String(fecha[1]).padStart(2, '0')
    const d = String(fecha[2]).padStart(2, '0')
    return `${y}-${m}-${d}`
  }
  return fecha
}

const ausenciasAgrupadas = computed(() => {
  if (!ausencias.value) return []

  let lista = ausencias.value

  if (busqueda.value) {
    const q = busqueda.value.toLowerCase()
    lista = lista.filter(a => a.horario?.profesor?.nombre?.toLowerCase().includes(q))
  }

  const gruposMap = new Map()
  
  lista.forEach(aus => {
    const fechaStr = normalizarFecha(aus.fecha)
    const idProf = aus.horario?.profesor?.idProfesor || 0
    const profName = aus.horario?.profesor?.nombre || t('common.unknown')
    
    const key = `${fechaStr}_${idProf}`
    
    if (!gruposMap.has(key)) {
      gruposMap.set(key, {
        key: key,
        fecha: fechaStr,
        idProfesor: idProf,
        profesorNombre: profName,
        ausencias: []
      })
    }
    gruposMap.get(key).ausencias.push(aus)
  })

  const resultado = Array.from(gruposMap.values())
  
  resultado.sort((a, b) => {
    const dateA = new Date(a.fecha)
    const dateB = new Date(b.fecha)
    if (dateB - dateA !== 0) return dateB - dateA
    return a.profesorNombre.localeCompare(b.profesorNombre)
  })
  
  return resultado
})

const tieneJustificantePendiente = (listaAusencias) => {
  return listaAusencias.some(a => a.justificante && !a.justificada)
}

const formatearHora = (hora) => {
  if (!hora) return '--:--'
  return hora.substring(0, 5)
}

const formatearFechaVisual = (fechaStr) => {
  if (!fechaStr || fechaStr === t('adminAbsences.noDate')) return fechaStr
  try {
    const f = new Date(fechaStr)
    const op = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
    const targetLocale = locale.value === 'en' ? 'en-US' : 'es-ES'
    const txt = f.toLocaleDateString(targetLocale, op)
    return txt.charAt(0).toUpperCase() + txt.slice(1)
  } catch (e) {
    return fechaStr
  }
}

const obtenerIniciales = (nombre) => {
  if (!nombre) return '?'
  return nombre.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
}

const descargarArchivo = async (nombreArchivo) => {
  try {
    const urlDescarga = `/ausencias/descargar-archivo/${encodeURIComponent(nombreArchivo)}`;
    const response = await api.get(urlDescarga, { responseType: 'blob' });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const enlaceCiego = document.createElement('a'); 
    
    enlaceCiego.href = url;
    
    const nombreLimpio = nombreArchivo.substring(nombreArchivo.indexOf('_') + 1);
    enlaceCiego.setAttribute('download', nombreLimpio);
    
    document.body.appendChild(enlaceCiego);
    enlaceCiego.click(); 
    
    document.body.removeChild(enlaceCiego);
    window.URL.revokeObjectURL(url);
    
  } catch (error) {
    console.error("Error al descargar el archivo:", error);
    alert(t('adminAbsences.downloadError'));
  }
}

const aprobarJustificante = async (fechaNorm, idProf) => {
  try {
    await api.patch('/ausencias/aprobar-justificante', {
      fecha: fechaNorm,
      idProfesor: idProf
    });
    
    await cargarDatos();
    
  } catch (error) {
    console.error("Error al aprobar justificante:", error);
    alert(t('adminAbsences.approveError'));
  }
}

const confirmarEliminacion = (item) => {
  itemABorrar.value = item
  mostrarModal.value = true
}

const eliminarAusencia = async () => {
  mostrarModal.value = false
  if(!itemABorrar.value) return

  try {
    const idProf = itemABorrar.value.horario?.profesor?.idProfesor
    const fechaNorm = normalizarFecha(itemABorrar.value.fecha)
    
    await ausenciaService.eliminarAusencia(itemABorrar.value.id, fechaNorm, idProf)
    await cargarDatos() 
  } catch (e) {
    console.error(e)
    alert(t('adminAbsences.deleteError'))
  }
}
</script>

<style scoped>
.contenedor-admin { 
  margin-top: 80px; 
  padding: 20px 50px; 
  margin-left: 250px; 
}
@media (max-width: 768px) {
  .contenedor-admin { margin-left: 0; padding: 20px; }
}
.avatar-circle {
  width: 35px; height: 35px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.8rem; font-weight: bold;
}
</style>