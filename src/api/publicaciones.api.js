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
// Con adjuntos el body viaja como multipart/form-data: fetch SIN header
// Content-Type (el navegador pone el boundary). Verificado contra el backend
// real: PHP no interpreta multipart en PUT, así que editar con adjuntos se
// hace con method spoofing (POST + campo _method=PUT, el patrón estándar de
// Laravel); sin adjuntos queda el PUT JSON de la etapa E.
function armarFormData(datos, adjuntos) {
  const fd = new FormData()
  for (const [clave, valor] of Object.entries(datos)) {
    if (Array.isArray(valor)) {
      if (valor.length === 0) {
        // Un array vacío viaja como cadena vacía: Laravel la convierte en
        // null (ConvertEmptyStringsToNull) y sincroniza a lista vacía.
        fd.append(clave, '')
      } else {
        for (const item of valor) fd.append(clave + '[]', item)
      }
    } else if (valor === null) {
      // null no se puede mandar en FormData: cadena vacía = limpiar el campo.
      fd.append(clave, '')
    } else {
      fd.append(clave, valor)
    }
  }
  // RN-P05: los archivos se llaman attachments[] para que lleguen como array.
  for (const archivo of adjuntos) fd.append('attachments[]', archivo)
  return fd
}

async function enviarFormulario(token, metodo, url, datos, adjuntos = []) {
  const conAdjuntos = adjuntos.length > 0
  // Con FormData el fetch NO lleva Content-Type (el navegador fija el
  // boundary); con JSON sí es obligatorio para que Laravel lo parsee.
  const headers = {
    'Accept': 'application/json',
    'Authorization': 'Bearer ' + token
  }
  if (!conAdjuntos) headers['Content-Type'] = 'application/json'
  const res = await fetch(url, {
    method: conAdjuntos && metodo === 'PUT' ? 'POST' : metodo,
    headers,
    body: conAdjuntos ? armarFormData({ ...datos, ...(metodo === 'PUT' ? { _method: 'PUT' } : {}) }, adjuntos) : JSON.stringify(datos)
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
// scheduled_at (futura → RN-P06), media_ids (pertenecen a los canales →
// RN-P02), attachments (máx. 10 × 10 MB, mimes de la spec → RN-P05).
export function crear(token, datos, adjuntos = []) {
  return enviarFormulario(token, 'POST', `${BASE_URL}/posts`, datos, adjuntos)
}

// PUT /posts/{id} — solo el propietario (403 si no) y solo en draft (422
// RN-P03). Acepta el formulario completo: los campos son opcionales
// (sometimes) para el backend, y channel_ids/media_ids se sincronizan.
// RN-P04: los adjuntos que llegan SE AGREGAN, los existentes no se tocan.
export function editar(token, id, datos, adjuntos = []) {
  return enviarFormulario(token, 'PUT', `${BASE_URL}/posts/${id}`, datos, adjuntos)
}

// POST /posts/{id}/{accion} — transiciones del ciclo de vida (RN-P07):
// submit (draft→pending_review), revert-to-draft, archive (exige
// {confirm:true}, RN-P10) y unarchive (solo mod/admin, RN-P12). El backend
// contesta SIEMPRE el post actualizado con su message; ante 403/422 manda
// {status:error, message} sin objeto errors (igual que las reglas de negocio
// del formulario).
export async function transicion(token, id, accion, cuerpo = {}) {
  const res = await fetch(`${BASE_URL}/posts/${id}/${accion}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify(cuerpo)
  })
  if (res.status === 401) throw new Error('SESION_INVALIDA')
  const respuesta = await res.json().catch(() => ({}))
  if (res.status === 403 || res.status === 422) {
    if (respuesta.errors) return { errores: Object.values(respuesta.errors).flat() }
    return { error: respuesta.message ?? 'No se pudo aplicar la transición.' }
  }
  if (!res.ok) throw new Error('HTTP ' + res.status)
  return { post: respuesta.data, mensaje: respuesta.message }
}

// DELETE /posts/{id} — baja lógica con motivo OBLIGATORIO (RN-P08, máx. 500).
// Solo estados sin publicar (RN-P09): draft, pending_review,
// approved_by_moderator, scheduled. El 422 por motivo vacío SÍ trae
// errors.reason (DeletePostRequest); el 422 de estado es solo message.
export async function eliminar(token, id, motivo) {
  const res = await fetch(`${BASE_URL}/posts/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify({ reason: motivo })
  })
  if (res.status === 401) throw new Error('SESION_INVALIDA')
  const respuesta = await res.json().catch(() => ({}))
  if (res.status === 403 || res.status === 422) {
    if (respuesta.errors) return { errores: Object.values(respuesta.errors).flat() }
    return { error: respuesta.message ?? 'No se pudo eliminar la publicación.' }
  }
  if (!res.ok) throw new Error('HTTP ' + res.status)
  return { mensaje: respuesta.message }
}
