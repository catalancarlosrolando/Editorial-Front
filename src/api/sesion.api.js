// Capa de acceso a la API para la sesión: login, usuario actual y logout.
// Esta capa no sabe nada de la UI: solo fetch, el envelope del backend y
// la convención de errores (401 → SESION_INVALIDA, 422 → errores por campo).
import { BASE_URL } from '../config.js'

// Devuelve { user, token } si las credenciales son válidas,
// o { errores, mensaje } si no (el backend responde 422, igual que una validación).
export async function login(email, password, remember) {
  const res = await fetch(`${BASE_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({ email, password, remember })
  })
  if (res.status === 401) throw new Error('SESION_INVALIDA')
  const cuerpo = await res.json()
  if (res.status === 422) {
    return { errores: cuerpo.errors, mensaje: cuerpo.message }
  }
  if (!res.ok) throw new Error('HTTP ' + res.status)
  return cuerpo.data // { user, token }
}

// Devuelve el usuario si el token sigue vivo. Es la manera correcta de
// validar al abrir la app un token guardado en localStorage.
export async function usuarioActual(token) {
  const res = await fetch(`${BASE_URL}/user`, {
    headers: {
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + token
    }
  })
  if (res.status === 401) throw new Error('SESION_INVALIDA')
  if (!res.ok) throw new Error('HTTP ' + res.status)
  const cuerpo = await res.json()
  return cuerpo.data.user
}

// Invalida SOLO el token actual en el backend (los tokens no se renuevan).
export async function logout(token) {
  const res = await fetch(`${BASE_URL}/logout`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + token
    }
  })
  if (res.status === 401) throw new Error('SESION_INVALIDA')
  if (!res.ok) throw new Error('HTTP ' + res.status)
}

// Registra un nuevo usuario:
// Endpoint: POST /api/register
// Headers: Content-Type: application/json, Accept: application/json
// Devuelve { user, token, mensaje } si responde 201/200,
// o { errores, mensaje } si responde 422 (errores de validación).
export async function register(datos) {
  const res = await fetch(`${BASE_URL}/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      first_name: datos.first_name,
      last_name: datos.last_name,
      name: datos.name,
      email: datos.email,
      password: datos.password,
      password_confirmation: datos.password_confirmation
    })
  })

  if (res.status === 401) throw new Error('SESION_INVALIDA')
  const cuerpo = await res.json().catch(() => ({}))

  if (res.status === 422) {
    return { errores: cuerpo.errors ?? {}, mensaje: cuerpo.message }
  }

  if (!res.ok) throw new Error(cuerpo.message ?? 'HTTP ' + res.status)

  const info = cuerpo.data ?? cuerpo
  return {
    user: info.user ?? cuerpo.user,
    token: info.token ?? cuerpo.token,
    mensaje: cuerpo.message ?? 'Usuario registrado con éxito'
  }
}

// Reenvía el email de verificación:
// Endpoint: POST /api/email/resend
// Headers: Authorization: Bearer <token>, Accept: application/json
export async function reenviarEmailVerificacion(token) {
  const res = await fetch(`${BASE_URL}/email/resend`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + token
    }
  })

  if (res.status === 401) throw new Error('SESION_INVALIDA')
  const cuerpo = await res.json().catch(() => ({}))

  if (res.status === 422) {
    return { errores: cuerpo.errors ?? {}, mensaje: cuerpo.message }
  }

  if (!res.ok) throw new Error(cuerpo.message ?? 'HTTP ' + res.status)

  return { mensaje: cuerpo.message ?? 'Correo de verificación reenviado.' }
}

export { register as registrar, reenviarEmailVerificacion as resendVerificationEmail }

