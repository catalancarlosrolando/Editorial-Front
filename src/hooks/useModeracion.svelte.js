// Hook useModeracion (etapa F): la cola de revisión del moderador.
// Mucho más simple que usePublicaciones: un solo listado paginado sin
// filtros (el backend ordena FIFO por created_at) y DOS operaciones que
// corren desde Confirmar (aprobar con comentario opcional, rechazar con
// comentario obligatorio). Mismo esqueleto que el resto de los hooks:
//   error           → carga del listado (pantalla completa, con Reintentar)
//   errorDetalle    → carga del detalle en diálogo (mismo DialogoPublicacion
//                     que Publicaciones, con Reintentar propio)
//   erroresDialogo  → 422/403 de aprobar/rechazar, bajo el campo del
//                     Confirmar (que queda abierto para corregir)
//   mensaje         → aviso de éxito (cuerpo.message del backend)
//   idOperando      → id del post en vuelo: ocupa SU Confirmar
import { listar, aprobar as aprobarApi, rechazar as rechazarApi } from '../api/moderacion.api.js'
import { detalle as detalleApi } from '../api/publicaciones.api.js'
import { sesion, cerrarSesion } from '../sesion.svelte.js'
import { navigate } from '../router.js'
import { mensajeDeError } from '../errores.js'

export function useModeracion() {
  let items = $state([])
  let paginaActual = $state(1)
  let ultimaPagina = $state(1)
  let total = $state(0)
  let cargando = $state(false)
  let error = $state('')

  let idOperando = $state(null)
  let erroresDialogo = $state([])
  let mensaje = $state('')

  // Detalle en diálogo: { resumen, datos }, igual que usePublicaciones. La
  // fila de la cola ya viene completa, pero pedir GET /posts/{id} garantiza
  // que las dos pantallas muestren EXACTAMENTE lo mismo (medias, comentarios
  // del moderador, adjuntos...), con los mismos estados de carga y error.
  let detalle = $state(null)
  let cargandoDetalle = $state(false)
  let errorDetalle = $state('')

  // Guardia anti-carrera: paginar rápido no debe dejar una respuesta vieja
  // pisando a la nueva (patrón de todas las etapas).
  let pedido = 0

  // Guardia anti-carrera del detalle: abrir otra fila mientras vuela el
  // pedido anterior no debe dejar pintar la respuesta vieja.
  let pedidoDetalle = 0

  function manejarSesion(e) {
    if (e.message !== 'SESION_INVALIDA') return false
    cerrarSesion()
    navigate('/login')
    return true
  }

  // Como no hay filtros que conservar, acá el parámetro es solo la página.
  async function cargar(pagina = 1) {
    pedido++
    const mio = pedido
    cargando = true
    error = ''
    try {
      const resultado = await listar(sesion.token, pagina)
      if (mio !== pedido) return
      items = resultado.items
      paginaActual = resultado.paginaActual
      ultimaPagina = resultado.ultimaPagina
      total = resultado.total
    } catch (e) {
      if (mio !== pedido) return
      if (!manejarSesion(e)) error = mensajeDeError(e)
    } finally {
      if (mio === pedido) cargando = false
    }
  }

  function reintentar() {
    cargar(paginaActual)
  }

  function cambiarPagina(pagina) {
    cargar(pagina)
  }

  // Detalle en diálogo: mismo patrón que usePublicaciones.abrirDetalle
  // (fuente de verdad en el backend, guardia anti-carrera incluida).
  // Devuelve nada: el estado queda en el hook.
  async function abrirDetalle(post) {
    pedidoDetalle++
    const mio = pedidoDetalle
    detalle = { resumen: post, datos: null }
    cargandoDetalle = true
    errorDetalle = ''
    try {
      const datos = await detalleApi(sesion.token, post.id)
      if (mio !== pedidoDetalle) return
      detalle = { resumen: post, datos }
    } catch (e) {
      if (mio !== pedidoDetalle) return
      if (!manejarSesion(e)) errorDetalle = mensajeDeError(e)
    } finally {
      if (mio === pedidoDetalle) cargandoDetalle = false
    }
  }

  // Cierra el detalle (lo llama el diálogo al cerrar, y la página al paginar
  // la cola: los datos quedarían viejos). El pedidoDetalle++ cancela
  // cualquier carga en vuelo: su respuesta ya no pinta nada.
  function cerrarDetalle() {
    pedidoDetalle++
    detalle = null
  }

  // Aprobar o rechazar comparten el mismo flujo: corren por evento (el
  // submit del Confirmar), ocupan SU diálogo con idOperando, y al terminar
  // refrescan la cola y muestran cuerpo.message. Devuelven true si salió
  // bien: la página cierra el diálogo en ese caso.
  async function operar(post, accion, comentario) {
    if (idOperando !== null) return false
    idOperando = post.id
    erroresDialogo = []
    mensaje = ''
    try {
      const resultado =
        accion === 'aprobar'
          ? await aprobarApi(sesion.token, post.id, comentario)
          : await rechazarApi(sesion.token, post.id, comentario)
      if (resultado.errores) {
        erroresDialogo = resultado.errores
        return false
      }
      if (resultado.error) {
        erroresDialogo = [resultado.error]
        return false
      }
      mensaje = resultado.mensaje
      await cargar(paginaActual)
      return true
    } catch (e) {
      if (!manejarSesion(e)) erroresDialogo = [mensajeDeError(e)]
      return false
    } finally {
      idOperando = null
    }
  }

  function limpiarErroresDialogo() {
    erroresDialogo = []
  }

  function quitarMensaje() {
    mensaje = ''
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
    get detalle() {
      return detalle
    },
    get cargandoDetalle() {
      return cargandoDetalle
    },
    get errorDetalle() {
      return errorDetalle
    },
    get idOperando() {
      return idOperando
    },
    get erroresDialogo() {
      return erroresDialogo
    },
    get mensaje() {
      return mensaje
    },
    cargar,
    reintentar,
    cambiarPagina,
    abrirDetalle,
    cerrarDetalle,
    operar,
    limpiarErroresDialogo,
    quitarMensaje
  }
}
