<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark fixed-top w-100 shadow">
    <div class="container-fluid">
      <router-link to="/home" class="navbar-brand d-flex align-items-center">
        <img :src="logo" :alt="$t('menu.logoAlt')" height="36" class="me-2" />
        <span class="d-none d-lg-inline titulo-app">{{ $t('menu.brand') }}</span>
        <span class="d-inline d-lg-none titulo-app">{{ $t('menu.shortBrand') }}</span>
      </router-link>

      <ul class="navbar-nav d-lg-none ms-auto">
        <li class="nav-item">
          <router-link to="/perfil" class="nav-link p-0">
            <img :src="imagenPerfil || imagenPorDefecto" class="rounded-circle me-2"
              style="width: 32px; height: 32px; object-fit: cover;" :alt="$t('menu.profilePhoto')" />
          </router-link>
        </li>
      </ul>










      <div class="collapse navbar-collapse justify-content-end" id="navbarNav">
        <ul class="navbar-nav">
          <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle d-flex align-items-center" href="#" id="perfilDropdown" role="button"
              data-bs-toggle="dropdown" aria-expanded="false">
              <img :src="imagenPerfil || imagenPorDefecto" class="rounded-circle me-2"
                style="width: 32px; height: 32px; object-fit: cover;" />
              <span class="nombre-usuario" :title="auth.usuario.nombre">
                {{ auth.usuario.nombre }}
              </span>
            </a>

            <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="perfilDropdown">
              <li>
                <label for="inputFotoPerfil" class="dropdown-item" style="cursor: pointer;">
                  👤 {{ $t('menu.uploadProfilePhoto') }}
                </label>
                <input id="inputFotoPerfil" type="file" accept="image/*" @change="subirImagen" style="display: none;" />
              </li>
              <label class="dropdown-item" href="#" @click.prevent="mostrarModalPassword = true">🔐 {{ $t('menu.changePassword') }}</label>
              <li>
                <hr class="dropdown-divider" />
              </li>
              <li>
                <a class="dropdown-item text-danger" href="#" @click.prevent="logout">
                  🚪 {{ $t('menu.logout') }}
                </a>
              </li>
            </ul>
          </li>


        </ul>
      </div>
    </div>
  </nav>

  <div v-if="mostrarModalPassword" class="modal-overlay">
    <div class="modal-content modal-warning">
      <h5 class="mb-3">🔐 {{ $t('menu.changePassword') }}</h5>

      <div v-if="errorPassword" class="text-danger mb-2 text-start" style="font-size: 0.9rem;">
        {{ errorPassword }}
      </div>

      <input v-model="nuevaPassword" type="password" class="form-control mb-3" :placeholder="$t('profile.newPassword')" />
      <input v-model="confirmacionPassword" type="password" class="form-control mb-3"
        :placeholder="$t('profile.confirmPassword')" />

      <div class="d-flex justify-content-between">
        <button class="btn btn-secondary" @click="mostrarModalPassword = false">{{ $t('common.cancel') }}</button>
        <button class="btn btn-primary" @click="cambiarPassword">{{ $t('teacherModal.saveChanges') }}</button>
      </div>
    </div>
  </div>


  <ModalMensaje :visible="modalVisible" :titulo="modalTitulo" :mensaje="modalMensaje" :tipo="modalTipo"
    @cerrar="cerrarModal" />

</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import logo from '../assets/logo_iespsur.jpeg'
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import ModalMensaje from '../components/ModalMensaje.vue'
import usuarioService from '../services/usuarioService'

const imagenPerfil = ref(null)



const router = useRouter()
const auth = useAuthStore()
const { t } = useI18n()

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

onMounted(() => {
  cargarImagenConToken()
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

  usuarioService
    .subirImagen(auth.usuario.id, formData)
    .then((data) => {
      mostrarModal(t('menu.imageUploaded'), data, 'success')
      cargarImagenConToken()
    })
    .catch(err => {
      console.error('Error al subir imagen:', err)
      const mensaje = err.response?.data || t('profile.photoUploadError')
      mostrarModal(t('common.error'), mensaje, 'error')
    })
}


const imagenPorDefecto = 'https://img.freepik.com/vector-premium/icono-usuario-avatar-perfil-usuario-icono-persona-imagen-perfil-silueta-neutral-genero-adecuado_697711-1132.jpg'


async function cargarImagenConToken() {
  try {
    imagenPerfil.value = await usuarioService.obtenerImagenDataUrl(auth.usuario.id)
  } catch (error) {
    console.warn('No se encontró imagen. Usando imagen por defecto.')
    imagenPerfil.value = imagenPorDefecto
  }
}

const mostrarModalPassword = ref(false)
const nuevaPassword = ref('')
const confirmacionPassword = ref('')
const errorPassword = ref('')

async function cambiarPassword() {
  errorPassword.value = ''

  if (!nuevaPassword.value || nuevaPassword.value.length < 6) {
    errorPassword.value = t('passwordModal.minLengthError')
    return
  }

  if (nuevaPassword.value !== confirmacionPassword.value) {
    errorPassword.value = t('passwordModal.noMatchError')
    return
  }

  try {
    const data = await usuarioService.cambiarContrasena(auth.usuario.id, nuevaPassword.value)
    console.log('Respuesta del backend:', data)

    auth.usuario.cambiarContraseña = false
    localStorage.setItem('usuario', JSON.stringify(auth.usuario))

    mostrarModal(t('passwordModal.passwordModified'), t('passwordModal.passwordChangedOk'), 'success')
    mostrarModalPassword.value = false
    nuevaPassword.value = ''
    confirmacionPassword.value = ''
  } catch (err) {
    const mensaje = err.response?.data?.mensaje || t('passwordModal.changeError')
    errorPassword.value = mensaje
    console.error('Error al cambiar contraseña:', err)
    mostrarModal(t('common.error'), mensaje, 'error')
  }
}



</script>


<style scoped>
@media (min-width: 992px) {
  .navbar {
  padding-left: 1rem;
  padding-right: 1rem;
  height: 64px;
  z-index: 1055;
}


}
.dropdown-menu {
  right: 0;
  left: auto;
  transform: none;

}
.navbar-brand {
  display: flex;
  align-items: center;
}

.navbar-brand img {
  height: 36px;
  width: auto;
}
.nombre-usuario {
  font-size: 0.95rem;
  min-width: 100px;
  max-width: auto;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: inline-block;
}


.navbar {
  padding-left: 1rem;
  padding-right: 1rem;
  height: 64px;
}


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
