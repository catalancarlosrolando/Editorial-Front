// Estado compartido de sesión (apunte §6.2: objeto $state exportado desde un
// .svelte.js, sin stores). Todo componente que lo importe ve los mismos datos.
export const sesion = $state({
  usuario: null,
  token: ''
})

const CLAVE_TOKEN = 'token'
const CLAVE_USUARIO = 'usuario'

// Al abrir la app, levantamos lo que quedó guardado de una sesión anterior.
// Validar que el token SIGA vivo se hace en App.svelte con GET /api/user.
function restaurar() {
  sesion.token = localStorage.getItem(CLAVE_TOKEN) ?? ''
  const usuarioGuardado = localStorage.getItem(CLAVE_USUARIO)
  if (usuarioGuardado) {
    try {
      sesion.usuario = JSON.parse(usuarioGuardado)
    } catch {
      // Si estaba corrupto, mejor arrancar sin sesión que romper la app.
      sesion.usuario = null
    }
  }
}
restaurar()

// Guarda token y usuario en el estado compartido Y en localStorage.
export function iniciarSesion(datos) {
  sesion.usuario = datos.user
  sesion.token = datos.token
  localStorage.setItem(CLAVE_TOKEN, datos.token)
  localStorage.setItem(CLAVE_USUARIO, JSON.stringify(datos.user))
}

// ¿El usuario logueado tiene este permiso? (p. ej. 'editar-contenido').
// Los permisos llegan del backend dentro de usuario.permissions en el login.
// Sin sesión (o sin lista de permisos) responde false: así la UI puede
// ocultar enlaces y las páginas bloquearse ANTES de intentar un fetch que
// igual terminaría en 403.
export function tienePermiso(nombre) {
  return sesion.usuario?.permissions?.includes(nombre) ?? false
}

// ¿El usuario logueado tiene ALGUNO de estos roles? (p. ej. 'moderador',
// 'admin'). Los roles llegan del backend dentro de usuario.roles en el login.
// La moderación (etapa F) NO se controla con un permiso sino con el rol: el
// backend chequea hasRole(['moderador', 'admin']) dentro de cada método, así
// que la UI replica esa misma condición.
export function tieneRol(...nombres) {
  return sesion.usuario?.roles?.some((rol) => nombres.includes(rol)) ?? false
}

// Limpia la sesión en memoria y en localStorage. Se usa al cerrar sesión
// y también ante cualquier 401 (los hooks llaman a esta misma función).
export function cerrarSesion() {
  sesion.usuario = null
  sesion.token = ''
  localStorage.removeItem(CLAVE_TOKEN)
  localStorage.removeItem(CLAVE_USUARIO)
}
