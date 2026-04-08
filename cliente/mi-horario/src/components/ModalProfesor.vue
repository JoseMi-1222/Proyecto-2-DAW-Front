<template>
  <div v-if="visible" class="modal-backdrop fade show"></div>
  
  <div v-if="visible" class="modal fade show d-block" tabindex="-1" @click.self="cerrar">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content border-0 shadow">
        
        <div class="modal-header bg-primary text-white">
          <h5 class="modal-title fw-bold">
            <i :class="modoEdicion ? 'bi-pencil-square' : 'bi-person-plus-fill'" class="me-2"></i>
            {{ modoEdicion ? 'Editar Profesor y Usuario' : 'Nuevo Profesor' }}
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

            <template v-if="!modoEdicion">
              <div class="mb-3">
                <label class="form-label fw-bold">Abreviatura</label>
                <input 
                  type="text" 
                  class="form-control" 
                  v-model="abreviatura" 
                  placeholder="Ej: MGL"
                  required
                >
              </div>

              <div class="mb-3">
                <label class="form-label fw-bold">Correo Electrónico</label>
                <input 
                  type="email" 
                  class="form-control" 
                  v-model="email" 
                  placeholder="profesor@iespoligonosur.org"
                  required
                >
              </div>

              <div class="alert alert-info py-2 small border-0 bg-light text-secondary">
                <i class="bi bi-info-circle me-1 text-primary"></i> 
                Se creará su perfil y su usuario de acceso. La contraseña por defecto será <strong>Cambiame123!</strong>
              </div>
            </template>

            <template v-if="modoEdicion && tieneUsuario">
              <div class="mb-3">
                <label class="form-label fw-bold">Correo Electrónico</label>
                <input 
                  type="email" 
                  class="form-control" 
                  v-model="email" 
                  placeholder="correo@ejemplo.com" 
                  required 
                />
              </div>

              <div class="mb-3">
                <label class="form-label fw-bold">Nueva Contraseña</label>
                <input 
                  type="password" 
                  class="form-control" 
                  v-model="password" 
                  placeholder="Dejar en blanco para no cambiarla" 
                />
              </div>
            </template>

            <div v-if="modoEdicion && !tieneUsuario" class="alert alert-warning py-2 small border-0">
              <i class="bi bi-exclamation-triangle me-1"></i> Este profesor no tiene un usuario web asignado.
            </div>

            <div v-if="error" class="alert alert-danger py-2 small">
              <i class="bi bi-exclamation-triangle me-1"></i> {{ error }}
            </div>

            <div class="d-flex justify-content-end gap-2 mt-4">
              <button type="button" class="btn btn-light" @click="cerrar">Cancelar</button>
              <button type="submit" class="btn btn-primary" :disabled="procesando">
                <span v-if="procesando" class="spinner-border spinner-border-sm me-2"></span>
                {{ modoEdicion ? 'Guardar Cambios' : 'Crear Profesor' }}
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
import usuarioService from '../services/usuarioService'

const props = defineProps({
  visible: Boolean,
  profesorAEditar: Object
})

const emit = defineEmits(['cerrar', 'guardar-exito'])

// Variables del formulario
const nombre = ref('')
const abreviatura = ref('')
const email = ref('')
const password = ref('')

// Estados
const procesando = ref(false)
const error = ref('')

// Computados
const modoEdicion = computed(() => !!props.profesorAEditar)
const tieneUsuario = computed(() => modoEdicion.value && !!props.profesorAEditar.usuario)

// Rellenamos el formulario al abrir
watch(() => props.visible, (val) => {
  if (val && props.profesorAEditar) {
    nombre.value = props.profesorAEditar.nombre || ''
    abreviatura.value = props.profesorAEditar.abreviatura || ''
    email.value = props.profesorAEditar.usuario?.email || ''
    password.value = '' // Siempre la vaciamos por seguridad
  } else {
    nombre.value = ''
    abreviatura.value = ''
    email.value = ''
    password.value = ''
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
      // 1. Actualizamos el nombre del Profesor
      await profesorService.actualizarProfesor(props.profesorAEditar.idProfesor, { 
        nombre: nombre.value 
      })

      // 2. Si tiene usuario, le actualizamos Email y/o Contraseña
      if (tieneUsuario.value) {
        const payloadUsuario = {
          nombre: nombre.value,
          email: email.value,
          rol: props.profesorAEditar.usuario.rol // Mantenemos el rol que ya tenía en BD
        }
        if (password.value) {
          payloadUsuario.password = password.value
        }
        
        await usuarioService.actualizar(props.profesorAEditar.usuario.id, payloadUsuario)
      }
      
      emit('guardar-exito', 'Profesor actualizado correctamente.')
      
    } else {
      // MODO CREACIÓN
      await profesorService.crearProfesorCompleto({ 
        nombre: nombre.value,
        abreviatura: abreviatura.value.toUpperCase(),
        email: email.value
      })
      emit('guardar-exito', 'Profesor y cuenta creados con éxito.')
    }
    cerrar()
  } catch (e) {
    console.error(e)
    error.value = e.response?.data?.message || e.response?.data?.error || "Ocurrió un error al procesar la solicitud."
  } finally {
    procesando.value = false
  }
}
</script>

<style scoped>
.modal.show { display: block; }
</style>