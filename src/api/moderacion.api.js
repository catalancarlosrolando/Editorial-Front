// Capa de acceso a la API de moderación (etapa F). El backend verifica el rol
// (moderador/admin) DENTRO de cada método (RN-P13), no por permiso: por eso
// el guard del frontend también lo hace con tieneRol() y no con tienePermiso().
// Igual que el resto de la capa api/: fetch + envelope + convención de
// errores, sin saber nada de la UI.
import { BASE_URL } from '../config.js'

// GET /moderation/posts — publicaciones en pending_review, paginado 20,
// ordenadas por created_at ASCENDENTE (FIFO: la más vieja primero, es la
// cola de revisión). Filas completas: traen user, channels, medias,
// attachments y content, así que la página no necesita un fetch de detalle.
export async function listar(token, pagina = 1) {
  const params = new URLSearchParams()
  params.set('page', pagina)
  const res = await fetch(`${BASE_URL}/moderation/posts?${params.toString()}`, {
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

// Helper privado compartido por las tres acciones: POST con body JSON.
//   { post, mensaje }  → salió bien
//   { errores }        → 422/403 con objeto errors (validación) aplanado
//   { error }          → 422/403 de negocio o estado: solo message
async function postear(token, url, cuerpo) {
  const res = await fetch(url, {
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
    return { error: respuesta.message ?? 'No se pudo completar la operación.' }
  }
  if (!res.ok) throw new Error('HTTP ' + res.status)
  return { post: respuesta.data, mensaje: respuesta.message }
}

// POST /moderation/posts/{id}/approve — aprueba la publicación. Si
// scheduled_at tiene valor queda scheduled; si no, published. `comments`
// es OPCIONAL (comentarios para el publicador).
export function aprobar(token, id, comments) {
  const cuerpo = comments ? { comments } : {}
  return postear(token, `${BASE_URL}/moderation/posts/${id}/approve`, cuerpo)
}

// POST /moderation/posts/{id}/reject — rechaza y vuelve a draft.
// moderator_comments es OBLIGATORIO (máx. 1000): sin él, 422 con errors.
export function rechazar(token, id, moderatorComments) {
  return postear(token, `${BASE_URL}/moderation/posts/${id}/reject`, {
    moderator_comments: moderatorComments
  })
}

// POST /moderation/posts/{id}/stop — detiene la difusión de una PUBLISHED
// y la vuelve a draft. Exige {confirm:true, reason} (RN-P11, máx. 500).
// Lo puede usar el propietario o un moderador/admin, así que la UI lo
// ofrece desde Publicaciones, no desde Moderación.
export function detener(token, id, reason) {
  return postear(token, `${BASE_URL}/moderation/posts/${id}/stop`, {
    confirm: true,
    reason
  })
}
