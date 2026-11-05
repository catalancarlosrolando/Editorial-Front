// Capa de acceso a la API para dispositivos: crear, listar PAGINADO y eliminar.
// A diferencia de canales, NO existe edición (no hay PUT para este modelo).
// Esta capa no sabe nada de la UI: solo fetch, el envelope del backend y
// la convención de errores (401 → SESION_INVALIDA, 422 → errores por campo).
import { BASE_URL } from '../config.js'

// Listar paginado (10 por página, fijo). Devuelve el objeto de paginación de
// Laravel: { data: [...], current_page, last_page, per_page, total }.
// Ojo: la lista de ítems vive en cuerpo.data.data (envelope + paginación).
export async function listar(token, pagina = 1) {
  const res = await fetch(`${BASE_URL}/admin/devices?page=${pagina}`, {
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

// Crear (201). Solo envía { is_active }: el uid lo genera el backend (RN-D01).
export async function crear(token, datos) {
  const res = await fetch(`${BASE_URL}/admin/devices`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify(datos)
  })
  if (res.status === 401) throw new Error('SESION_INVALIDA')
  const cuerpo = await res.json()
  if (res.status === 422) return { errores: cuerpo.errors }
  if (!res.ok) throw new Error('HTTP ' + res.status)
  return { dispositivo: cuerpo.data }
}

// Eliminar. No hay PUT: este modelo no se edita.
export async function eliminar(token, id) {
  const res = await fetch(`${BASE_URL}/admin/devices/${id}`, {
    method: 'DELETE',
    headers: {
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + token
    }
  })
  if (res.status === 401) throw new Error('SESION_INVALIDA')
  if (!res.ok) throw new Error('HTTP ' + res.status)
}

// Trae TODAS las páginas juntas, recorriéndolas una a una (el backend pagina
// a 10 fijas y no ofrece un listado completo). Se usa para el <select> de
// /asignar-canales, donde el usuario tiene que poder elegir cualquier
// dispositivo, no solo los de la primera página. Reutiliza listar() de arriba.
export async function listarTodos(token) {
  const dispositivos = []
  let pagina = 1
  while (true) {
    const resultado = await listar(token, pagina)
    dispositivos.push(...resultado.data)
    if (resultado.current_page >= resultado.last_page) break
    pagina++
  }
  return dispositivos
}
