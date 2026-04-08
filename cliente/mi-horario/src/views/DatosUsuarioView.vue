<template>
    <MenuLateral />

    <div class="container-xl mt-5 pt-4 px-3">
        <div class="mt-4 d-flex flex-column align-items-center">
            <input type="file" accept="image/*" ref="inputArchivo" @change="subirImagen" style="display: none;" />

            <img :src="imagenPerfil || imagenPorDefecto" alt="Foto de perfil" class="rounded-circle"
                :style="{ width: '150px', height: '150px', objectFit: 'cover', cursor: profesor?.usuario ? 'pointer' : 'not-allowed' }"
                @click="profesor?.usuario && confirmarYSubir()" />


            <p class="mt-3">{{ profesor?.nombre }}</p>
            <p v-if="profesor?.usuario"><strong>Email:</strong> {{ profesor.usuario.email }}</p>
        </div>

        <div class="mt-5 text-center " v-if="profesor">
            <button class="btn btn-secondary me-2" @click="mostrarFormulario('edit')" v-if="profesor?.usuario">Editar
                Usuario</button>
            <button class="btn btn-danger" @click="eliminarUsuario" v-if="profesor?.usuario">Eliminar Usuario</button>
            <div v-else>
                <button class="btn btn-primary me-2" @click="mostrarFormulario('create')">Crear Usuario</button>
            </div>
        </div>

        <div class="mt-3 d-flex justify-content-center">
            <FormularioCrearUsuario v-if="formularioActivo === 'create'" :profesor="profesor"
                :errores="erroresFormulario" :isLoading="isLoading" @guardar="guardarUsuario" />
            <FormularioEditarUsuario v-if="formularioActivo === 'edit'" :profesor="profesor"
                :errores="erroresFormulario" :isLoading="isLoading" @actualizar="modificarUsuario" />
        </div>

        <div class="mt-5">
            <Horario :idProfesor="profesor?.idProfesor" />

            <div class="text-center mt-4 mb-3">
                <button class="btn btn-outline-warning" @click="mostrarFormularioAusencia = !mostrarFormularioAusencia">
                    {{ mostrarFormularioAusencia ? 'Cancelar' : 'Crear Ausencia' }}
                </button>
            </div>

            <FormularioCrearAusencia v-if="mostrarFormularioAusencia" :idProfesor="profesor?.idProfesor"
                @ausenciaCreada="onAusenciaCreada" @error="mensaje => mostrarModal(' Error', mensaje, 'error')" />

            <div v-if="profesor?.usuario?.id">
                 <h4 class="mt-4 mb-3">Ausencias Registradas</h4>
                 <TablaAusencias 
                    :ausencias="ausenciasOrdenadas" 
                    @eliminarDia="eliminarAusencia"
                    @eliminarUna="eliminarAusencia"
                    @justificarDia="justificarAusenciasDia"
                 />
            </div>

        </div>
    </div>

    <ModalMensaje :visible="modal.visible" :titulo="modal.titulo" :mensaje="modal.mensaje" :tipo="modal.tipo"
        @cerrar="modal.visible = false" />
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import MenuLateral from '../components/MenuLateral.vue'
import Horario from '../components/Horario.vue'
import ModalMensaje from '../components/ModalMensaje.vue'
import TablaAusencias from '../components/TablaAusencias.vue' // Added import
import ausenciaService from '../services/ausenciaService' // Added import

import TablaAusencias from '../components/TablaAusencias.vue'
import FormularioCrearUsuario from '../components/FormularioCrearUsuario.vue'
import FormularioEditarUsuario from '../components/FormularioEditarUsuario.vue'
import FormularioCrearAusencia from '../components/FormularioCrearAusencia.vue'
import ausenciaService from '../services/ausenciaService'

import profesorService from '../services/profesorService'
import usuarioService from '../services/usuarioService'

const route = useRoute()
const idProfesor = route.params.id

const profesor = ref(null)
const imagenPerfil = ref(null)
const inputArchivo = ref(null)
const formularioActivo = ref(null)
const erroresFormulario = ref({})
const isLoading = ref(false)
const ausenciasKey = ref(Date.now())
const ausencias = ref([])

const imagenPorDefecto = 'https://img.freepik.com/vector-premium/icono-usuario-avatar-perfil-usuario-icono-persona-imagen-perfil-silueta-neutral-genero-adecuado_697711-1132.jpg'

const modal = ref({
    visible: false,
    titulo: '',
    mensaje: '',
    tipo: 'info'
})

function mostrarModal(titulo, mensaje, tipo = 'info') {
    modal.value = { visible: true, titulo, mensaje, tipo }
    if (tipo !== 'error') setTimeout(() => modal.value.visible = false, 3000)
}

function mostrarFormulario(tipo) {
    formularioActivo.value = formularioActivo.value === tipo ? null : tipo
    erroresFormulario.value = {}
}

async function obtenerDatosProfesor() {
    try {
        profesor.value = await profesorService.obtenerProfesor(idProfesor)
        if (!profesor.value.usuario || !profesor.value.usuario.imagen) {
            imagenPerfil.value = null
        } else {
            await cargarImagen()
        }
        if(profesor.value.usuario?.id) {
            cargarAusencias(profesor.value.usuario.id)
        }

    } catch (error) {
        mostrarModal('Error', 'No se pudo cargar el profesor.', 'error')
    }
}

async function cargarAusencias(idUsuario) {
  try {
    const data = await ausenciaService.obtenerAusencias(idUsuario)
    ausencias.value = data
  } catch (error) {
    console.error('Error al cargar ausencias:', error)
    mostrarModal('Error', 'No se pudieron cargar las ausencias.', 'error')
  }
}

const ausenciasOrdenadas = computed(() =>
  [...ausencias.value].sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
)


const eliminarAusencia = async ({ id = null, fecha = null }) => {
  const idUsuario = profesor.value?.usuario?.id
    const idProfesorReal = profesor.value?.idProfesor
  if(!idUsuario) return

  let mensaje = id 
    ? '¿Estás seguro de eliminar esta hora?' 
    : '¿Estás seguro de eliminar el día completo?'
  
  if (!confirm(mensaje)) return

  try {
        await ausenciaService.eliminarAusencia(id, fecha, idProfesorReal)
    await cargarAusencias(idUsuario)
    mostrarModal('Eliminado', 'Se ha eliminado correctamente.', 'success')
  } catch (error) {
    mostrarModal('Error', 'No se pudo eliminar.', 'error')
  }
}

async function justificarAusenciasDia(fecha) {
  const idUsuario = profesor.value?.usuario?.id
    const idProfesorReal = profesor.value?.idProfesor
  if(!idUsuario) return

  if (!confirm(`¿Justificar todas las ausencias de este día?`)) return
  
  try {
        await ausenciaService.justificarDia(fecha, idProfesorReal)
    await cargarAusencias(idUsuario)
    mostrarModal('Justificado', 'Día justificado correctamente.', 'success')
  } catch (error) {
    mostrarModal('Error', 'No se pudieron justificar.', 'error')
  }
}


async function cargarImagen() {
    try {
        const idUsuario = profesor.value?.usuario?.id
        if (!idUsuario || !profesor.value.usuario.imagen) return
        imagenPerfil.value = await usuarioService.obtenerImagenDataUrl(idUsuario)
    } catch {
        imagenPerfil.value = null
    }
}

function confirmarYSubir() {
    if (confirm('¿Estás seguro de que quieres subir una nueva imagen de perfil?')) {
        inputArchivo.value?.click()
    }
}

async function subirImagen(event) {
    const archivo = event.target.files[0]
    const idUsuario = profesor.value?.usuario?.id
    if (!archivo || !idUsuario) return

    const formData = new FormData()
    formData.append('imagen', archivo)

    try {
        const data = await usuarioService.subirImagen(idUsuario, formData)
        mostrarModal(' Imagen actualizada', data, 'success')
        await obtenerDatosProfesor()

    } catch (error) {
        console.log(error)
        const mensajeError = error.response?.data || 'Error desconocido'
        mostrarModal(' Error', mensajeError, 'error')
    }
}



onMounted(() => {
    obtenerDatosProfesor()
})

async function guardarUsuario(datosFormulario) {
    const { idProfesor, email, password, rol, nombre } = datosFormulario

    if (!email || !password || !rol || !nombre || !idProfesor) {
        mostrarModal(' Campos incompletos', 'Por favor, completa todos los campos.', 'warning')
        return
    }

    const payload = { idProfesor, nombre, email, contraseña: password, rol }
    isLoading.value = true

    try {
        const data = await usuarioService.crearConProfesor(idProfesor, payload)
        console.log(' Usuario creado. Respuesta del backend:', data)
        mostrarModal('Usuario creado', `Se ha vinculado correctamente a ${nombre}`, 'success')
        formularioActivo.value = null
        await obtenerDatosProfesor()
    } catch (error) {
        console.error(' Error al crear usuario:', error)
        console.log('⚠️ error.response:', error.response)
        console.log('📩 error.response.data:', error.response?.data)

        if (error.response?.status === 400 && error.response.data) {
            erroresFormulario.value = error.response.data
            const mensaje = error.response.data.mensaje || 'Error correo no valido.'
            mostrarModal(' Error', mensaje, 'error')
        } else {
            const mensaje = error.response?.data?.mensaje || error.response?.data || 'Error al crear usuario.'
            mostrarModal(' Error', mensaje, 'error')
        }
    } finally {
        isLoading.value = false
    }
}


async function modificarUsuario(datosFormulario) {
    const { idUsuario, email, password, rol, nombre } = datosFormulario
    if (!idUsuario) {
        mostrarModal(' Error', 'El ID del usuario no puede ser nulo.', 'error')
        return
    }

    const payload = { idUsuario, nombre, email, contraseña: password, rol }
    isLoading.value = true

    try {
        const data = await usuarioService.actualizar(idUsuario, payload)
        console.log(' Usuario modificado. Respuesta del backend:', data)

        mostrarModal(' Usuario modificado', `Se ha modificado correctamente a ${nombre}`, 'success')
        formularioActivo.value = null
        await obtenerDatosProfesor()
    } catch (error) {
        console.error(' Error al modificar usuario:', error)
        console.log('⚠️ error.response:', error.response)
        console.log('📩 error.response.data:', error.response?.data)

        if (error.response?.status === 400 && error.response.data) {
            erroresFormulario.value = error.response.data
        } else {
            const mensaje = error.response?.data?.mensaje || error.response?.data || 'Error al modificar usuario.'
            mostrarModal(' Error', mensaje, 'error')
        }
    } finally {
        isLoading.value = false
    }
}


async function eliminarUsuario() {
    const usuario = profesor.value?.usuario
    const nombre = profesor.value?.nombre

    if (!usuario?.id) return

    const confirmado = confirm(`¿Estás seguro de eliminar el usuario vinculado a ${nombre}?`)
    if (!confirmado) return

    isLoading.value = true

    try {
        await usuarioService.eliminar(usuario.id)
        mostrarModal(' Usuario eliminado', `El usuario de ${nombre} ha sido eliminado.`, 'success')
        formularioActivo.value = null
        await obtenerDatosProfesor()
    } catch (error) {
        console.error('Error al eliminar usuario:', error)
        mostrarModal(' Error', 'No se pudo eliminar el usuario.', 'error')
    } finally {
        isLoading.value = false
    }
}

const mostrarFormularioAusencia = ref(false)

function onAusenciaCreada() {
    mostrarModal(' Ausencia creada', 'La ausencia fue registrada correctamente.', 'success')
    mostrarFormularioAusencia.value = false
    if(profesor.value?.usuario?.id) {
        cargarAusencias(profesor.value.usuario.id)
    }
}


</script>

<style scoped>
.contenedor-datos {
    max-width: 600px;
    margin: auto;
}
</style>