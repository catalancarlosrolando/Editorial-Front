// Capa de acceso a la API para notificaciones: listar (últimas 50), conteo de
// no leídas, marcar leída (una o todas) y eliminar. Sin paginación en ningún caso.
import { BASE_URL } from '../config.js'

// La spec pide mostrar título, mensaje, fecha y leída/sin leer, pero el backend
// puede envolver esos datos (ej. notificaciones Laravel traen data: { title, message }
// y read_at). Normalizamos ACÁ para que el resto de la app vea siempre la misma forma.
function normalizar(notificacion) {
  const datos = notificacion.data ?? {}
  return {
    id: notificacion.id,
    titulo: notificacion.title ?? datos.title ?? datos.titulo ?? 'Notificación',
    mensaje: notificacion.message ?? datos.message ?? datos.mensaje ?? '',
    leida: Boolean(notificacion.read_at) || notificacion.read === true,
    fecha: notificacion.created_at ?? notificacion.date ?? null
  }
}

// Últimas 50 notificaciones, SIN paginación. La lección de la etapa A: la forma
// exacta se confirma en la pestaña Network; mientras tanto aceptamos array pelado
// o envuelto (data.data).
export async function listar(token) {
  const res = await fetch(`${BASE_URL}/notifications`, {
    headers: {
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + token
    }
  })
  if (res.status === 401) throw new Error('SESION_INVALIDA')
  if (!res.ok) throw new Error('HTTP ' + res.status)
  const cuerpo = await res.json()
  const datos = cuerpo.data
  const lista = Array.isArray(datos) ? datos : Array.isArray(datos?.data) ? datos.data : []
  return lista.map(normalizar)
}

// Cantidad de notificaciones sin leer (para el badge de la campana).
// El número puede venir pelado o dentro de un objeto: aceptamos ambas formas.
export async function contarNoLeidas(token) {
  const res = await fetch(`${BASE_URL}/notifications/unread-count`, {
    headers: {
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + token
    }
  })
  if (res.status === 401) throw new Error('SESION_INVALIDA')
  if (!res.ok) throw new Error('HTTP ' + res.status)
  const cuerpo = await res.json()
  const datos = cuerpo.data
  if (typeof datos === 'number') return datos
  return Number(datos?.unread_count ?? datos?.count ?? 0) || 0
}

// PATCH: marca UNA notificación como leída.
export async function marcarLeida(token, id) {
  const res = await fetch(`${BASE_URL}/notifications/${id}/read`, {
    method: 'PATCH',
    headers: {
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + token
    }
  })
  if (res.status === 401) throw new Error('SESION_INVALIDA')
  if (!res.ok) throw new Error('HTTP ' + res.status)
  return (await res.json()).message
}

// POST: marca TODAS las notificaciones como leídas.
export async function marcarTodasLeidas(token) {
  const res = await fetch(`${BASE_URL}/notifications/read-all`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + token
    }
  })
  if (res.status === 401) throw new Error('SESION_INVALIDA')
  if (!res.ok) throw new Error('HTTP ' + res.status)
  return (await res.json()).message
}

// DELETE: elimina una notificación.
export async function eliminar(token, id) {
  const res = await fetch(`${BASE_URL}/notifications/${id}`, {
    method: 'DELETE',
    headers: {
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + token
    }
  })
  if (res.status === 401) throw new Error('SESION_INVALIDA')
  if (!res.ok) throw new Error('HTTP ' + res.status)
  return (await res.json()).message
}
