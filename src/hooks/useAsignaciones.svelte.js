// Hook useAsignaciones: estado y lógica de las páginas de relación N:M.
// Tanto /asignar-medios (canal ↔ medios) como /asignar-canales (dispositivo ↔
// canales) siguen EXACTAMENTE el mismo flujo: elegir un dueño en el <select>,
// ver qué tiene asociado, pasar/quitar ítems y guardar. Solo cambian las
// funciones de la capa api, así que el hook las recibe por parámetro — igual
// que los componentes reciben callback props, pero a nivel de lógica.
//
// Detalle de backend que define el flujo de guardado:
//   POST usa syncWithoutDetaching → AGREGA lo enviado sin borrar lo existente.
//   DELETE desasocia SOLO los ids enviados.
// Por eso el hook calcula el "delta": lo que falta agregar y lo que sobra.
import { sesion, cerrarSesion } from '../sesion.svelte.js'
import { navigate } from '../router.js'
import { mensajeDeError } from '../errores.js'

export function useAsignaciones({
  cargarSelector,
  cargarFuente,
  cargarAsignadas,
  asociar,
  desasociar
}) {
  // Datos para la UI
  let opciones = $state([]) // ítems del <select> (canales o dispositivos)
  let fuente = $state([]) // lista completa para la columna "disponibles"
  let asignadas = $state([]) // lo que dice el backend para el elegido actual
  let elegidoId = $state('') // id del canal/dispositivo elegido ('' = ninguno)

  // Estados de carga y resultado
  let cargandoInicio = $state(false)
  let cargandoAsignadas = $state(false)
  let guardando = $state(false)
  let error = $state('') // error de la carga inicial (selector + fuente)
  let errorOperacion = $state('') // error al cargar/guardar lo asignado
  let mensaje = $state('') // cuerpo.message tras guardar
  let erroresValidacion = $state({}) // errores 422 por campo

  // Guardia anti-carrera del select dependiente: si el usuario cambia de
  // elección mientras vuela un pedido, el pedido viejo llega tarde y se ignora.
  let pedido = 0

  // Devuelve true si el error era de sesión inválida (401): en ese caso ya
  // limpió la sesión y redirigió al login, y el que llama no hace nada más.
  function esSesionInvalida(e) {
    if (e.message !== 'SESION_INVALIDA') return false
    cerrarSesion()
    navigate('/login')
    return true
  }

  // Carga inicial: lo del <select> y la lista completa de la fuente.
  async function cargarInicio() {
    cargandoInicio = true
    error = ''
    try {
      opciones = await cargarSelector(sesion.token)
      fuente = await cargarFuente(sesion.token)
    } catch (e) {
      if (!esSesionInvalida(e)) error = mensajeDeError(e)
    } finally {
      cargandoInicio = false
    }
  }

  // Trae lo asociado al id recibido (por defecto, el elegido). El id va por
  // parámetro y NO se lee elegidoId acá dentro: cuando la página dispara la
  // carga desde un $effect, el efecto solo tiene que reaccionar a su propio
  // estado y no termina también rastreando el estado interno del hook.
  // Si un pedido viejo llega tarde se descarta (guardia anti-carrera).
  async function traerAsignadas(id = elegidoId) {
    if (!id) return
    pedido++
    const mio = pedido
    cargandoAsignadas = true
    errorOperacion = ''
    try {
      const lista = await cargarAsignadas(sesion.token, id)
      if (mio !== pedido) return
      // Las funciones vienen inyectadas desde la página, así que no damos por
      // sentado la forma de su respuesta: si no devolvió un array, cae a vacío.
      asignadas = Array.isArray(lista) ? lista : []
    } catch (e) {
      if (mio !== pedido) return
      if (!esSesionInvalida(e)) errorOperacion = mensajeDeError(e)
    } finally {
      if (mio === pedido) cargandoAsignadas = false
    }
  }

  // Se dispara al cambiar el <select> (la página llama acá desde un $effect).
  async function elegir(id) {
    elegidoId = id
    mensaje = ''
    erroresValidacion = {}
    if (!id) {
      asignadas = []
      errorOperacion = ''
      return
    }
    await traerAsignadas(id)
  }

  // Guarda la relación: compara lo que dejó el usuario en la TransferList con
  // lo que tenía el backend, y manda dos listas distintas: las que faltan
  // van por POST (agrega sin borrar) y las que sobran por DELETE (quita solo
  // esas). Al final refresca: la fuente de verdad vuelve a ser el backend.
  async function guardar(idsFinales) {
    if (!elegidoId) return
    const idsOriginales = asignadas.map((a) => a.id)
    const aAgregar = idsFinales.filter((id) => !idsOriginales.includes(id))
    const aQuitar = idsOriginales.filter((id) => !idsFinales.includes(id))
    if (aAgregar.length === 0 && aQuitar.length === 0) return

    guardando = true
    errorOperacion = ''
    mensaje = ''
    erroresValidacion = {}
    try {
      if (aAgregar.length > 0) {
        const resultado = await asociar(sesion.token, elegidoId, aAgregar)
        if (resultado.errores) {
          erroresValidacion = resultado.errores
          return
        }
        mensaje = resultado.mensaje
      }
      if (aQuitar.length > 0) {
        const resultado = await desasociar(sesion.token, elegidoId, aQuitar)
        if (resultado.errores) {
          erroresValidacion = resultado.errores
          return
        }
        mensaje = resultado.mensaje
      }
      // Refresco sin pasar por elegir() para NO borrar el mensaje que
      // acaba de dejar el backend.
      await traerAsignadas()
    } catch (e) {
      if (!esSesionInvalida(e)) errorOperacion = mensajeDeError(e)
    } finally {
      guardando = false
    }
  }

  return {
    get opciones() {
      return opciones
    },
    get fuente() {
      return fuente
    },
    get asignadas() {
      return asignadas
    },
    get cargandoInicio() {
      return cargandoInicio
    },
    get cargandoAsignadas() {
      return cargandoAsignadas
    },
    get guardando() {
      return guardando
    },
    get error() {
      return error
    },
    get errorOperacion() {
      return errorOperacion
    },
    get mensaje() {
      return mensaje
    },
    get erroresValidacion() {
      return erroresValidacion
    },
    cargarInicio,
    elegir,
    traerAsignadas,
    guardar
  }
}
