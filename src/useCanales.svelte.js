// Hook useCanales: guarda el estado de la página de canales y llama a la capa
// api. Patrón del apunte: useAlgo() crea $state y devuelve estado + funciones.
// El estado se devuelve con GETTERS para que la página vea siempre el valor
// actual (si se copiara el array, la vista dejaría de ser reactiva).
import { listar } from './api/canales.api.js'
import { sesion, cerrarSesion } from './sesion.svelte.js'
import { navigate } from './router.js'
import { mensajeDeError } from './errores.js'

export function useCanales() {
  let items = $state([])
  let cargando = $state(false)
  let error = $state('')

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

  return {
    get items() {
      return items
    },
    get cargando() {
      return cargando
    },
    get error() {
      return error
    },
    cargar
  }
}
