<template>
  <div v-if="visible" class="modal-backdrop fade show"></div>
  
  <div v-if="visible" class="modal fade show d-block" tabindex="-1" @click.self="cerrar">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content border-0 shadow">
        
        <div class="modal-header bg-primary text-white">
          <h5 class="modal-title fw-bold">
            <i :class="modoEdicion ? 'bi-pencil-square' : 'bi-person-plus-fill'" class="me-2"></i>
            {{ modoEdicion ? 'Editar Profesor' : 'Nuevo Profesor' }}
          </h5>
          <button type="button" class="btn-close btn-close-white" @click="cerrar"></button>
        </div>

        <div class="modal-body p-4">
          <form @submit.prevent="guardar">
            <div class="mb-3">
              <label class="form-label fw-bold">Nombre y Apellidos</label>
              <input 
                type="text" 
                class="form-control" 
                v-model="nombre" 
                placeholder="Ej: María García López"
                required
                autofocus
              >
            </div>

            <div v-if="error" class="alert alert-danger py-2 small">
              {{ error }}
            </div>

            <div class="d-flex justify-content-end gap-2 mt-4">
              <button type="button" class="btn btn-light" @click="cerrar">Cancelar</button>
              <button type="submit" class="btn btn-primary" :disabled="procesando">
                <span v-if="procesando" class="spinner-border spinner-border-sm me-2"></span>
                {{ modoEdicion ? 'Actualizar' : 'Guardar' }}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import profesorService from '../services/profesorService'

const props = defineProps({
  visible: Boolean,
  profesorAEditar: Object
})

const emit = defineEmits(['cerrar', 'guardar-exito'])

const nombre = ref('')
const procesando = ref(false)
const error = ref('')

const modoEdicion = computed(() => !!props.profesorAEditar)

watch(() => props.visible, (val) => {
  if (val && props.profesorAEditar) {
    nombre.value = props.profesorAEditar.nombre
  } else {
    nombre.value = ''
  }
  error.value = ''
})

const cerrar = () => emit('cerrar')

const guardar = async () => {
  if (!nombre.value.trim()) return
  procesando.value = true
  error.value = ''
  
  try {
    if (modoEdicion.value) {
      await profesorService.actualizarProfesor(props.profesorAEditar.idProfesor, { 
        nombre: nombre.value 
      })
      // --- CAMBIO AQUÍ: Mensaje para actualizar ---
      emit('guardar-exito', 'Profesor actualizado correctamente.')
    } else {
      await profesorService.crearProfesor({ 
        nombre: nombre.value 
      })
      // --- CAMBIO AQUÍ: Mensaje para crear ---
      emit('guardar-exito', 'Profesor creado con éxito.')
    }
    cerrar()
  } catch (e) {
    console.error(e)
    error.value = "Ocurrió un error al procesar la solicitud."
  } finally {
    procesando.value = false
  }
}
</script>

<style scoped>
.modal.show { display: block; }
</style>