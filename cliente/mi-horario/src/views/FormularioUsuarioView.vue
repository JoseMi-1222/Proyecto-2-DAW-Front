<template>
    <div class="container mt-5">
      <h3>Formulario de {{ action === 'create' ? 'creación' : 'edición' }} para el profesor</h3>
  
      <div v-if="profesor">
        <FormularioCrearUsuario
          v-if="action === 'create'"
          :profesor="profesor"
          @guardar="guardarUsuario"
        />
  
        <FormularioEditarUsuario
          v-else
          :profesor="profesor"
          @actualizar="modificarUsuario"
        />
      </div>
  
      <div v-else class="text-center mt-4">
        <div class="spinner-border text-primary" role="status"></div>
        <p class="mt-2">Cargando datos del profesor...</p>
      </div>
    </div>
  </template>
  
  <script setup>
  import { onMounted, ref } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import profesorService from '../services/profesorService'
  
  import FormularioCrearUsuario from '../components/FormularioCrearUsuario.vue'
  import FormularioEditarUsuario from '../components/FormularioEditarUsuario.vue'
  
  const route = useRoute()
  const router = useRouter()
  
  const profesor = ref(null)
  const action = ref(route.query.action || 'create')
  
  onMounted(async () => {
  try {
    profesor.value = await profesorService.obtenerProfesor(route.params.id)
    console.log('📦 Profesor cargado:', profesor.value)
  } catch (err) {
    console.error(' Error al cargar el profesor', err)
    router.push('/datos-profesorado')
  }
})

  
  // Agregá tu lógica para guardar o modificar si querés manejarla desde aquí
  function guardarUsuario(payload) {
    console.log('Guardar (crear):', payload)
  }
  
  function modificarUsuario(payload) {
    console.log('Guardar (editar):', payload)
  }
  </script>
  