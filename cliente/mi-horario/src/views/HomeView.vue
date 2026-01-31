<template>
  <MenuLateral />
  <ModalCambioContraseña :visible="mostrarModalPassword" @cerrar="mostrarModalPassword = false" />

  <div class="container-fluid mx-4" style="margin-top: 100px; max-width: 95%;">
    
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2 class="text-primary">
        <i class="bi bi-calendar-week me-2"></i>
        {{ esAdmin ? 'Gestión de Horarios' : 'Mi Horario Lectivo' }}
      </h2>
      
      <div v-if="!esAdmin && auth.usuario" class="text-muted">
        Hola, <strong>{{ auth.usuario.nombre }}</strong>
      </div>
    </div>

    <div v-if="esAdmin" class="card shadow-sm p-4 mb-4 bg-light">
      <div class="row align-items-center">
        <div class="col-md-6">
          <label class="form-label fw-bold">Selecciona un profesor:</label>
          <select class="form-select" v-model="idProfesorSeleccionado">
            <option :value="null" disabled>-- Selecciona de la lista --</option>
            <option v-for="profe in listaProfesores" :key="profe.idProfesor" :value="profe.idProfesor">
              {{ profe.nombre }} {{ profe.apellido ? profe.apellido : '' }}
            </option>
          </select>
        </div>
        <div class="col-md-6 text-secondary small mt-2 mt-md-0">
          <i class="bi bi-info-circle"></i> Selecciona para ver el horario correspondiente.
        </div>
      </div>
    </div>

    <div v-if="idCalculado" class="card shadow p-3">
      <Horario :idProfesor="idCalculado" :key="idCalculado" />
    </div>

    <div v-else class="text-center py-5">
      <div v-if="cargandoId">
          <div class="spinner-border text-primary" role="status"></div>
          <p class="mt-2 text-muted">Cargando perfil...</p>
      </div>
      
      <div v-else-if="esAdmin && !idProfesorSeleccionado" class="text-muted">
         <h4>👆 Selecciona un profesor</h4>
         <p>Utiliza el desplegable superior para ver los datos.</p>
      </div>
      
      <div v-else class="text-danger bg-white p-3 border rounded d-inline-block shadow-sm">
         <h4><i class="bi bi-person-x"></i> Error de Vinculación</h4>
         <p>No se ha encontrado tu ficha de profesor.</p>
         <small>Contacta con el administrador para revisar tu usuario.</small>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import profesorService from '../services/profesorService'

import MenuLateral from '../components/MenuLateral.vue'
import Horario from '../components/Horario.vue'
import ModalCambioContraseña from '../components/ModalCambioContraseña.vue'

const auth = useAuthStore()
const mostrarModalPassword = ref(false)
const listaProfesores = ref([])
const idProfesorSeleccionado = ref(null)
const profesorEncontrado = ref(null) // Objeto del profesor vinculado
const cargandoId = ref(false)

const esAdmin = computed(() => auth.usuario?.rol === 'administrador')

// Lógica para decidir qué ID enviar al componente Horario
const idCalculado = computed(() => {
  if (esAdmin.value) {
    return idProfesorSeleccionado.value
  }
  return profesorEncontrado.value?.idProfesor || null
})

onMounted(async () => {
  if (auth.usuario?.cambiarContraseña) {
    mostrarModalPassword.value = true
  }
  await cargarYBuscarProfesor()
})

async function cargarYBuscarProfesor() {
  cargandoId.value = true
  try {
    // 1. Cargamos todos los profesores
    listaProfesores.value = await profesorService.obtenerProfesores()

    // 2. Si es profesor, buscamos cuál es "su" ficha en la lista
    if (!esAdmin.value && auth.usuario) {
      const emailUser = auth.usuario.email?.toLowerCase().trim()
      const nombreUser = auth.usuario.nombre?.toLowerCase().trim()

      // A. Intento por Email (Más preciso)
      let encontrado = listaProfesores.value.find(p => 
        p.email && p.email.toLowerCase().trim() === emailUser
      )

      // B. Intento por Nombre (Fallback)
      if (!encontrado && nombreUser) {
        encontrado = listaProfesores.value.find(p => {
           const nombreProfe = (p.nombre + " " + (p.apellido || "")).toLowerCase()
           const palabrasProfe = nombreProfe.split(/[\s,]+/).filter(w => w.length > 2)
           const palabrasUser = nombreUser.split(/[\s,]+/).filter(w => w.length > 2)
           
           // Si coinciden 2 o más palabras clave, asumimos match
           const coincidencias = palabrasUser.filter(w => palabrasProfe.includes(w))
           return coincidencias.length >= 2
        })
      }

      if (encontrado) {
        profesorEncontrado.value = encontrado
      }
    }

  } catch (error) {
    console.error('Error cargando profesores:', error)
  } finally {
    cargandoId.value = false
  }
}
</script>

<style scoped>
.container-fluid {
  transition: all 0.3s ease;
}
</style>