<template>
    <div class="container mt-5">
  <h3>{{ $t('userView.formTitle', { action: action === 'create' ? $t('userView.create') : $t('userView.edit') }) }}</h3>
  
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
        <p class="mt-2">{{ $t('userView.loadingTeacherData') }}</p>
      </div>
    </div>
  </template>
  
  <script setup>
  import { onMounted, ref } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import profesorService from '../services/profesorService'
  
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


  function guardarUsuario(payload) {
    console.log('Guardar (crear):', payload)
  }
  
  function modificarUsuario(payload) {
    console.log('Guardar (editar):', payload)
  }
  </script>
  