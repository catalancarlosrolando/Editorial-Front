// Capa de acceso a la API de publicaciones (etapas D y E): listado con
// filtros complejos, detalle, y crear/editar con los selects en cascada
// (canales del publicador → medios de cada canal). Esta capa no sabe nada de
// la UI: solo fetch, el envelope del backend y la convención de errores
// (401 → SESION_INVALIDA, 422/403 → lo que el backend pueda explicar).
import { BASE_URL } from '../config.js'

// GET /posts — listado PAGINADO con filtros recombinables. El backend usa el
// paginado estándar de Laravel (ítems en data.data, a diferencia de
// /admin/users que trae data.users + data.pagination).
//
// El alcance por rol lo resuelve el backend (publicador: solo las suyas;
// mod/admin: todas) — acá no se filtra nada por rol.
//
// Por defecto el listado EXCLUYE las archived; solo aparecen si el filtro
// status=archived viaja explícitamente (la UI lo ofrece como opción del
// select de estado, y mientras el valor no esté elegido no se envía).
//
// Filtros aceptados (spec 05/07): search, status, type, channel_ids[],
// media_ids[], author_id, author_name, created_from/to, scheduled_from/to,
// published_from/to, has_attachments, sort_by, sort_order, per_page.
// Los arrays van con la sintaxis channel_ids[]=1&channel_ids[]=3 que usan
// los ejemplos de la spec; los escalares solo si tienen valor.
export async function listar(token, pagina = 1, filtros = {}) {
  const params = new URLSearchParams()
  params.set('page', pagina)
  for (const [clave, valor] of Object.entries(filtros)) {
    if (Array.isArray(valor)) {
      for (const item of valor) params.append(clave + '[]', item)
    } else if (valor !== '' && valor !== null && valor !== undefined) {
      params.set(clave, valor)
    }
  }
  const res = await fetch(`${BASE_URL}/posts?${params.toString()}`, {
    headers: {
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + token
    }
  })
  if (res.status === 401) throw new Error('SESION_INVALIDA')
  if (!res.ok) throw new Error('HTTP ' + res.status)
  const cuerpo = await res.json()
  const datos = cuerpo.data ?? {}
  return {
    items: Array.isArray(datos.data) ? datos.data : [],
    paginaActual: datos.current_page ?? 1,
    ultimaPagina: datos.last_page ?? 1,
    total: datos.total ?? 0
  }
}

// GET /posts/{id} — detalle completo (con channels, medias, attachments y
// user). El publicador solo puede ver las suyas: pedir una ajena responde
// 403, que se traduce al mensaje genérico de permisos en la capa de errores.
export async function detalle(token, id) {
  const res = await fetch(`${BASE_URL}/posts/${id}`, {
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

// GET /posts/channels/{user} — canales AUTORIZADOS del publicador (RN-P01):
// al crear/editar solo se puede publicar en canales asignados en
// user_channels. Se consulta con el ID del propio usuario (los permisos del
// grupo /posts son editar-contenido, así que publicador y admin pueden).
// El backend (UserChannelController@show) responde { user, channels: [...] };
// el normalizador acepta también un array pelado o data.data (lección de la
// etapa A: no asumir una única forma).
export async function canalesDelUsuario(token, usuarioId) {
  const res = await fetch(`${BASE_URL}/posts/channels/${usuarioId}`, {
    headers: {
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + token
    }
  })
  if (res.status === 401) throw new Error('SESION_INVALIDA')
  if (!res.ok) throw new Error('HTTP ' + res.status)
  const cuerpo = await res.json()
  const datos = cuerpo.data ?? {}
  if (Array.isArray(datos)) return datos
  return Array.isArray(datos.channels) ? datos.channels : []
}

// GET /posts/{channel}/medias — medios asociados a UN canal (RN-P02: los
// media_ids del post deben pertenecer a los channel_ids elegidos, así que el
// formulario solo ofrece medios de los canales seleccionados). Es la versión
// del grupo /posts (permiso editar-contenido), NO la de /admin, para que un
// publicador pueda usarla. Responde data = array de medios pelado.
export async function mediasDeCanal(token, canalId) {
  const res = await fetch(`${BASE_URL}/posts/${canalId}/medias`, {
    headers: {
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + token
    }
  })
  if (res.status === 401) throw new Error('SESION_INVALIDA')
  if (!res.ok) throw new Error('HTTP ' + res.status)
  const cuerpo = await res.json()
  return Array.isArray(cuerpo.data) ? cuerpo.data : []
}

// POST /posts (201) y PUT /posts/{id} (200) comparten forma de respuesta y
// de errores, así que van por un mismo helper privado:
//   { post, mensaje }   → salió bien
//   { errores }         → 422 de VALIDACIÓN (cuerpo.errors por campo)
//   { error }           → 403 (RN-P01) o 422 de NEGOCIO (RN-P02, RN-P03):
//                         el backend manda message pero SIN objeto errors
// Nota: sin adjuntos en esta etapa, el body es JSON puro (el endpoint
// acepta multipart o JSON; con JSON no hace falta FormData).
async function enviarFormulario(token, metodo, url, datos) {
  const res = await fetch(url, {
    method: metodo,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify(datos)
  })
  if (res.status === 401) throw new Error('SESION_INVALIDA')
  const cuerpo = await res.json().catch(() => ({}))
  if (res.status === 422 || res.status === 403) {
    if (cuerpo.errors) return { errores: cuerpo.errors }
    return { error: cuerpo.message ?? 'No se pudo guardar la publicación.' }
  }
  if (!res.ok) throw new Error('HTTP ' + res.status)
  return { post: cuerpo.data, mensaje: cuerpo.message }
}

// POST /posts — crea en estado draft. Validaciones del backend: name (255),
// content (10.000), type (enum), channel_ids (mín. 1, autorizados → RN-P01),
// scheduled_at (futura → RN-P06), media_ids (pertenecen a los canales → RN-P02).
export function crear(token, datos) {
  return enviarFormulario(token, 'POST', `${BASE_URL}/posts`, datos)
}

// PUT /posts/{id} — solo el propietario (403 si no) y solo en draft (422
// RN-P03). Acepta el formulario completo: los campos son opcionales
// (sometimes) para el backend, y channel_ids/media_ids se sincronizan.
export function editar(token, id, datos) {
  return enviarFormulario(token, 'PUT', `${BASE_URL}/posts/${id}`, datos)
}
