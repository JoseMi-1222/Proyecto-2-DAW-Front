import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import HomeView from '../views/HomeView.vue'
import PerfilView from '../views/PerfilView.vue'
import DatosProfesoradoView from '../views/DatosProfesoradoView.vue'
import DatosProfesor from '../views/DatosProfesor.vue'
import FormularioUsuarioView from '../views/FormularioUsuarioView.vue'
import AusenciasProfesorView from '../views/AusenciasProfesorView.vue'
import DatosUsuarioView from '../views/DatosUsuarioView.vue'
import AusenciasAdminView from '../views/AusenciasAdminView.vue'
import GestionDatosView from '../views/GestionDatosView.vue' 

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: LoginView },
  { path: '/home', component: HomeView },
  { path: '/perfil', component: PerfilView },
  
  // --- GESTIÓN DE PROFESORES (Protegida) ---
  { 
    path: '/datos-profesorado', 
    component: DatosProfesoradoView,
    meta: { requireAdmin: true } 
  },

  // --- NUEVA RUTA: IMPORTAR/EXPORTAR DATOS (Protegida) ---
  { 
    path: '/gestion-datos', 
    component: GestionDatosView,
    meta: { requireAdmin: true } 
  },
  
  { path: '/profesor/:id', component: DatosProfesor },
  { path: '/formulario/:id', component: FormularioUsuarioView },
  { path: '/mis-ausencias', component: AusenciasProfesorView },
  { path: '/datosusuario/:id', component: DatosUsuarioView },
  
  // --- PANEL ADMIN AUSENCIAS (Protegida) ---
  { 
    path: '/admin/ausencias', 
    component: AusenciasAdminView,
    meta: { requireAdmin: true } 
  },

  { path: '/:pathMatch(.*)*', redirect: '/home' },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router