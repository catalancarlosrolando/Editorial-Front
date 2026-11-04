// Capa de acceso a la API para dispositivos.
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
