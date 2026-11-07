// Capa de acceso a la API para la administración de usuarios (etapa C):
// listado filtrable y paginado, ciclo de vida del estado (approve/reject/
// enable/disable), roles e historial. Esta capa no sabe nada de la UI: solo
// fetch, el envelope del backend y la convención de errores
// (401 → SESION_INVALIDA, 422/403 → lo que el backend pueda explicar).
import { BASE_URL } from '../config.js'

// GET /admin/users — listado PAGINADO (20 por página) con filtros
// recombinables. Los filtros llegan como objeto plano ({ role, status, name,
// email, dni, registered_from, registered_to, last_access_from,
// last_access_to, sort_by, sort_order }) y se convierten a query string con
// URLSearchParams: solo se envían los que tienen valor, así el resto usa los
// defaults del backend (sort_by created_at, sort_order desc).
export async function listar(token, pagina = 1, filtros = {}) {
  const params = new URLSearchParams()
  params.set('page', pagina)
  for (const [clave, valor] of Object.entries(filtros)) {
    if (valor) params.set(clave, valor)
  }
  const res = await fetch(`${BASE_URL}/admin/users?${params.toString()}`, {
    headers: {
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + token
    }
  })
  if (res.status === 401) throw new Error('SESION_INVALIDA')
  if (!res.ok) throw new Error('HTTP ' + res.status)
  const cuerpo = await res.json()
  // La spec define data = { users: [...], pagination: { current_page,
  // last_page, per_page, total } } — ojo, NO es el paginado estándar de
  // Laravel. El normalizador acepta además data.data por si la forma real
  // difiere (lección de la etapa A: confirmar en la pestaña Network).
  const datos = cuerpo.data
  const paginacion = datos.pagination ?? datos
  return {
    usuarios: Array.isArray(datos.users)
      ? datos.users
      : Array.isArray(datos.data)
        ? datos.data
        : [],
    paginaActual: paginacion.current_page ?? 1,
    ultimaPagina: paginacion.last_page ?? 1,
    total: paginacion.total ?? 0
  }
}

// Acciones de ciclo de vida (RN-U02): approve / reject / enable / disable.
// Las cuatro comparten forma: POST a /admin/users/{user}/{accion} con body
// { reason } OPCIONAL. Devuelven:
//   { mensaje }         → salió bien (cuerpo.message del backend)
//   { errores: [...] }  → 422 (transición inválida) o 403 de auto-protección
//                         (RN-U03: no deshabilitarse a sí mismo). En ambos
//                         casos el backend manda un mensaje legible, que el
//                         hook muestra DENTRO del diálogo Confirmar.
export async function cambiarEstado(token, id, accion, motivo = '') {
  const ACCIONES = ['approve', 'reject', 'enable', 'disable']
  if (!ACCIONES.includes(accion)) throw new Error('Acción desconocida: ' + accion)

  // El motivo solo viaja si el usuario escribió algo: enviar "" no aporta.
  const cuerpoPeticion = motivo ? { reason: motivo } : {}
  const res = await fetch(`${BASE_URL}/admin/users/${id}/${accion}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify(cuerpoPeticion)
  })
  if (res.status === 401) throw new Error('SESION_INVALIDA')
  const cuerpo = await res.json()
  if (res.status === 422 || res.status === 403) {
    // 422 trae errors por campo; 403 trae solo message. Se aplana todo a una
    // lista de mensajes lista para mostrar.
    const errores = cuerpo.errors ? Object.values(cuerpo.errors).flat() : [cuerpo.message]
    return { errores }
  }
  if (!res.ok) throw new Error('HTTP ' + res.status)
  return { mensaje: cuerpo.message }
}

// Roles (asign-role / revoke-role), ambas POST con body { role }. Acá el 403
// es la auto-protección RN-U04 (quitarse el propio rol admin) y se devuelve
// como { error } con el message del backend; el 422 sigue la convención de
// siempre ({ errores } por campo, en este caso el campo "role").
async function cambiarRol(camino, token, id, rol) {
  const res = await fetch(`${BASE_URL}/admin/users/${id}/${camino}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify({ role: rol })
  })
  if (res.status === 401) throw new Error('SESION_INVALIDA')
  const cuerpo = await res.json()
  if (res.status === 403) return { error: cuerpo.message }
  if (res.status === 422) return { errores: cuerpo.errors }
  if (!res.ok) throw new Error('HTTP ' + res.status)
  return { mensaje: cuerpo.message }
}

export function asignarRol(token, id, rol) {
  return cambiarRol('assign-role', token, id, rol)
}

export function revocarRol(token, id, rol) {
  return cambiarRol('revoke-role', token, id, rol)
}

// GET /admin/users/{user}/history — data = { user_id, user_name, history }.
// Devuelve solo la lista de entradas ya normalizada (o [] si no vino).
export async function historial(token, id) {
  const res = await fetch(`${BASE_URL}/admin/users/${id}/history`, {
    headers: {
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + token
    }
  })
  if (res.status === 401) throw new Error('SESION_INVALIDA')
  if (!res.ok) throw new Error('HTTP ' + res.status)
  const cuerpo = await res.json()
  const lista = cuerpo.data?.history
  return Array.isArray(lista) ? lista : []
}
