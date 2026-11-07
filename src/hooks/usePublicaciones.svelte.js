// Hook usePublicaciones: estado y lógica del listado de publicaciones
// (etapa D) y del formulario crear/editar con selects en cascada (etapa E).
// Es el caso más complejo de filtros hasta ahora: muchos parámetros
// recombinables + orden + tamaño de página, el DETALLE EXPANDIBLE por
// fila (fetch GET /posts/{id} recién al abrir la fila) y el formulario con
// TRES cargas propias: canales del usuario, medios por canal elegido y el
// guardado en sí. Cada error tiene SU lugar:
//   error             → carga del listado (pantalla completa, con Reintentar)
//   errorDetalle      → carga del detalle expandido (dentro de la fila)
//   errorCanales      → carga de los canales autorizados del formulario
//   errorMedios       → carga de los medios de los canales elegidos
//   erroresFormulario → 422 de validación, UNA entrada por campo
//   errorFormulario   → 403 (RN-P01) o 422 de negocio (RN-P02/RN-P03)
//   mensaje           → aviso de éxito tras guardar
// El alcance por rol NO se toca acá: el backend ya devuelve solo lo que el
// usuario puede ver; el hook muestra lo que llega.
import {
  listar,
  detalle as detalleApi,
  crear as crearApi,
  editar as editarApi,
  canalesDelUsuario,
  mediasDeCanal
} from '../api/publicaciones.api.js'
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

  // ── Etapa E: formulario crear/editar ──
  // El estado de PANTALLA (formulario abierto o cerrado) lo maneja la página,
  // como en CanalesPagina; acá vive el estado de DATOS del formulario.

  // Canales autorizados del usuario (RN-P01): la base del cascado. Se cargan
  // cada vez que se abre el formulario (podrían haber cambiado asignaciones).
  let canalesUsuario = $state([])
  let cargandoCanales = $state(false)
  let errorCanales = $state('')

  // Medios disponibles = unión de los medios de los canales ELEGIDOS (RN-P02).
  // Cada medio lleva `canales: [ids]`: a qué canal de ESTA selección pertenece
  // (un medio puede estar en dos canales elegidos a la vez). El formulario lo
  // usa para limpiar de la selección los medios que quedaron sin canal.
  let mediasDisponibles = $state([])
  let cargandoMedios = $state(false)
  let errorMedios = $state('')

  // Guardias anti-carrera propias del cascado: cambiar canales rápido no
  // debe dejar una respuesta vieja pisando al catálogo nuevo.
  let pedidoCanales = 0
  let pedidoMedios = 0

  // Guardado: mientras vuela, la página deshabilita el botón; el resultado
  // es un objeto { errores } | { error } que cae en SU estado correspondiente.
  let guardando = $state(false)
  let erroresFormulario = $state({})
  let errorFormulario = $state('')

  // Aviso de éxito tras guardar (lo muestra la página; se limpia al abrir
  // el formulario de nuevo o al filtrar).
  let mensaje = $state('')

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

  // ── Etapa E: selects en cascada ──

  // Canales autorizados del usuario logueado. Se llama al abrir el
  // formulario; sin canales, la página muestra el aviso y no hay nada que
  // cargar (un admin sin asignaciones no puede publicar: RN-P01).
  async function cargarCanales() {
    pedidoCanales++
    const mio = pedidoCanales
    cargandoCanales = true
    errorCanales = ''
    try {
      const lista = await canalesDelUsuario(sesion.token, sesion.usuario?.id)
      if (mio !== pedidoCanales) return
      canalesUsuario = Array.isArray(lista) ? lista : []
    } catch (e) {
      if (mio !== pedidoCanales) return
      if (!manejarSesion(e)) errorCanales = mensajeDeError(e)
    } finally {
      if (mio === pedidoCanales) cargandoCanales = false
    }
  }

  // Medios de los canales elegidos: UN fetch por canal en paralelo y merge
  // por id, anotando en cada medio a qué canales de la selección pertenece.
  // Con selección vacía no hay nada que pedir: catálogo vacío directo.
  // La guardia anti-carrera es CLAVE acá: tildar/detildar rápido dispara
  // varios pedidos y solo el último manda.
  async function cargarMedios(idsCanales) {
    pedidoMedios++
    const mio = pedidoMedios
    if (idsCanales.length === 0) {
      mediasDisponibles = []
      cargandoMedios = false
      errorMedios = ''
      return
    }
    cargandoMedios = true
    errorMedios = ''
    try {
      const porCanal = await Promise.all(
        idsCanales.map(async (canalId) => ({
          canalId,
          medias: await mediasDeCanal(sesion.token, canalId)
        }))
      )
      if (mio !== pedidoMedios) return
      const porId = new Map()
      for (const { canalId, medias } of porCanal) {
        if (!Array.isArray(medias)) continue
        for (const medio of medias) {
          const previo = porId.get(medio.id)
          if (previo) {
            // El medio ya estaba (está en dos canales elegidos): se acumula.
            previo.canales.push(canalId)
          } else {
            porId.set(medio.id, { ...medio, canales: [canalId] })
          }
        }
      }
      mediasDisponibles = [...porId.values()].sort((a, b) =>
        String(a.name).localeCompare(String(b.name))
      )
    } catch (e) {
      if (mio !== pedidoMedios) return
      if (!manejarSesion(e)) errorMedios = mensajeDeError(e)
    } finally {
      if (mio === pedidoMedios) cargandoMedios = false
    }
  }

  // Guardar (crear si post es null, editar si no). Devuelve true si salió
  // bien: la página cierra el formulario en ese caso; si no, el error queda
  // en erroresFormulario (por campo) o errorFormulario (mensaje del backend)
  // y el formulario sigue abierto con lo que el usuario escribió.
  // Esta función corre por evento (submit), así que puede leer los $state
  // internos sin caer en el auto-rastreo del $effect (lección de la etapa C).
  async function guardar(post, datos) {
    guardando = true
    erroresFormulario = {}
    errorFormulario = ''
    mensaje = ''
    try {
      const resultado = post
        ? await editarApi(sesion.token, post.id, datos)
        : await crearApi(sesion.token, datos)
      if (resultado.errores) {
        erroresFormulario = resultado.errores
        return false
      }
      if (resultado.error) {
        errorFormulario = resultado.error
        return false
      }
      mensaje = resultado.mensaje
      // El listado queda viejo: recarga la MISMA página con los mismos
      // filtros. Si la fila editada está visible, ya aparece actualizada.
      cerrarDetalle()
      await cargar(paginaActual, filtros)
      return true
    } catch (e) {
      if (!manejarSesion(e)) errorFormulario = mensajeDeError(e)
      return false
    } finally {
      guardando = false
    }
  }

  // Limpia los errores del formulario (lo llama la página al cerrarlo).
  function limpiarErroresFormulario() {
    erroresFormulario = {}
    errorFormulario = ''
  }

  // Filtrar invalida el aviso de éxito (habla de una operación anterior).
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
    get canalesUsuario() {
      return canalesUsuario
    },
    get cargandoCanales() {
      return cargandoCanales
    },
    get errorCanales() {
      return errorCanales
    },
    get mediasDisponibles() {
      return mediasDisponibles
    },
    get cargandoMedios() {
      return cargandoMedios
    },
    get errorMedios() {
      return errorMedios
    },
    get guardando() {
      return guardando
    },
    get erroresFormulario() {
      return erroresFormulario
    },
    get errorFormulario() {
      return errorFormulario
    },
    get mensaje() {
      return mensaje
    },
    cargar,
    aplicarFiltros,
    cambiarPagina,
    reintentar,
    alternarDetalle,
    cerrarDetalle,
    cargarCanales,
    cargarMedios,
    guardar,
    limpiarErroresFormulario,
    quitarMensaje
  }
}
