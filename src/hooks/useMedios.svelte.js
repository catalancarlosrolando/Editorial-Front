// Hook useMedios: estado de la página de medios (SOLO lectura).
// No hay crear/editar/eliminar: cargar() lista, opcionalmente con filtros.
import { listar, tipos } from '../api/medios.api.js'
import { sesion, cerrarSesion } from '../sesion.svelte.js'
import { navigate } from '../router.js'
import { mensajeDeError } from '../errores.js'

export function useMedios() {
  let items = $state([])
  let tiposMedio = $state([])
  let cargando = $state(false)
  let error = $state('')

  function manejarError(e) {
    if (e.message === 'SESION_INVALIDA') {
      cerrarSesion()
      navigate('/login')
      return
    }
    error = mensajeDeError(e)
  }

  // filtros: { type, name } tal como los arma la página.
  async function cargar(filtros = {}) {
    cargando = true
    error = ''
    try {
      items = await listar(sesion.token, filtros)
    } catch (e) {
      manejarError(e)
    } finally {
      cargando = false
    }
  }

  async function cargarTipos() {
    try {
      tiposMedio = await tipos(sesion.token)
    } catch (e) {
      manejarError(e)
    }
  }

  return {
    get items() {
      return items
    },
    get tipos() {
      return tiposMedio
    },
    get cargando() {
      return cargando
    },
    get error() {
      return error
    },
    cargar,
    cargarTipos
  }
}
