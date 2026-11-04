// Hook useCanales: guarda el estado de la página de canales y llama a la capa
// api. Patrón del apunte: useAlgo() crea $state y devuelve estado + funciones.
// El estado se devuelve con GETTERS para que la página vea siempre el valor
// actual (si se copiara el array, la vista dejaría de ser reactiva).
import { listar, tipos, crear, actualizar, eliminar } from './api/canales.api.js'
import { sesion, cerrarSesion } from './sesion.svelte.js'
import { navigate } from './router.js'
import { mensajeDeError } from './errores.js'

export function useCanales() {
  let items = $state([])
  let tiposCanal = $state([])
  let cargando = $state(false)
  let guardando = $state(false)
  let eliminandoId = $state(null)
  let error = $state('')
  let erroresValidacion = $state({})

  // Convención ante 401: la api lanza SESION_INVALIDA y acá limpiamos la
  // sesión y volvemos al login.
  function manejarError(e) {
    if (e.message === 'SESION_INVALIDA') {
      cerrarSesion()
      navigate('/login')
      return
    }
    error = mensajeDeError(e)
  }

  async function cargar() {
    cargando = true
    error = ''
    try {
      items = await listar(sesion.token)
    } catch (e) {
      manejarError(e)
    } finally {
      cargando = false
    }
  }

  async function cargarTipos() {
    try {
      tiposCanal = await tipos(sesion.token)
    } catch (e) {
      manejarError(e)
    }
  }

  // Devuelve true si se guardó. Con 422 deja los mensajes por campo en
  // erroresValidacion para que el formulario los muestre junto a cada input.
  async function agregar(datos) {
    guardando = true
    erroresValidacion = {}
    try {
      const resultado = await crear(sesion.token, datos)
      if (resultado.errores) {
        erroresValidacion = resultado.errores
        return false
      }
      items.push(resultado.canal)
      return true
    } catch (e) {
      manejarError(e)
      return false
    } finally {
      guardando = false
    }
  }

  async function editar(id, datos) {
    guardando = true
    erroresValidacion = {}
    try {
      const resultado = await actualizar(sesion.token, id, datos)
      if (resultado.errores) {
        erroresValidacion = resultado.errores
        return false
      }
      // Reemplazamos la fila por lo que devolvió el backend (fuente de verdad).
      const indice = items.findIndex((c) => c.id === id)
      if (indice !== -1) items[indice] = resultado.canal
      return true
    } catch (e) {
      manejarError(e)
      return false
    } finally {
      guardando = false
    }
  }

  async function quitar(id) {
    eliminandoId = id
    try {
      await eliminar(sesion.token, id)
      items = items.filter((c) => c.id !== id)
    } catch (e) {
      manejarError(e)
    } finally {
      eliminandoId = null
    }
  }

  function limpiarErrores() {
    erroresValidacion = {}
  }

  return {
    get items() {
      return items
    },
    get tipos() {
      return tiposCanal
    },
    get cargando() {
      return cargando
    },
    get guardando() {
      return guardando
    },
    get eliminandoId() {
      return eliminandoId
    },
    get error() {
      return error
    },
    get erroresValidacion() {
      return erroresValidacion
    },
    cargar,
    cargarTipos,
    agregar,
    editar,
    quitar,
    limpiarErrores
  }
}
