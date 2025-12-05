<template>
  <div class="app-container">
    
    <div v-if="showMenu" class="layout-menu">
      <Menu />
    </div>

    <main class="main-content">
      <router-view />
    </main>
    
    <Footer v-if="showMenu" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
// import { useAuthStore } from './stores/auth' // Comentado para la prueba

import Menu from './components/Menu.vue' 
import Footer from './components/Footer.vue'

const route = useRoute()
// const auth = useAuthStore() // Comentado para la prueba

// Solo ocultar en login, mostrar en todo lo demás
const showMenu = computed(() => route.path !== '/login')
</script>

<style>
/* Reset básico */
body {
  margin: 0;
  padding: 0;
  overflow-x: hidden;
  background-color: #f8f9fa;
}

.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

/* IMPORTANTE: 
   Como la barra negra es 'fixed-top', flota sobre el contenido.
   Necesitamos empujar el contenido hacia abajo 70px o se quedará escondido detrás.
*/
.main-content {
  flex: 1;
  padding-top: 70px; 
}
</style>