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
              {{ $t('teacherModal.substituteInfo1') }} <strong>{{ profesorAClonar.nombre }}</strong>. 
              {{ $t('teacherModal.substituteInfo2') }}
            </div>

            <div class="mb-3">
              <label class="form-label fw-bold">{{ $t('teacherModal.fullName') }}</label>
              <input 
                type="text" 
                class="form-control" 
                v-model="nombre" 
                :placeholder="$t('teacherModal.fullNamePlaceholder')"
                required
                autofocus
              >
            </div>

            <template v-if="!modoEdicion">
              <div class="mb-3">
                <label class="form-label fw-bold">{{ $t('teacherModal.shortName') }}</label>
                <input 
                  type="text" 
                  class="form-control" 
                  v-model="abreviatura" 
                  :placeholder="$t('teacherModal.shortNamePlaceholder')"
                  required
                >
              </div>

              <div class="mb-3">
                <label class="form-label fw-bold">{{ $t('teacherModal.email') }}</label>
                <input 
                  type="email" 
                  class="form-control" 
                  v-model="email" 
                  :placeholder="$t('teacherModal.emailPlaceholder')"
                  required
                >
              </div>

              <div v-if="!modoSustituto" class="alert alert-primary bg-opacity-10 py-2 small border-0 text-secondary">
                <i class="bi bi-key me-1 text-primary"></i> 
                {{ $t('teacherModal.defaultPasswordInfo') }} <strong>Cambiame123!</strong>
              </div>
            </template>

            <template v-if="modoEdicion && tieneUsuario">
              <div class="mb-3">
                <label class="form-label fw-bold">{{ $t('teacherModal.email') }}</label>
                <input 
                  type="email" 
                  class="form-control" 
                  v-model="email" 
                  :placeholder="$t('teacherModal.emailGenericPlaceholder')" 
                  required 
                />
              </div>

              <div class="mb-3">
                <label class="form-label fw-bold">{{ $t('teacherModal.newPassword') }}</label>
                <input 
                  type="password" 
                  class="form-control" 
                  v-model="password" 
                  :placeholder="$t('teacherModal.newPasswordPlaceholder')" 
                />
              </div>
            </template>

            <div v-if="modoEdicion && !tieneUsuario" class="alert alert-warning py-2 small border-0">
              <i class="bi bi-exclamation-triangle me-1"></i> {{ $t('teacherModal.noWebUser') }}
            </div>

            <div v-if="error" class="alert alert-danger py-2 small">
              <i class="bi bi-exclamation-triangle me-1"></i> {{ error }}
            </div>

            <div class="d-flex justify-content-end gap-2 mt-4">
              <button type="button" class="btn btn-light" @click="cerrar">{{ $t('common.cancel') }}</button>
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
import { useI18n } from 'vue-i18n'
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
const { t } = useI18n()

const modoEdicion = computed(() => !!props.profesorAEditar)
const modoSustituto = computed(() => !!props.profesorAClonar)
const tieneUsuario = computed(() => modoEdicion.value && !!props.profesorAEditar.usuario)

const tituloModal = computed(() => {
  if (modoEdicion.value) return t('teacherModal.editTeacherAndUser')
  if (modoSustituto.value) return t('teacherModal.registerSubstitute')
  return t('teacherModal.newTeacher')
})

const textoBotonGuardar = computed(() => {
  if (modoEdicion.value) return t('teacherModal.saveChanges')
  if (modoSustituto.value) return t('teacherModal.createSubstituteClone')
  return t('teacherModal.createTeacher')
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
      
      emit('guardar-exito', t('teacherModal.teacherUpdated'))
      
    } else if (modoSustituto.value) {
      // --- NUEVA LÓGICA: CREAR SUSTITUTO ---
      await profesorService.crearSustituto(props.profesorAClonar.idProfesor, { 
        nombre: nombre.value,
        abreviatura: abreviatura.value.toUpperCase(),
        email: email.value
      })
      emit('guardar-exito', t('teacherModal.substituteRegisteredCloned', { name: props.profesorAClonar.nombre }))
      
    } else {

      await profesorService.crearProfesorCompleto({ 
        nombre: nombre.value,
        abreviatura: abreviatura.value.toUpperCase(),
        email: email.value
      })
      emit('guardar-exito', t('teacherModal.teacherAndAccountCreated'))
    }
    cerrar()
  } catch (e) {
    console.error(e)
    error.value = e.response?.data?.message || e.response?.data || t('teacherModal.processRequestError')
  } finally {
    procesando.value = false
  }
}
</script>

<style scoped>
.modal.show { display: block; }
</style>