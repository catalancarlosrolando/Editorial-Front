// Capa de acceso a la API para las RELACIONES N:M:
//   canal ↔ medios  →  /admin/channels/{id}/medias          (etapa A)
//   dispositivo ↔ canales  →  /admin/device-channels/{device}  (etapa A)
//   usuario ↔ canales  →  /admin/user-channels/{user}       (etapa C)
// Esta capa no sabe nada de la UI: solo fetch, el envelope del backend y
// la convención de errores (401 → SESION_INVALIDA, 422 → errores por campo).
import { BASE_URL } from '../config.js'

// GET genérico de asociación: devuelve SIEMPRE un array de ítems asociados.
// La lista puede venir de tres formas según el endpoint:
//   data = { device: {...}, channels: [...] }  ← forma real (dueño + lista)
//   data = [ ... ]                             (array directo)
//   data = { data: [...] }                     (Resource/paginado de Laravel)
// Cada función le dice en 'claveLista' dónde está SU lista y acá se
// normaliza, para que la UI no tenga que adivinar la forma de la respuesta.
async function traerAsociados(url, token, claveLista) {
  const res = await fetch(url, {
    headers: {
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + token
    }
  })
  if (res.status === 401) throw new Error('SESION_INVALIDA')
  if (!res.ok) throw new Error('HTTP ' + res.status)
  const cuerpo = await res.json()
  const datos = cuerpo.data
  if (Array.isArray(datos?.[claveLista])) return datos[claveLista]
  if (Array.isArray(datos)) return datos
  if (Array.isArray(datos?.data)) return datos.data
  return []
}

// POST y DELETE comparten la misma forma: mismo endpoint, distinto método y
// body. En 422 devuelve { errores } (el formulario los muestra por campo) y
// si sale bien devuelve { mensaje } con el cuerpo.message del backend.
async function enviarLista(metodo, url, token, cuerpo) {
  const res = await fetch(url, {
    method: metodo,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify(cuerpo)
  })
  if (res.status === 401) throw new Error('SESION_INVALIDA')
  const respuesta = await res.json()
  if (res.status === 422) return { errores: respuesta.errors }
  if (!res.ok) throw new Error('HTTP ' + res.status)
  return { mensaje: respuesta.message }
}

// ── Canal ↔ medios ──

// Medios asociados a un canal: data = { channel: {...}, medias: [...] }.
export function mediosDeCanal(token, canalId) {
  return traerAsociados(`${BASE_URL}/admin/channels/${canalId}/medias`, token, 'medias')
}

// Asociar medios a un canal. El backend usa syncWithoutDetaching: AGREGA los
// enviados sin borrar los que ya estaban (por eso el hook manda solo los que
// faltan).
export function asignarMedios(token, canalId, idsMedios) {
  return enviarLista('POST', `${BASE_URL}/admin/channels/${canalId}/medias`, token, {
    media_ids: idsMedios
  })
}

// Desasociar: DELETE con body, quita SOLO los ids enviados (no vacía todo).
export function desasignarMedios(token, canalId, idsMedios) {
  return enviarLista('DELETE', `${BASE_URL}/admin/channels/${canalId}/medias`, token, {
    media_ids: idsMedios
  })
}

// ── Dispositivo ↔ canales ──

// Canales asociados a un dispositivo: data = { device: {...}, channels: [...] }.
export function canalesDeDispositivo(token, dispositivoId) {
  return traerAsociados(`${BASE_URL}/admin/device-channels/${dispositivoId}`, token, 'channels')
}

// Asociar canales a un dispositivo (también syncWithoutDetaching).
export function asignarCanales(token, dispositivoId, idsCanales) {
  return enviarLista('POST', `${BASE_URL}/admin/device-channels/${dispositivoId}`, token, {
    channel_ids: idsCanales
  })
}

// Desasociar canales de un dispositivo.
export function desasignarCanales(token, dispositivoId, idsCanales) {
  return enviarLista('DELETE', `${BASE_URL}/admin/device-channels/${dispositivoId}`, token, {
    channel_ids: idsCanales
  })
}

// ── Usuario ↔ canales (etapa C) ──

// Publicadores con sus canales: GET /admin/user-channels/publishers, PAGINADO
// a 7 por página (forma estándar de Laravel: data.data + current_page/...).
export async function listarPublishers(token, pagina = 1) {
  const res = await fetch(`${BASE_URL}/admin/user-channels/publishers?page=${pagina}`, {
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

// Trae TODAS las páginas (a 7 fijas) recorriéndolas una a una. Se usa para el
// <select> de /publicadores: hay que poder elegir cualquier publicador, no
// solo los de la primera página. Mismo patrón que dispositivos.listarTodos().
export async function listarPublishersTodos(token) {
  const publicadores = []
  let pagina = 1
  while (true) {
    const resultado = await listarPublishers(token, pagina)
    publicadores.push(...(Array.isArray(resultado.data) ? resultado.data : []))
    if ((resultado.current_page ?? 1) >= (resultado.last_page ?? 1)) break
    pagina++
  }
  return publicadores
}

// Canales asignados a un publicador: data = { user: {...}, channels: [...] }
// (misma forma dueño + lista que device-channels, la lección de la etapa A).
export function canalesDeUsuario(token, usuarioId) {
  return traerAsociados(`${BASE_URL}/admin/user-channels/${usuarioId}`, token, 'channels')
}

// Asignar canales a un publicador (agrega los enviados).
export function asignarCanalesAUsuario(token, usuarioId, idsCanales) {
  return enviarLista('POST', `${BASE_URL}/admin/user-channels/${usuarioId}`, token, {
    channel_ids: idsCanales
  })
}

// Revocar canales de un publicador (quita SOLO los ids enviados).
export function revocarCanalesDeUsuario(token, usuarioId, idsCanales) {
  return enviarLista('DELETE', `${BASE_URL}/admin/user-channels/${usuarioId}`, token, {
    channel_ids: idsCanales
  })
}
