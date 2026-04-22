<template>
  <div v-if="visible" class="modal-backdrop fade show"></div>
  
  <div v-if="visible" class="modal fade show d-block" tabindex="-1" @click.self="cerrar">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content border-0 shadow">
        
        <div class="modal-header text-white" :class="modoSustituto ? 'bg-info' : 'bg-primary'">
          <h5 class="modal-title fw-bold">
            <i :class="modoEdicion ? 'bi-pencil-square' : modoSustituto ? 'bi-briefcase-fill' : 'bi-person-plus-fill'" class="me-2"></i>
            {{ tituloModal }}
          </h5>
          <button type="button" class="btn-close btn-close-white" @click="cerrar"></button>
        </div>

        <div class="modal-body p-4">
          <form @submit.prevent="guardar">
            
            <div v-if="modoSustituto" class="alert alert-info py-2 small border-0 mb-3">
              <i class="bi bi-info-circle me-1 text-info"></i> 
              Estás creando un sustituto para <strong>{{ profesorAClonar.nombre }}</strong>. 
              El nuevo profesor heredará todas sus clases y el profesor original será desactivado temporalmente.
            </div>

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

              <div v-if="!modoSustituto" class="alert alert-primary bg-opacity-10 py-2 small border-0 text-secondary">
                <i class="bi bi-key me-1 text-primary"></i> 
                La contraseña por defecto será <strong>Cambiame123!</strong>
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
              <button type="submit" class="btn" :class="modoSustituto ? 'btn-info text-white' : 'btn-primary'" :disabled="procesando">
                <span v-if="procesando" class="spinner-border spinner-border-sm me-2"></span>
                {{ textoBotonGuardar }}
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
  profesorAEditar: Object,
  profesorAClonar: Object 
})

const emit = defineEmits(['cerrar', 'guardar-exito'])

const nombre = ref('')
const abreviatura = ref('')
const email = ref('')
const password = ref('')

const procesando = ref(false)
const error = ref('')

const modoEdicion = computed(() => !!props.profesorAEditar)
const modoSustituto = computed(() => !!props.profesorAClonar)
const tieneUsuario = computed(() => modoEdicion.value && !!props.profesorAEditar.usuario)

const tituloModal = computed(() => {
  if (modoEdicion.value) return 'Editar Profesor y Usuario'
  if (modoSustituto.value) return 'Registrar Sustituto'
  return 'Nuevo Profesor'
})

const textoBotonGuardar = computed(() => {
  if (modoEdicion.value) return 'Guardar Cambios'
  if (modoSustituto.value) return 'Crear Sustituto y Clonar Horario'
  return 'Crear Profesor'
})

watch(() => props.visible, (val) => {
  if (val) {
    if (props.profesorAEditar) {
      nombre.value = props.profesorAEditar.nombre || ''
      abreviatura.value = props.profesorAEditar.abreviatura || ''
      email.value = props.profesorAEditar.usuario?.email || ''
    } else {
      nombre.value = ''
      abreviatura.value = ''
      email.value = ''
    }
    password.value = ''
    error.value = ''
  }
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

      if (tieneUsuario.value) {
        const payloadUsuario = {
          nombre: nombre.value,
          email: email.value,
          rol: props.profesorAEditar.usuario.rol 
        }
        if (password.value) {
          payloadUsuario.password = password.value
        }
        await usuarioService.actualizar(props.profesorAEditar.usuario.id, payloadUsuario)
      }
      
      emit('guardar-exito', 'Profesor actualizado correctamente.')
      
    } else if (modoSustituto.value) {
      // --- NUEVA LÓGICA: CREAR SUSTITUTO ---
      await profesorService.crearSustituto(props.profesorAClonar.idProfesor, { 
        nombre: nombre.value,
        abreviatura: abreviatura.value.toUpperCase(),
        email: email.value
      })
      emit('guardar-exito', `Sustituto registrado. El horario de ${props.profesorAClonar.nombre} ha sido copiado.`)
      
    } else {

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
    error.value = e.response?.data?.message || e.response?.data || "Ocurrió un error al procesar la solicitud."
  } finally {
    procesando.value = false
  }
}
</script>

<style scoped>
.modal.show { display: block; }
</style>