<template>
  <MenuLateral />

  <div class="contenedor-gestion">
    <div class="header-gestion d-flex justify-content-between align-items-center mb-4">
      <div>
        <h2 class="fw-bold mb-1"><i class="bi bi-shield-exclamation me-2 text-danger"></i>Panel de Guardias</h2>
        <p class="text-muted mb-0 fs-5">
          {{ fechaFormateada }} <span class="mx-2">|</span> 
          <i class="bi bi-clock me-1"></i> Hora actual: <strong class="text-primary">{{ horaFormateada }}</strong>
        </p>
      </div>
      <button class="btn btn-outline-primary shadow-sm" @click="cargarGuardias" :disabled="cargando">
        <i class="bi bi-arrow-clockwise me-2"></i>Actualizar
      </button>
    </div>

    <div v-if="cargando" class="text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
    </div>

    <div v-else class="card border-0 shadow-sm">
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-dark">
            <tr>
              <th class="ps-4">Franja / Hora</th>
              <th>Profesor Ausente</th>
              <th>Asignatura</th>
              <th>Aula</th>
              <th class="text-center pe-4">Estado</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="guardias.length === 0">
              <td colspan="5" class="text-center py-5 text-muted">
                <i class="bi bi-emoji-sunglasses fs-1 d-block mb-3 text-success"></i>
                <h5>Día perfecto</h5>
                <p>No hay ausencias registradas para el día de hoy.</p>
              </td>
            </tr>
            
            <tr v-for="(guardia, index) in guardias" :key="index" :class="{'clase-pasada bg-light': esClasePasada(guardia.horaFin)}" class="transicion-fila">
              <td class="ps-4 fw-bold text-primary">{{ guardia.franja }}</td>
              <td class="fw-bold">{{ guardia.nombreProfesor }}</td>
              <td><span class="badge bg-secondary bg-opacity-10 text-dark border">{{ guardia.asignatura }}</span></td>
              <td><i class="bi bi-door-open text-muted me-2 fs-5"></i> {{ guardia.aula }}</td>
              <td class="text-center pe-4">
                <span v-if="esClasePasada(guardia.horaFin)" class="badge bg-secondary">Finalizada</span>
                <span v-else class="badge bg-danger pulse-animation">Pendiente</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import MenuLateral from '../components/MenuLateral.vue'
import ausenciaService from '../services/ausenciaService'

const guardias = ref([])
const cargando = ref(false)

const tiempoActual = ref(new Date())
let temporizadorReloj = null
let temporizadorDatos = null

const fechaFormateada = computed(() => {
  return tiempoActual.value.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).replace(/^./, str => str.toUpperCase())
})

const horaFormateada = computed(() => {
  return tiempoActual.value.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
})

onMounted(() => {
  cargarGuardias() 
  
  temporizadorReloj = setInterval(() => {
    tiempoActual.value = new Date()
  }, 1000)


  temporizadorDatos = setInterval(() => {
    console.log("Refresco automático de guardias...");
    cargarGuardias()
  }, 60000) 
})

onUnmounted(() => {
  if (temporizadorReloj) clearInterval(temporizadorReloj)
  if (temporizadorDatos) clearInterval(temporizadorDatos)
})

onUnmounted(() => {
  if (temporizadorReloj) clearInterval(temporizadorReloj)
  if (temporizadorDatos) clearInterval(temporizadorDatos)
})

const cargarGuardias = async () => {
  cargando.value = true
  try {
    guardias.value = await ausenciaService.obtenerGuardiasDeHoy()
  } catch (error) {
    console.error("Error al cargar guardias:", error)
  } finally {
    cargando.value = false
  }
}

const esClasePasada = (horaFinStr) => {
  if (!horaFinStr) return false
  const partes = horaFinStr.split(':')
  if (partes.length < 2) return false

  const horaFin = new Date()
  horaFin.setHours(parseInt(partes[0], 10), parseInt(partes[1], 10), 0, 0)
  
  return tiempoActual.value > horaFin
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

.clase-pasada {
  opacity: 0.5;
  filter: grayscale(100%);
}

.clase-pasada td {
  text-decoration: line-through;
  text-decoration-color: #6c757d;
}

.transicion-fila {
  transition: all 0.5s ease-in-out;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

.pulse-animation {
  animation: pulse 2s infinite;
  display: inline-block;
}
</style>