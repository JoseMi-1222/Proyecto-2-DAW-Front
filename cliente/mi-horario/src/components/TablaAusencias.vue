<template>
  <div v-if="ausencias.length === 0" class="alert alert-info shadow-sm">
    <i class="bi bi-info-circle me-2"></i>No hay ausencias registradas.
  </div>

  <TransitionGroup name="fade" tag="div">
    <div v-for="ausenciaDia in ausencias" :key="ausenciaDia.fecha" class="mb-4">
      <div class="card shadow-sm border-0">
        <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
          <span class="fw-bold fs-5">
            <i class="bi bi-calendar-event me-2"></i>{{ formatFecha(ausenciaDia.fecha) }}
          </span>
          
          <div>
            <button 
              class="btn btn-sm btn-light text-primary me-2 fw-bold" 
              @click="$emit('justificarDia', ausenciaDia.fecha)"
              :disabled="todasJustificadas(ausenciaDia.lstAusenciaFecha)"
            >
              <i class="bi" :class="todasJustificadas(ausenciaDia.lstAusenciaFecha) ? 'bi-check-circle' : 'bi-upload'"></i>
              {{ todasJustificadas(ausenciaDia.lstAusenciaFecha) ? 'Día Justificado' : 'Subir Justificante' }}
            </button>

            <button class="btn btn-sm btn-danger border-0" 
                    @click="$emit('eliminarDia', { fecha: ausenciaDia.fecha })" 
                    title="Eliminar todo el día">
              <i class="bi bi-trash-fill"></i>
            </button>
          </div>
        </div>

        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th>Hora</th>
                <th>Asignatura</th>
                <th>Aula</th>
                <th>Curso</th>
                <th>Instrucciones</th>
                <th class="text-center">Estado</th>
                <th class="text-center">Acción</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="ausencia in ausenciaDia.lstAusenciaFecha" :key="ausencia.id">
                <td>
                  <span class="badge bg-light text-dark border">
                    {{ formatearHora(ausencia.horario.franja.horaInicio) }} - {{ formatearHora(ausencia.horario.franja.horaFin) }}
                  </span>
                </td>
                <td class="fw-bold text-primary">{{ ausencia.horario.asignatura.nombre }}</td>
                <td>{{ ausencia.horario.aula?.codigo || '—' }}</td>
                <td>{{ ausencia.horario.curso?.nombre || '—' }}</td>
                <td>{{ ausencia.descripcion }}</td>
                <td class="text-center">
                  <span class="badge rounded-pill" 
                        :class="ausencia.justificada ? 'bg-success' : 'bg-warning text-dark'">
                    {{ ausencia.justificada ? 'Justificada' : 'Pendiente' }}
                  </span>
                </td>
                <td class="text-center">
                  <button class="btn btn-sm btn-outline-danger border-0" 
                          @click="$emit('eliminarUna', { id: ausencia.id })" 
                          title="Eliminar esta hora">
                    <i class="bi bi-trash"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </TransitionGroup>
</template>

<script setup>
defineProps({
  ausencias: {
    type: Array,
    required: true,
    default: () => []
  }
});

defineEmits(['eliminarDia', 'eliminarUna', 'justificarDia']);

const formatFecha = (fechaISO) => {
  const fecha = new Date(fechaISO);
  return fecha.toLocaleDateString();
};

const formatearHora = (horaStr) => {
  if (!horaStr) return '';
  const [hh, mm] = horaStr.split(':');
  return `${hh}:${mm}`;
};

const todasJustificadas = (lista) => {
  return lista.every(a => a.justificada);
};
</script>

<style scoped>
.card { border-radius: 12px; }
.fade-enter-active, .fade-leave-active { transition: all 0.4s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(10px); }
</style>