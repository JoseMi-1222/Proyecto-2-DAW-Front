<template>
  <div v-if="visible" class="modal-overlay">
    <div class="modal-content modal-warning">
      <h5 class="mb-3">⚠️ {{ $t('passwordModal.requiredChange') }}</h5>
      <div v-if="error" class="text-danger mb-2 text-start" style="font-size: 0.9rem;">
        {{ error }}
      </div>
      <input v-model="nuevaPassword" type="password" class="form-control mb-3" :placeholder="$t('profile.newPassword')" />
      <input v-model="confirmacionPassword" type="password" class="form-control mb-3"
        :placeholder="$t('profile.confirmPassword')" />
      <button class="btn btn-primary w-100" @click="cambiar">{{ $t('passwordModal.changePassword') }}</button>
    </div>
  </div>

  <ModalMensaje
  :visible="modalVisible"
  :titulo="modalTitulo"
  :mensaje="modalMensaje"
  :tipo="modalTipo"
  @cerrar="cerrarModal"
/>

</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import api from '../axios'
import { useAuthStore } from '../stores/auth'
import ModalMensaje from '../components/ModalMensaje.vue'

const props = defineProps({
  visible: Boolean
})
const emit = defineEmits(['cerrar'])

const auth = useAuthStore()
const { t } = useI18n()
const nuevaPassword = ref('')
const confirmacionPassword = ref('')
const error = ref('')

const modalVisible = ref(false)
const modalTitulo = ref('')
const modalMensaje = ref('')
const modalTipo = ref('info')

function mostrarModal(titulo, mensaje, tipo = 'info') {
  modalTitulo.value = titulo
  modalMensaje.value = mensaje
  modalTipo.value = tipo
  modalVisible.value = true
}

function cerrarModal() {
  modalVisible.value = false
}


async function cambiar() {
  error.value = ''

  if (!nuevaPassword.value || nuevaPassword.value.length < 6) {
    error.value = t('passwordModal.minLengthError')
    return
  }

  if (nuevaPassword.value !== confirmacionPassword.value) {
    error.value = t('passwordModal.noMatchError')
    return
  }

  try {
    const response = await api.put(`/usuarios/${auth.usuario.id}/cambiar-contraseña`, {
      nuevaContraseña: nuevaPassword.value
    })

    console.log(' Respuesta del backend:', response)
    console.log('📨 Datos:', response.data)

    auth.usuario.cambiarContraseña = false
    localStorage.setItem('usuario', JSON.stringify(auth.usuario))

    emit('cerrar')

    mostrarModal(t('passwordModal.passwordModified'), t('passwordModal.passwordChangedOk'), 'success')
  } catch (err) {
    console.error('Error al cambiar contraseña:', err)
    const mensajeError = err.response?.data?.mensaje || t('passwordModal.changeError')
    error.value = mensajeError
    mostrarModal(t('passwordModal.changeErrorTitle'), mensajeError, 'error')
  }
}


</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.modal-content {
  background-color: white;
  padding: 2rem;
  border-radius: 10px;
  max-width: 400px;
  width: 90%;
  text-align: center;
}

.modal-warning {
  border-left: 8px solid #ffc107;
}
</style>