<template>
  <div v-if="visible" class="modal-backdrop fade show"></div>
  
  <div v-if="visible" class="modal fade show d-block" tabindex="-1" @click.self="cerrar">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content border-0 shadow">
        
        <div class="modal-header bg-success text-white">
          <h5 class="modal-title fw-bold">
            <i class="bi bi-person-badge-fill me-2"></i>{{ $t('assignUser.title') }}
          </h5>
          <button type="button" class="btn-close btn-close-white" @click="cerrar"></button>
        </div>

        <div class="modal-body p-4">
          <div v-if="cargandoLista" class="text-center py-3">
            <div class="spinner-border text-success" role="status"></div>
            <p class="mt-2 text-muted">{{ $t('assignUser.loadingTeachers') }}</p>
          </div>

          <div v-else-if="profesoresDisponibles.length === 0" class="text-center py-4">
            <i class="bi bi-check-circle-fill text-success fs-1"></i>
            <p class="mt-3">{{ $t('assignUser.allAssigned') }}</p>
            <button class="btn btn-outline-secondary btn-sm" @click="cerrar">{{ $t('common.close') }}</button>
          </div>

          <form v-else @submit.prevent="guardar">
            <div class="mb-3">
              <label class="form-label fw-bold">{{ $t('assignUser.selectTeacher') }}</label>
              <select class="form-select" v-model="idProfesorSeleccionado" required>
                <option value="" disabled>{{ $t('assignUser.chooseTeacher') }}</option>
                <option v-for="prof in profesoresDisponibles" :key="prof.idProfesor" :value="prof.idProfesor">
                  {{ prof.nombre }} (ID: {{ prof.idProfesor }})
                </option>
              </select>
              <div class="form-text">{{ $t('assignUser.onlyWithoutUser') }}</div>
            </div>

            <div class="mb-3">
              <label class="form-label fw-bold">{{ $t('assignUser.email') }}</label>
              <div class="input-group">
                <span class="input-group-text"><i class="bi bi-envelope"></i></span>
                <input 
                  type="email" 
                  class="form-control" 
                  v-model="email" 
                  :placeholder="$t('assignUser.emailPlaceholder')"
                  required
                >
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label fw-bold">{{ $t('assignUser.initialPassword') }}</label>
              <div class="input-group">
                <span class="input-group-text"><i class="bi bi-key"></i></span>
                <input 
                  type="password" 
                  class="form-control" 
                  v-model="password" 
                  :placeholder="$t('assignUser.passwordPlaceholder')"
                  required
                  minlength="4"
                >
              </div>
            </div>

            <div v-if="error" class="alert alert-danger py-2 small">
              <i class="bi bi-exclamation-triangle me-2"></i>{{ error }}
            </div>

            <div class="d-flex justify-content-end gap-2 mt-4">
              <button type="button" class="btn btn-light" @click="cerrar">{{ $t('common.cancel') }}</button>
              <button type="submit" class="btn btn-success" :disabled="procesando">
                <span v-if="procesando" class="spinner-border spinner-border-sm me-2"></span>
                {{ $t('assignUser.createAccess') }}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import profesorService from '../services/profesorService'

const props = defineProps({
  visible: Boolean
})

const emit = defineEmits(['cerrar', 'guardar-exito'])

const idProfesorSeleccionado = ref('')
const email = ref('')
const password = ref('')
const profesoresDisponibles = ref([])

const cargandoLista = ref(false)
const procesando = ref(false)
const error = ref('')
const { t } = useI18n()

watch(() => props.visible, async (nuevoValor) => {
  if (nuevoValor) {
    limpiarFormulario()
    await cargarProfesoresLibres()
  }
})

const cargarProfesoresLibres = async () => {
  cargandoLista.value = true
  try {
    profesoresDisponibles.value = await profesorService.obtenerProfesoresSinUsuario()
  } catch (e) {
    console.error(e)
    error.value = t('assignUser.loadTeachersError')
  } finally {
    cargandoLista.value = false
  }
}

const limpiarFormulario = () => {
  idProfesorSeleccionado.value = ''
  email.value = ''
  password.value = ''
  error.value = ''
}

const cerrar = () => emit('cerrar')

const guardar = async () => {
  if (!idProfesorSeleccionado.value) return
  
  procesando.value = true
  error.value = ''

  try {
    await profesorService.asignarUsuario(
      idProfesorSeleccionado.value,
      email.value,
      password.value
    )
    emit('guardar-exito', t('assignUser.assignedSuccess')) 
    cerrar()
  } catch (e) {
    console.error(e)
    const msg = e.response?.data?.error || t('assignUser.createUserError')
    error.value = msg
  } finally {
    procesando.value = false
  }
}
</script>

<style scoped>
.modal.show { display: block; }
</style>