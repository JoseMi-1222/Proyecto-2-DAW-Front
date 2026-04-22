<template>
  <div class="container mt-5 pt-5">

    <div class="card p-4 shadow border-0" style="max-width: 500px; margin: auto;">
      <div class="d-flex align-items-center mb-4">
        <div class="position-relative">
          <img
            :src="imagenPerfil || imagenPorDefecto"
            class="rounded-circle me-3 border"
            style="width: 80px; height: 80px; object-fit: cover;"
          />
          <label 
            for="inputFotoPerfil" 
            class="position-absolute bottom-0 end-0 bg-primary text-white rounded-circle d-flex align-items-center justify-content-center shadow-sm"
            style="width: 30px; height: 30px; cursor: pointer; right: 15px !important;"
            :title="$t('profile.changePhoto')"
          >
            <i class="bi bi-camera-fill" style="font-size: 0.8rem;"></i>
          </label>
        </div>
        
        <div>
          <h4 class="mb-0">{{ auth.usuario?.nombre }}</h4>
          <small class="text-muted">{{ auth.usuario?.email }}</small>
        </div>
      </div>

      <input
        id="inputFotoPerfil"
        type="file"
        accept="image/*"
        @change="subirImagen"
        style="display: none;"
      />

      <hr class="my-4">

      <h5 class="mb-3"><i class="bi bi-shield-lock me-2"></i>{{ $t('profile.security') }}</h5>
      
      <form @submit.prevent="cambiarPassword">
        <div class="mb-3">
          <label class="form-label small text-muted">{{ $t('profile.currentPassword') }}</label>
          <input 
            v-model="passwordActual" 
            type="password" 
            class="form-control" 
            :placeholder="$t('profile.currentPasswordPlaceholder')" 
          />
        </div>

        <div class="mb-3">
          <label class="form-label small text-muted">{{ $t('profile.newPassword') }}</label>
          <input 
            v-model="nuevaPassword" 
            type="password" 
            class="form-control" 
            :placeholder="$t('profile.newPasswordPlaceholder')" 
          />
        </div>

        <div class="mb-4">
          <label class="form-label small text-muted">{{ $t('profile.confirmPassword') }}</label>
          <input 
            v-model="confirmacionPassword" 
            type="password" 
            class="form-control" 
            :placeholder="$t('profile.confirmPasswordPlaceholder')" 
          />
        </div>

        <button 
          type="submit"
          class="btn btn-primary w-100 mb-3" 
          :disabled="!formularioValido || cargando"
        >
          <span v-if="cargando" class="spinner-border spinner-border-sm me-2"></span>
          {{ cargando ? $t('profile.updating') : $t('profile.updatePassword') }}
        </button>
      </form>

      <button class="btn btn-outline-danger w-100" @click="logout">
        <i class="bi bi-box-arrow-right me-2"></i>{{ $t('menu.logout') }}
      </button>
    </div>
  </div>

  <ModalMensaje 
    :visible="modal.visible" 
    :titulo="modal.titulo" 
    :mensaje="modal.mensaje" 
    :tipo="modal.tipo"
    @cerrar="modal.visible = false" 
  />

</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../stores/auth'
import usuarioService from '../services/usuarioService'
import ModalMensaje from '../components/ModalMensaje.vue'

const router = useRouter()
const auth = useAuthStore()
const { t } = useI18n()

const imagenPerfil = ref(null)
const imagenPorDefecto = 'https://img.freepik.com/vector-premium/icono-usuario-avatar-perfil-usuario-icono-persona-imagen-perfil-silueta-neutral-genero-adecuado_697711-1132.jpg'
const cargando = ref(false)

const passwordActual = ref('')
const nuevaPassword = ref('')
const confirmacionPassword = ref('')

const modal = ref({ visible: false, titulo: '', mensaje: '', tipo: 'info' })

const mostrarModal = (titulo, mensaje, tipo = 'info') => {
  modal.value = { visible: true, titulo, mensaje, tipo }
}

const formularioValido = computed(() => {
  return passwordActual.value.length > 0 && 
         nuevaPassword.value.length >= 6 && 
         nuevaPassword.value === confirmacionPassword.value
})

function logout() {
  auth.logout()
  router.push('/login')
}

function subirImagen(event) {
  const archivo = event.target.files[0]
  if (!archivo) return

  const formData = new FormData()
  formData.append('imagen', archivo)

  cargando.value = true
  usuarioService
    .subirImagen(auth.usuario.id, formData)
    .then(() => {
      mostrarModal(t('profile.photoUpdated'), '', 'success')
      cargarImagenConToken()
    })
    .catch(err => {
      console.error(err)
      mostrarModal(t('common.error'), t('profile.photoUploadError'), 'error')
    })
    .finally(() => cargando.value = false)
}

async function cargarImagenConToken() {
  try {
    const dataUrl = await usuarioService.obtenerImagenDataUrl(auth.usuario.id)
    imagenPerfil.value = dataUrl || imagenPorDefecto
  } catch (error) {
    imagenPerfil.value = imagenPorDefecto
  }
}

async function cambiarPassword() {
  cargando.value = true

  try {
    await usuarioService.cambiarContrasena(
      auth.usuario.id, 
      passwordActual.value, 
      nuevaPassword.value
    )

    mostrarModal(t('profile.passwordUpdated'), '', 'success')
    
    setTimeout(() => {
      logout()
    }, 2500)
    
  } catch (err) {
    console.error(err)
    const msg = err.response?.data?.error || err.response?.data?.mensaje || t('profile.currentPasswordWrong')
    mostrarModal(t('common.error'), msg, 'error')
  } finally {
    cargando.value = false
  }
}

onMounted(() => {
  cargarImagenConToken()
})
</script>