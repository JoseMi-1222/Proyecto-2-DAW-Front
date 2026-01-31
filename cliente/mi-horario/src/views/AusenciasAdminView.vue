<template>
  <MenuLateral />
  
  <div class="contenedor-admin">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2 class="fw-bold"><i class="bi bi-shield-lock me-2"></i>Control de Ausencias (Global)</h2>
      
      <div class="input-group" style="max-width: 300px;">
        <span class="input-group-text bg-white border-end-0"><i class="bi bi-search"></i></span>
        <input 
          type="text" 
          class="form-control border-start-0 ps-0" 
          placeholder="Buscar profesor..." 
          v-model="busqueda"
        >
      </div>
    </div>

    <div v-if="cargando" class="text-center py-5">
      <div class="spinner-border text-primary"></div>
      <p class="mt-2 text-muted">Cargando registros...</p>
    </div>

    <div v-else>
      <div v-if="Object.keys(ausenciasAgrupadas).length === 0" class="alert alert-info text-center">
        No hay ausencias registradas (o no coinciden con la búsqueda).
      </div>

      <div v-for="(listaAusencias, fecha) in ausenciasAgrupadas" :key="fecha" class="card mb-4 shadow-sm border-0">
        <div class="card-header bg-light border-0 d-flex justify-content-between align-items-center py-3">
          <h5 class="mb-0 fw-bold text-primary">
            <i class="bi bi-calendar-event me-2"></i>{{ formatearFechaVisual(fecha) }}
          </h5>
          <span class="badge bg-secondary">{{ listaAusencias.length }} ausencias</span>
        </div>
        
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-hover mb-0 align-middle">
              <thead class="table-light">
                <tr>
                  <th class="ps-4">Profesor</th>
                  <th>Hora</th>
                  <th>Asignatura / Grupo</th>
                  <th>Motivo</th>
                  <th class="text-end pe-4">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="ausencia in listaAusencias" :key="ausencia.id">
                  
                  <td class="ps-4">
                    <div class="d-flex align-items-center">
                      <div class="avatar-circle me-2 bg-primary text-white">
                        {{ obtenerIniciales(ausencia.horario?.profesor?.nombre) }}
                      </div>
                      <span class="fw-bold">
                        {{ ausencia.horario?.profesor?.nombre || 'Desconocido' }}
                      </span>
                    </div>
                  </td>

                  <td class="text-nowrap font-monospace small">
                    {{ formatearHora(ausencia.horario?.franja?.horaInicio) }} - 
                    {{ formatearHora(ausencia.horario?.franja?.horaFin) }}
                  </td>

                  <td>
                    <span class="d-block text-truncate" style="max-width: 250px;">
                      {{ ausencia.horario?.asignatura?.nombre || 'Guardia / Sin asignatura' }}
                    </span>
                    <small class="text-muted">
                      {{ ausencia.horario?.curso?.nombre || '' }}
                      <span v-if="ausencia.horario?.aula?.codigo">
                         (Aula {{ ausencia.horario.aula.codigo }})
                      </span>
                    </small>
                  </td>

                  <td>
                    <span class="text-muted fst-italic">
                      "{{ ausencia.descripcion || ausencia.motivo || 'Sin motivo' }}"
                    </span>
                  </td>

                  <td class="text-end pe-4">
                    <button 
                      class="btn btn-sm btn-outline-danger border-0" 
                      title="Eliminar"
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
    mensaje="¿Seguro que quieres borrar esta ausencia? Se eliminará permanentemente."
    @cerrar="mostrarModal = false"
    @confirmar="eliminarAusencia"
  />
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import ausenciaService from '../services/ausenciaService'
import MenuLateral from '../components/MenuLateral.vue'
import ModalConfirmacion from '../components/ModalConfirmacion.vue'

const ausencias = ref([])
const cargando = ref(true)
const busqueda = ref('')

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

// --- NORMALIZACIÓN FECHAS ---
const normalizarFecha = (fecha) => {
  if (!fecha) return 'Sin Fecha'
  if (Array.isArray(fecha)) {
    const y = fecha[0]
    const m = String(fecha[1]).padStart(2, '0')
    const d = String(fecha[2]).padStart(2, '0')
    return `${y}-${m}-${d}`
  }
  return fecha
}

// --- AGRUPACIÓN Y ORDENACIÓN ---
const ausenciasAgrupadas = computed(() => {
  if (!ausencias.value) return {}

  let lista = ausencias.value

  // 1. FILTRO (Ahora buscando dentro de horario.profesor)
  if (busqueda.value) {
    const q = busqueda.value.toLowerCase()
    lista = lista.filter(a => a.horario?.profesor?.nombre?.toLowerCase().includes(q))
  }

  // 2. AGRUPAR
  const grupos = {}
  lista.forEach(aus => {
    const fechaStr = normalizarFecha(aus.fecha)
    if (!grupos[fechaStr]) grupos[fechaStr] = []
    grupos[fechaStr].push(aus)
  })

  // 3. ORDENAR (Por nombre de profesor dentro del horario)
  Object.keys(grupos).forEach(fecha => {
    grupos[fecha].sort((a, b) => {
      const nA = (a.horario?.profesor?.nombre || '').toLowerCase()
      const nB = (b.horario?.profesor?.nombre || '').toLowerCase()
      
      // Primero alfabético por profesor
      if (nA < nB) return -1
      if (nA > nB) return 1

      // Si es el mismo, por hora
      const hA = a.horario?.franja?.horaInicio || ''
      const hB = b.horario?.franja?.horaInicio || ''
      return hA.localeCompare(hB)
    })
  })

  // 4. ORDENAR FECHAS (Descendente)
  const fechasOrdenadas = Object.keys(grupos).sort((a, b) => new Date(b) - new Date(a))
  
  const resultado = {}
  fechasOrdenadas.forEach(key => resultado[key] = grupos[key])
  
  return resultado
})

// --- FORMATO HORA (Quitar los segundos :00) ---
const formatearHora = (hora) => {
  if (!hora) return '--:--'
  // Si viene "08:15:00", devolvemos "08:15"
  return hora.substring(0, 5)
}

const formatearFechaVisual = (fechaStr) => {
  if (!fechaStr || fechaStr === 'Sin Fecha') return fechaStr
  try {
    const f = new Date(fechaStr)
    const op = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
    const txt = f.toLocaleDateString('es-ES', op)
    return txt.charAt(0).toUpperCase() + txt.slice(1)
  } catch (e) {
    return fechaStr
  }
}

const obtenerIniciales = (nombre) => {
  if (!nombre) return '?'
  return nombre.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
}

// --- ELIMINAR ---
const confirmarEliminacion = (item) => {
  itemABorrar.value = item
  mostrarModal.value = true
}

const eliminarAusencia = async () => {
  mostrarModal.value = false
  if(!itemABorrar.value) return

  try {
    // RECUPERAR ID PROFESOR CORRECTO DESDE EL OBJETO ANIDADO
    const idProf = itemABorrar.value.horario?.profesor?.idProfesor
    const fechaNorm = normalizarFecha(itemABorrar.value.fecha)
    
    await ausenciaService.eliminarAusencia(itemABorrar.value.id, fechaNorm, idProf)
    await cargarDatos() 
  } catch (e) {
    console.error(e)
    alert("Error al eliminar.")
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