// Hook useDispositivos: estado de la página de dispositivos (listado PAGINADO)
// y llamadas a la capa api. Patrón del apunte: $state + getters + funciones.
import { listar } from './api/dispositivos.api.js'
import { sesion, cerrarSesion } from './sesion.svelte.js'
import { navigate } from './router.js'
import { mensajeDeError } from './errores.js'

export function useDispositivos() {
  let items = $state([])
  let paginaActual = $state(1)
  let ultimaPagina = $state(1)
  let total = $state(0)
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

  // Carga una página del listado (por defecto, la actual).
  async function cargar(pagina = paginaActual) {
    cargando = true
    error = ''
    try {
      const resultado = await listar(sesion.token, pagina)
      // El ítem de la lista está en resultado.data (¡doble data en el envelope!)
      items = resultado.data
      paginaActual = resultado.current_page
      ultimaPagina = resultado.last_page
      total = resultado.total
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
    get paginaActual() {
      return paginaActual
    },
    get ultimaPagina() {
      return ultimaPagina
    },
    get total() {
      return total
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
