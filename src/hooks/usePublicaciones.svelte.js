// Hook usePublicaciones: estado y lógica del listado de publicaciones
// (etapa D). Es el caso más complejo de filtros hasta ahora: muchos parámetros
// recombinables + orden + tamaño de página, más el DETALLE EXPANDIBLE por
// fila (fetch GET /posts/{id} recién al abrir la fila). Cada error tiene SU
// lugar:
//   error          → carga del listado (pantalla completa, con Reintentar)
//   errorDetalle   → carga del detalle expandido (dentro de la fila)
//   mensaje        → reservado para avisos de éxito (etapas E/F)
// El alcance por rol NO se toca acá: el backend ya devuelve solo lo que el
// usuario puede ver; el hook muestra lo que llega.
import { listar, detalle as detalleApi } from '../api/publicaciones.api.js'
import { sesion, cerrarSesion } from '../sesion.svelte.js'
import { navigate } from '../router.js'
import { mensajeDeError } from '../errores.js'

export function usePublicaciones() {
  // Listado paginado
  let items = $state([])
  let paginaActual = $state(1)
  let ultimaPagina = $state(1)
  let total = $state(0)
  let cargando = $state(false)
  let error = $state('')

  // Últimos filtros aplicados (incluyen per_page y orden): cambiar de página
  // los conserva, así el paginado no "resetea" la búsqueda.
  let filtros = $state({})

  // Detalle expandible: { resumen, datos }. 'resumen' es la fila del listado
  // (para pintar al instante) y 'datos' lo que responde GET /posts/{id}.
  let detalle = $state(null)
  let cargandoDetalle = $state(false)
  let errorDetalle = $state('')

  // Guardia anti-carrera del listado: filtros y páginas pueden cambiarse
  // rápido; la respuesta VIEJA no debe pisar a la nueva (patrón etapas A/C).
  let pedido = 0

  // Guardia anti-carrera del detalle: se puede abrir la fila B mientras vuela
  // el pedido de la fila A.
  let pedidoDetalle = 0

  // Devuelve true si el error era de sesión inválida (401): en ese caso ya
  // limpió la sesión y redirigió al login, y el que llama no hace nada más.
  function manejarSesion(e) {
    if (e.message !== 'SESION_INVALIDA') return false
    cerrarSesion()
    navigate('/login')
    return true
  }

  // Carga una página del listado. Recibe los filtros SIEMPRE por parámetro:
  // esta función corre desde el $effect de la página, y si leyera el $state
  // interno el efecto terminaría dependiendo de él y se re-dispararía a sí
  // mismo (lección de la etapa C: el estado solo se lee en wrappers que
  // corren por eventos, nunca dentro del efecto).
  async function cargar(pagina = 1, filtrosPedido = {}) {
    pedido++
    const mio = pedido
    cargando = true
    error = ''
    try {
      const resultado = await listar(sesion.token, pagina, filtrosPedido)
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

  // Aplicar filtros SIEMPRE vuelve a la página 1: el resultado puede ocupar
  // menos páginas que la actual (criterio de la etapa: combinar filtros sin
  // perder la página coherente). Guarda los filtros vigentes para que el
  // resto de las operaciones recargue con los mismos.
  function aplicarFiltros(nuevos) {
    filtros = nuevos
    cargar(1, nuevos)
  }

  function cambiarPagina(pagina) {
    cargar(pagina, filtros)
  }

  // Reintentar tras un error de carga: misma página y mismos filtros.
  function reintentar() {
    cargar(paginaActual, filtros)
  }

  // Detalle expandible: si la fila pedida ya está abierta, se cierra; si no,
  // se abre y consulta el backend (fuente de verdad, aunque el resumen del
  // listado ya traiga relaciones). Devuelve nada: el estado queda en el hook.
  async function alternarDetalle(post) {
    if (detalle?.resumen?.id === post.id) {
      detalle = null
      return
    }
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

  // Cierra el detalle sin importar cuál esté abierto (lo llama la página al
  // filtrar o paginar: los datos de la fila podrían quedar viejos).
  function cerrarDetalle() {
    detalle = null
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
    cargar,
    aplicarFiltros,
    cambiarPagina,
    reintentar,
    alternarDetalle,
    cerrarDetalle
  }
}
