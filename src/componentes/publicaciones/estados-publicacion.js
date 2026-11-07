// Valores fijos del dominio de publicaciones según la spec del backend
// (05-api-endpoints.md). No hay endpoint de catálogo para estos enums
// (igual que los roles/estados de usuario en la etapa C), así que son los
// únicos valores fijos del proyecto.

// Estados del ciclo de vida de un post. 'archived' está acá a propósito:
// el listado lo excluye POR DEFECTO, y solo se ve si este filtro viaja
// explícitamente en la query — por eso la opción existe en el select.
export const ESTADOS_POST = [
  { value: 'draft', label: 'Borrador' },
  { value: 'pending_review', label: 'Pendiente de revisión' },
  { value: 'approved_by_moderator', label: 'Aprobada por moderación' },
  { value: 'published', label: 'Publicada' },
  { value: 'scheduled', label: 'Programada' },
  { value: 'archived', label: 'Archivada' }
]

export const TIPOS_POST = [
  { value: 'text', label: 'Texto' },
  { value: 'video', label: 'Video' },
  { value: 'audio', label: 'Audio' },
  { value: 'image', label: 'Imagen' },
  { value: 'multimedia', label: 'Multimedia' }
]

// Tamaños de página que acepta GET /posts (spec 07: 20/50/100).
export const TAMANIOS_PAGINA = [
  { value: '20', label: '20 por página' },
  { value: '50', label: '50 por página' },
  { value: '100', label: '100 por página' }
]

export const CAMPOS_ORDEN = [
  { value: 'created_at', label: 'Fecha de creación' },
  { value: 'updated_at', label: 'Última modificación' },
  { value: 'scheduled_at', label: 'Fecha programada' },
  { value: 'name', label: 'Título' },
  { value: 'status', label: 'Estado' }
]

export const SENTIDOS = [
  { value: 'asc', label: 'Ascendente' },
  { value: 'desc', label: 'Descendente' }
]

// Etiqueta legible de un estado, para el badge de la tabla (los posts no
// traen status_label del backend como los usuarios).
export function etiquetaEstado(estado) {
  const opcion = ESTADOS_POST.find((e) => e.value === estado)
  return opcion ? opcion.label : (estado ?? '')
}

export function etiquetaTipo(tipo) {
  const opcion = TIPOS_POST.find((t) => t.value === tipo)
  return opcion ? opcion.label : (tipo ?? '')
}
