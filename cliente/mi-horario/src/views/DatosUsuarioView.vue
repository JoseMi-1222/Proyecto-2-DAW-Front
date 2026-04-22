<template>
    <MenuLateral />

    <div class="container-xl mt-5 pt-4 px-3">
        <div class="mt-4 d-flex flex-column align-items-center">
            <input type="file" accept="image/*" ref="inputArchivo" @change="subirImagen" style="display: none;" />

            <img :src="imagenPerfil || imagenPorDefecto" :alt="$t('profile.photoAlt')" class="rounded-circle"
                :style="{ width: '150px', height: '150px', objectFit: 'cover', cursor: profesor?.usuario ? 'pointer' : 'not-allowed' }"
                @click="profesor?.usuario && confirmarYSubir()" />


            <p class="mt-3">{{ profesor?.nombre }}</p>
            <p v-if="profesor?.usuario"><strong>{{ $t('userForm.email') }}:</strong> {{ profesor.usuario.email }}</p>
        </div>

        <div class="mt-5 text-center " v-if="profesor">
            <button class="btn btn-secondary me-2" @click="mostrarFormulario('edit')" v-if="profesor?.usuario">{{ $t('userView.editUser') }}</button>
            <button class="btn btn-danger" @click="eliminarUsuario" v-if="profesor?.usuario">{{ $t('userView.deleteUser') }}</button>
            <div v-else>
                <button class="btn btn-primary me-2" @click="mostrarFormulario('create')">{{ $t('userView.createUser') }}</button>
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
                    {{ mostrarFormularioAusencia ? $t('common.cancel') : $t('userView.createAbsence') }}
                </button>
            </div>

            <FormularioCrearAusencia v-if="mostrarFormularioAusencia" :idProfesor="profesor?.idProfesor"
                @ausenciaCreada="onAusenciaCreada" @error="mensaje => mostrarModal(t('common.error'), mensaje, 'error')" />

            <div v-if="profesor?.usuario?.id">
                  <h4 class="mt-4 mb-3">{{ $t('userView.registeredAbsences') }}</h4>
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
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import MenuLateral from '../components/MenuLateral.vue'
import Horario from '../components/Horario.vue'
import ModalMensaje from '../components/ModalMensaje.vue'

import TablaAusencias from '../components/TablaAusencias.vue'
import FormularioCrearUsuario from '../components/FormularioCrearUsuario.vue'
import FormularioEditarUsuario from '../components/FormularioEditarUsuario.vue'
import FormularioCrearAusencia from '../components/FormularioCrearAusencia.vue'
import ausenciaService from '../services/ausenciaService'

import profesorService from '../services/profesorService'
import usuarioService from '../services/usuarioService'

const route = useRoute()
const { t } = useI18n()
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
        mostrarModal(t('common.error'), t('userView.loadTeacherError'), 'error')
    }
}

async function cargarAusencias(idUsuario) {
  try {
    const data = await ausenciaService.obtenerAusencias(idUsuario)
    ausencias.value = data
  } catch (error) {
    console.error('Error al cargar ausencias:', error)
        mostrarModal(t('common.error'), t('userView.loadAbsencesError'), 'error')
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
        ? t('userView.confirmDeleteHour')
        : t('userView.confirmDeleteDay')
  
  if (!confirm(mensaje)) return

  try {
        await ausenciaService.eliminarAusencia(id, fecha, idProfesorReal)
    await cargarAusencias(idUsuario)
        mostrarModal(t('userView.deleted'), t('userView.deletedOk'), 'success')
  } catch (error) {
        mostrarModal(t('common.error'), t('userView.deleteError'), 'error')
  }
}

async function justificarAusenciasDia(fecha) {
  const idUsuario = profesor.value?.usuario?.id
    const idProfesorReal = profesor.value?.idProfesor
  if(!idUsuario) return

    if (!confirm(t('userView.confirmJustifyDay'))) return
  
  try {
        await ausenciaService.justificarDia(fecha, idProfesorReal)
    await cargarAusencias(idUsuario)
        mostrarModal(t('userView.justified'), t('userView.justifiedOk'), 'success')
  } catch (error) {
        mostrarModal(t('common.error'), t('userView.justifyError'), 'error')
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
    if (confirm(t('userView.confirmUploadImage'))) {
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
        mostrarModal(t('profile.photoUpdated'), data, 'success')
        await obtenerDatosProfesor()

    } catch (error) {
        console.log(error)
        const mensajeError = error.response?.data || t('dataCenter.unknownServerError')
        mostrarModal(t('common.error'), mensajeError, 'error')
    }
}



onMounted(() => {
    obtenerDatosProfesor()
})

async function guardarUsuario(datosFormulario) {
    const { idProfesor, email, password, rol, nombre } = datosFormulario

    if (!email || !password || !rol || !nombre || !idProfesor) {
        mostrarModal(t('userView.incompleteFields'), t('userView.completeAllFields'), 'warning')
        return
    }

    const payload = { idProfesor, nombre, email, contraseña: password, rol }
    isLoading.value = true

    try {
        const data = await usuarioService.crearConProfesor(idProfesor, payload)
        console.log(' Usuario creado. Respuesta del backend:', data)
        mostrarModal(t('userView.userCreated'), t('userView.userLinkedTo', { name: nombre }), 'success')
        formularioActivo.value = null
        await obtenerDatosProfesor()
    } catch (error) {
        console.error(' Error al crear usuario:', error)
        console.log('⚠️ error.response:', error.response)
        console.log('📩 error.response.data:', error.response?.data)

        if (error.response?.status === 400 && error.response.data) {
            erroresFormulario.value = error.response.data
            const mensaje = error.response.data.mensaje || t('userView.invalidEmailError')
            mostrarModal(t('common.error'), mensaje, 'error')
        } else {
            const mensaje = error.response?.data?.mensaje || error.response?.data || t('userView.createUserError')
            mostrarModal(t('common.error'), mensaje, 'error')
        }
    } finally {
        isLoading.value = false
    }
}


async function modificarUsuario(datosFormulario) {
    const { idUsuario, email, password, rol, nombre } = datosFormulario
    if (!idUsuario) {
        mostrarModal(t('common.error'), t('userView.nullUserId'), 'error')
        return
    }

    const payload = { idUsuario, nombre, email, contraseña: password, rol }
    isLoading.value = true

    try {
        const data = await usuarioService.actualizar(idUsuario, payload)
        console.log(' Usuario modificado. Respuesta del backend:', data)

        mostrarModal(t('userView.userUpdated'), t('userView.userUpdatedTo', { name: nombre }), 'success')
        formularioActivo.value = null
        await obtenerDatosProfesor()
    } catch (error) {
        console.error(' Error al modificar usuario:', error)
        console.log('⚠️ error.response:', error.response)
        console.log('📩 error.response.data:', error.response?.data)

        if (error.response?.status === 400 && error.response.data) {
            erroresFormulario.value = error.response.data
        } else {
            const mensaje = error.response?.data?.mensaje || error.response?.data || t('userView.updateUserError')
            mostrarModal(t('common.error'), mensaje, 'error')
        }
    } finally {
        isLoading.value = false
    }
}


async function eliminarUsuario() {
    const usuario = profesor.value?.usuario
    const nombre = profesor.value?.nombre

    if (!usuario?.id) return

    const confirmado = confirm(t('userView.confirmDeleteLinkedUser', { name: nombre }))
    if (!confirmado) return

    isLoading.value = true

    try {
        await usuarioService.eliminar(usuario.id)
        mostrarModal(t('userView.userDeleted'), t('userView.userDeletedOf', { name: nombre }), 'success')
        formularioActivo.value = null
        await obtenerDatosProfesor()
    } catch (error) {
        console.error('Error al eliminar usuario:', error)
        mostrarModal(t('common.error'), t('userView.deleteUserError'), 'error')
    } finally {
        isLoading.value = false
    }
}

const mostrarFormularioAusencia = ref(false)

function onAusenciaCreada() {
    mostrarModal(t('teacherAbsences.absenceRegistered'), t('userView.absenceRegisteredOk'), 'success')
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