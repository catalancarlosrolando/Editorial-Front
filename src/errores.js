// Traduce errores técnicos a mensajes que un usuario entiende.
// La SESION_INVALIDA no pasa por acá: los hooks la tratan aparte (logout + login).
export function mensajeDeError(e) {
  const sinConexion =
    e.message === 'Failed to fetch' ||
    e.message === 'NetworkError when attempting to fetch resource.'
  if (sinConexion) {
    return 'No se pudo conectar con el backend. ¿Está corriendo en http://localhost:8080?'
  }
  if (e.message === 'HTTP 403') {
    return 'No tenés permisos para esta operación (se requiere rol admin).'
  }
  if (e.message === 'HTTP 404') {
    return 'El recurso no existe (404).'
  }
  if (e.message === 'HTTP 500' || e.message === 'HTTP 503') {
    return 'Error del servidor. Probá de nuevo en un momento.'
  }
  return e.message
}
