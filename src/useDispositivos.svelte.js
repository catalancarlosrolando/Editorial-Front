// Hook useDispositivos: estado de la página de dispositivos (listado PAGINADO)
// y llamadas a la capa api. Sin edición: crear y eliminar alcanzan.
import { listar, crear, eliminar } from './api/dispositivos.api.js'
import { sesion, cerrarSesion } from './sesion.svelte.js'
import { navigate } from './router.js'
import { mensajeDeError } from './errores.js'

export function useDispositivos() {
  let items = $state([])
  let paginaActual = $state(1)
  let ultimaPagina = $state(1)
  let total = $state(0)
  let cargando = $state(false)
  let guardando = $state(false)
  let eliminandoId = $state(null)
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

  // Devuelve true si se creó. El uid lo genera el backend, así que tras crear
  // recargamos el listado para mostrar el dispositivo con su uid.
  async function agregar(datos) {
    guardando = true
    try {
      const resultado = await crear(sesion.token, datos)
      if (resultado.errores) {
        return false
      }
      await cargar(paginaActual)
      // Si el nuevo dispositivo no cayó en esta página (depende del orden del
      // backend), lo buscamos en la última, donde suele estar lo más nuevo.
      const creado = resultado.dispositivo
      const estaAca = items.some((d) => d.id === creado.id)
      if (!estaAca && ultimaPagina > paginaActual) {
        await cargar(ultimaPagina)
      }
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
      // Si borramos el último de la página y no es la primera, retrocedemos una
      // para no quedarnos mirando una página vacía.
      const eraElUltimoDeLaPagina = items.length === 1
      if (eraElUltimoDeLaPagina && paginaActual > 1) {
        await cargar(paginaActual - 1)
      } else {
        await cargar(paginaActual)
      }
    } catch (e) {
      manejarError(e)
    } finally {
      eliminandoId = null
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
    get guardando() {
      return guardando
    },
    get eliminandoId() {
      return eliminandoId
    },
    get error() {
      return error
    },
    cargar,
    agregar,
    quitar
  }
}
