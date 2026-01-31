<template>
  <div class="bg-gradient">
    <div class="login-wrapper d-flex justify-content-center align-items-center vh-100">
      <div class="card-container" :class="{ flipped: mostrarRecuperacion }">
        <!-- Cara frontal: login -->
        <div class="card-side front card shadow p-4 w-100">
          <div class="text-center mb-4">
            <img src="../assets/logo_iespsur.jpeg" alt="logo" style="width: 60px;" />
          </div>
          <form @submit.prevent="login">
            <div class="mb-3">
              <label class="form-label text-muted">Correo Electrónico</label>
              <input v-model="username" type="text" class="form-control" required />
            </div>
            <div class="mb-3">
              <label class="form-label text-muted">Contraseña</label>
              <input v-model="password" type="password" class="form-control" required />
            </div>
            <div v-if="errorLogin" class="text-danger text-center mb-3">
              Credenciales incorrectas
            </div>
            <button type="submit" class="btn btn-primary w-100">Iniciar sesión</button>
          </form>
          <div class="text-center mt-3">
            <a href="#" class="text-primary text-decoration-none" @click.prevent="mostrarRecuperacion = true">
              He olvidado la contraseña
            </a>
          </div>
        </div>

        <!-- Cara trasera: recuperación -->
        <div class="card-side back card shadow p-4 w-100">
          <div class="text-center mb-4">
            <img src="../assets/logo_iespsur.jpeg" alt="logo" style="width: 60px;" />
          </div>
          <h5 class="mb-4">Recuperar contraseña</h5>
          
          <p class="mt-4">Escriba el correo de la contraseña olvidada</p>
          <form @submit.prevent="enviarCorreo">
            <input v-model="correo" type="email" class="form-control mb-3" placeholder="Introduce tu correo" required />
            <button type="submit" class="btn btn-primary w-100 mt-2">Enviar</button>
          </form>
          <div v-if="mensaje" class="alert alert-info mt-3 text-center">
            {{ mensaje }}
          </div>
          <div class="text-center mt-3">
            <a href="#" @click.prevent="mostrarRecuperacion = false" class="text-secondary text-decoration-none">
              Volver al inicio de sesión
            </a>
          </div>
        </div>
      </div>
      
    </div>
  </div>
</template>



<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import authService from '../services/authService'

const router = useRouter()
const auth = useAuthStore()

const username = ref('')
const password = ref('')
const errorLogin = ref(false)

const correo = ref('')
const mensaje = ref('')
const mostrarRecuperacion = ref(false)

async function login() {
  errorLogin.value = false

  const usuarioEsAdmin = username.value.toLowerCase() === 'admin'
  const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(username.value)

  if (!usuarioEsAdmin && !emailValido) {
    errorLogin.value = true
    return
  }

  const ok = await auth.login(username.value, password.value)
  if (ok) {
    router.push('/home')
  } else {
    errorLogin.value = true
  }
}


async function enviarCorreo() {
  mensaje.value = ''
  try {
    const data = await authService.recuperarPassword(correo.value)
    mensaje.value = data
  } catch (error) {
    console.error(' Error completo:', error)                // Muestra error completo
    console.log('⚠️ error.response:', error.response)         // Info útil del backend

    mensaje.value = error.response?.data.message
  }
}


</script>


<style scoped>
.bg-gradient {
  width: 100%;
  height: 100vh;
  background: linear-gradient(160deg, #2c3e50 0%, #4ca1af 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 0;
}

.card-container {
  perspective: 1000px;
  width: 400px;
  position: relative;
  height: 420px;
}

.card-side {
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  transition: transform 0.6s ease-in-out;
  position: absolute;
  top: 0;
  left: 0;
}

.front {
  transform: rotateY(0deg);
  z-index: 2;
}

.back {
  transform: rotateY(180deg);
}

.card-container.flipped .front {
  transform: rotateY(-180deg);
}

.card-container.flipped .back {
  transform: rotateY(0deg);
  z-index: 3;
}
</style>

