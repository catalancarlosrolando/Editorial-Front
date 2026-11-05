// Capa de acceso a la API para medios: SOLO lectura (listar con filtros + tipos).
// No existen endpoints de crear/editar/eliminar medios en el alcance.
import { BASE_URL } from '../config.js'

// Listar con filtros opcionales { type, name }. URLSearchParams codifica
// bien los valores (un nombre con espacios o & no rompe la URL).
export async function listar(token, filtros = {}) {
  const params = new URLSearchParams()
  if (filtros.type) params.set('type', filtros.type)
  if (filtros.name) params.set('name', filtros.name)
  const query = params.toString()
  const url =
    query === ''
      ? `${BASE_URL}/admin/channels/medias`
      : `${BASE_URL}/admin/channels/medias?${query}`

  const res = await fetch(url, {
    headers: {
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + token
    }
  })
  if (res.status === 401) throw new Error('SESION_INVALIDA')
  if (!res.ok) throw new Error('HTTP ' + res.status)
  const cuerpo = await res.json()
  return cuerpo.data // SIN paginación: cuerpo.data ES el array
}

// Tipos de medio para el filtro del listado.
export async function tipos(token) {
  const res = await fetch(`${BASE_URL}/admin/channels/media-types`, {
    headers: {
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + token
    }
  })
  if (res.status === 401) throw new Error('SESION_INVALIDA')
  if (!res.ok) throw new Error('HTTP ' + res.status)
  const cuerpo = await res.json()
  return cuerpo.data
}
