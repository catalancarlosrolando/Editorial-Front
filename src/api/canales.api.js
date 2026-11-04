// Capa de acceso a la API para canales (CRUD completo + tipos del <select>).
// Esta capa no sabe nada de la UI: solo fetch, el envelope del backend y
// la convención de errores (401 → SESION_INVALIDA, 422 → errores por campo).
import { BASE_URL } from '../config.js'

// Listar: SIN paginación, cuerpo.data ES directamente el array de canales.
export async function listar(token) {
  const res = await fetch(`${BASE_URL}/admin/channels`, {
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

// Tipos de canal (RN-C02): llenan el <select> del formulario; nunca hardcodearlos.
export async function tipos(token) {
  const res = await fetch(`${BASE_URL}/admin/channels/types`, {
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

// Crear (201). En 422 devuelve { errores } para que el formulario los muestre
// por campo; si sale bien devuelve { canal }.
export async function crear(token, datos) {
  const res = await fetch(`${BASE_URL}/admin/channels`, {
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
  return { canal: cuerpo.data }
}

// Editar (PUT con campos opcionales: el formulario solo envía los que cambiaron).
export async function actualizar(token, id, datos) {
  const res = await fetch(`${BASE_URL}/admin/channels/${id}`, {
    method: 'PUT',
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
  return { canal: cuerpo.data }
}

// Eliminar: responde 200 con data null; el listado se actualiza en el hook.
export async function eliminar(token, id) {
  const res = await fetch(`${BASE_URL}/admin/channels/${id}`, {
    method: 'DELETE',
    headers: {
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + token
    }
  })
  if (res.status === 401) throw new Error('SESION_INVALIDA')
  if (!res.ok) throw new Error('HTTP ' + res.status)
}
