// Hook useNotificaciones: estado COMPARTIDO de notificaciones.
// A diferencia de los hooks de fase 1 (estado por página), acá el $state vive a
// nivel de módulo (mismo patrón §6.2 que sesion.svelte.js): así la campana de la
// topbar y la página /notificaciones ven los MISMOS datos sin stores. Si la página
// marca algo como leído, el badge de la campana se actualiza al instante.
import {
  listar,
  contarNoLeidas,
  marcarLeida as marcarLeidaApi,
  marcarTodasLeidas,
  eliminar as eliminarApi
} from '../api/notificaciones.api.js'
import { sesion, cerrarSesion } from '../sesion.svelte.js'
import { navigate } from '../router.js'
import { mensajeDeError } from '../errores.js'

const estado = $state({
  items: [],          // últimas 50 notificaciones (forma ya normalizada por api/)
  noLeidas: 0,        // conteo para el badge de la campana
  cargando: false,    // carga inicial del listado
  error: '',          // error de CARGA del listado
  operandoId: null,   // id de la fila con una operación en curso (marcar/eliminar)
  operandoTodas: false, // "marcar todas" en curso
  errorOperacion: ''  // error de OPERACIÓN (distinto del error de carga)
})

export function useNotificaciones() {
  // El 401 se trata igual en todos los hooks: sesión afuera y al login.
  // Devuelve true si lo manejó, para que quien llamó no pise la pantalla de login.
  function procesarSesion(e) {
    if (e.message === 'SESION_INVALIDA') {
      cerrarSesion()
      navigate('/login')
      return true
    }
    return false
  }

  async function cargar() {
    estado.cargando = true
    estado.error = ''
    estado.errorOperacion = ''
    try {
      estado.items = await listar(sesion.token)
    } catch (e) {
      if (!procesarSesion(e)) estado.error = mensajeDeError(e)
    } finally {
      estado.cargando = false
    }
  }

  // Guardia anti-carrera (contador plano): si el poll de cada 30 s se cruza con
  // la revalidación tras una acción, la respuesta VIEJA no pisa el conteo fresco.
  let pedidoConteo = 0
  async function cargarConteo() {
    pedidoConteo++
    const mio = pedidoConteo
    try {
      const n = await contarNoLeidas(sesion.token)
      if (mio === pedidoConteo) estado.noLeidas = n
    } catch (e) {
      // El conteo es secundario: si falla, el badge simplemente no se mueve.
      // Solo nos importa el 401 (sesión vencida).
      procesarSesion(e)
    }
  }

  async function marcarLeida(id) {
    estado.operandoId = id
    estado.errorOperacion = ''
    try {
      await marcarLeidaApi(sesion.token, id)
      const notificacion = estado.items.find((n) => n.id === id)
      if (notificacion) notificacion.leida = true
      cargarConteo() // el backend es la fuente de la verdad del badge
    } catch (e) {
      if (!procesarSesion(e)) estado.errorOperacion = mensajeDeError(e)
    } finally {
      estado.operandoId = null
    }
  }

  async function marcarTodas() {
    estado.operandoTodas = true
    estado.errorOperacion = ''
    try {
      await marcarTodasLeidas(sesion.token)
      for (const n of estado.items) n.leida = true
      estado.noLeidas = 0 // marcar TODO lo leído deja el conteo en cero por definición
    } catch (e) {
      if (!procesarSesion(e)) estado.errorOperacion = mensajeDeError(e)
    } finally {
      estado.operandoTodas = false
    }
  }

  async function eliminar(id) {
    estado.operandoId = id
    estado.errorOperacion = ''
    try {
      await eliminarApi(sesion.token, id)
      estado.items = estado.items.filter((n) => n.id !== id)
      cargarConteo() // si la eliminada estaba sin leer, el conteo cambió
    } catch (e) {
      if (!procesarSesion(e)) estado.errorOperacion = mensajeDeError(e)
    } finally {
      estado.operandoId = null
    }
  }

  return {
    get items() {
      return estado.items
    },
    get noLeidas() {
      return estado.noLeidas
    },
    get cargando() {
      return estado.cargando
    },
    get error() {
      return estado.error
    },
    get operandoId() {
      return estado.operandoId
    },
    get operandoTodas() {
      return estado.operandoTodas
    },
    get errorOperacion() {
      return estado.errorOperacion
    },
    cargar,
    cargarConteo,
    marcarLeida,
    marcarTodas,
    eliminar
  }
}
