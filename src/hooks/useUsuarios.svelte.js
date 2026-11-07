// Hook useUsuarios: estado y lógica de la administración de usuarios (etapa C).
// Es la página con más máquina de estados hasta ahora: listado PAGINADO +
// filtros recombinables + orden + ciclo de vida (aprobar/rechazar/habilitar/
// deshabilitar) + roles + historial. Cada error tiene SU lugar:
//   error            → carga del listado (pantalla completa, con Reintentar)
//   erroresDialogo   → 422/403 de approve/reject/enable/disable (en el Confirmar)
//   errorRoles / erroresRoles → del panel de roles (403 RN-U04 / 422 por campo)
//   errorHistorial   → carga del historial (en su panel)
//   mensaje          → aviso de éxito (cuerpo.message del backend)
import {
  listar,
  cambiarEstado as cambiarEstadoApi,
  asignarRol as asignarRolApi,
  revocarRol as revocarRolApi,
  historial as historialApi
} from '../api/usuarios.api.js'
import { sesion, cerrarSesion } from '../sesion.svelte.js'
import { navigate } from '../router.js'
import { mensajeDeError } from '../errores.js'

export function useUsuarios() {
  // Listado paginado
  let items = $state([])
  let paginaActual = $state(1)
  let ultimaPagina = $state(1)
  let total = $state(0)
  let cargando = $state(false)
  let error = $state('')

  // Últimos filtros aplicados: cambiar de página los conserva.
  let filtros = $state({})

  // Operaciones (cambios de estado y roles)
  let operando = $state(false)
  let erroresDialogo = $state([])
  let errorRoles = $state('')
  let erroresRoles = $state([])
  let mensaje = $state('')

  // Historial (panel por usuario)
  let historial = $state(null) // { usuario, items }
  let cargandoHistorial = $state(false)
  let errorHistorial = $state('')

  // Guardia anti-carrera del listado: filtros y páginas pueden cambiarse
  // rápido; la respuesta VIEJA no debe pisar a la nueva (patrón etapa A).
  let pedido = 0

  // Guardia anti-carrera del historial: se puede abrir el de otro usuario
  // mientras vuela el pedido anterior.
  let pedidoHistorial = 0

  // Devuelve true si el error era de sesión inválida (401): en ese caso ya
  // limpió la sesión y redirigió al login, y el que llama no hace nada más.
  function manejarSesion(e) {
    if (e.message !== 'SESION_INVALIDA') return false
    cerrarSesion()
    navigate('/login')
    return true
  }

  // Carga una página del listado. Recibe los filtros SIEMPRE por parámetro:
  // esta función puede llamarse desde el $effect de la página, y si leyera el
  // $state interno (o lo escribiera) el efecto terminaría dependiendo de él y
  // se re-dispararía a sí mismo en cada corrida (mismo cuidado que
  // useAsignaciones: el id va por parámetro, no se lee elegidoId adentro).
  // Los filtros vigentes los leen los wrappers de abajo, que solo corren
  // desde eventos (clicks), donde leer estado no genera tracking.
  async function cargar(pagina = 1, filtrosPedido = {}) {
    pedido++
    const mio = pedido
    cargando = true
    error = ''
    mensaje = ''
    try {
      const resultado = await listar(sesion.token, pagina, filtrosPedido)
      if (mio !== pedido) return
      items = resultado.usuarios
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
  // menos páginas que la actual. Guarda los filtros vigentes para que las
  // demás operaciones (paginar, aprobar, roles…) recarguen con los mismos.
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

  // Ciclo de vida (RN-U02): accion ∈ approve | reject | enable | disable.
  // Devuelve true si el diálogo Confirmar puede cerrarse; si hubo 422 o 403,
  // los mensajes quedan en erroresDialogo y el diálogo sigue abierto.
  async function cambiarEstado(accion, usuario, motivo) {
    operando = true
    erroresDialogo = []
    mensaje = ''
    try {
      const resultado = await cambiarEstadoApi(sesion.token, usuario.id, accion, motivo)
      if (resultado.errores) {
        // Transición inválida (422) o auto-protección RN-U03 (403): el
        // mensaje del backend se muestra dentro del propio diálogo.
        erroresDialogo = resultado.errores
        return false
      }
      // El estado de la fila cambió: recargamos la página actual (con los
      // filtros vigentes) para que el badge y el menú reflejen el nuevo estado.
      // El aviso se setea DESPUÉS: cargar() limpia mensaje al arrancar.
      await cargar(paginaActual, filtros)
      mensaje = resultado.mensaje
      return true
    } catch (e) {
      if (manejarSesion(e)) return true // ya vamos al login: igual cerrar el diálogo
      erroresDialogo = [mensajeDeError(e)]
      return false
    } finally {
      operando = false
    }
  }

  // Roles: asignar o revocar. Ambos refrescan el listado para que los badges
  // de la fila muestren los roles vigentes según el backend.
  async function cambiarRol(funcionApi, usuario, rol) {
    operando = true
    errorRoles = ''
    erroresRoles = []
    mensaje = ''
    try {
      const resultado = await funcionApi(sesion.token, usuario.id, rol)
      if (resultado.errores) {
        // 422 por campo (role): el panel lo muestra bajo los formularios.
        erroresRoles = Object.values(resultado.errores).flat()
        return
      }
      if (resultado.error) {
        // 403 de auto-protección (RN-U04): message del backend en el panel.
        errorRoles = resultado.error
        return
      }
      await cargar(paginaActual, filtros)
      // Después del reload por la misma razón que en cambiarEstado.
      mensaje = resultado.mensaje
    } catch (e) {
      if (!manejarSesion(e)) errorRoles = mensajeDeError(e)
    } finally {
      operando = false
    }
  }

  function asignarRol(usuario, rol) {
    return cambiarRol(asignarRolApi, usuario, rol)
  }

  function revocarRol(usuario, rol) {
    return cambiarRol(revocarRolApi, usuario, rol)
  }

  // Limpia los errores del panel de roles (se llama al abrirlo para otro
  // usuario, para que no aparezcan errores del anterior).
  function limpiarErroresRoles() {
    errorRoles = ''
    erroresRoles = []
  }

  // Historial de un usuario: siempre re-consulta el backend (fuente de verdad).
  async function verHistorial(usuario) {
    pedidoHistorial++
    const mio = pedidoHistorial
    historial = { usuario, items: [] }
    cargandoHistorial = true
    errorHistorial = ''
    try {
      const lista = await historialApi(sesion.token, usuario.id)
      if (mio !== pedidoHistorial) return
      historial = { usuario, items: lista }
    } catch (e) {
      if (mio !== pedidoHistorial) return
      if (!manejarSesion(e)) errorHistorial = mensajeDeError(e)
    } finally {
      if (mio === pedidoHistorial) cargandoHistorial = false
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
    get operando() {
      return operando
    },
    get erroresDialogo() {
      return erroresDialogo
    },
    get errorRoles() {
      return errorRoles
    },
    get erroresRoles() {
      return erroresRoles
    },
    get mensaje() {
      return mensaje
    },
    get historial() {
      return historial
    },
    get cargandoHistorial() {
      return cargandoHistorial
    },
    get errorHistorial() {
      return errorHistorial
    },
    cargar,
    aplicarFiltros,
    cambiarPagina,
    reintentar,
    cambiarEstado,
    asignarRol,
    revocarRol,
    limpiarErroresRoles,
    verHistorial
  }
}
