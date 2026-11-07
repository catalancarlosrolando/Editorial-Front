// Capa de acceso a la API de publicaciones (etapa D): listado con filtros
// complejos y detalle. Esta capa no sabe nada de la UI: solo fetch, el
// envelope del backend y la convención de errores (401 → SESION_INVALIDA).
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
