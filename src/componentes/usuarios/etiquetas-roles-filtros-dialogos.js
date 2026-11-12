// Etiquedas de accion y clases para cambios de estado
export const ETIQUETAS_ACCION = {
    status_change: { label: "Cambio de estado", color: "#2563eb" },
    role_assigned: { label: "Rol asignado", color: "#16a34a" },
    role_revoked: { label: "Rol revocado", color: "#ea580c" },
    enabled: { label: "Cuenta habilitada", color: "#16a34a" },
    disabled: { label: "Cuenta deshabilitada", color: "#dc2626" },
};

// No hay endpoint de catálogo de roles: los valores vienen de la spec de
// assign-role (invitado / publicador / moderador / admin).
export const ROLES = [
    { value: "invitado", label: "Invitado" },
    { value: "publicador", label: "Publicador" },
    { value: "moderador", label: "Moderador" },
    { value: "admin", label: "Admin" },
];

// Valores de los enums según la spec del backend. No hay endpoint de
// catálogo para estos (a diferencia de los tipos de canal/medio), así que
// son los únicos valores fijos del proyecto. El listado excluye admins

export const ESTADOS = [
    { value: 'registered', label: 'Registrado' },
    { value: 'verified', label: 'Verificado' },
    { value: 'approved', label: 'Aprobado' },
    { value: 'disabled', label: 'Deshabilitado' },
    { value: 'deleted', label: 'Eliminado' }
]
export const ORDENES = [
    { value: 'created_at', label: 'Fecha de registro' },
    { value: 'name', label: 'Nombre' },
    { value: 'email', label: 'Email' },
    { value: 'last_access_at', label: 'Último acceso' }
]
export const SENTIDOS = [
    { value: 'asc', label: 'Ascendente' },
    { value: 'desc', label: 'Descendente' }
]

export const DIALOGOS = {
    approve: {
        titulo: 'Aprobar usuario',
        texto: 'Aprobar',
        aviso: 'El usuario quedará aprobado para entrar al sistema.',
        peligroso: false,
        obligatorio: false
    },
    reject: {
        titulo: 'Rechazar solicitud',
        texto: 'Rechazar',
        aviso: 'La cuenta quedará eliminada y no podrá recuperarse.',
        peligroso: true,
        obligatorio: true
    },
    enable: {
        titulo: 'Habilitar usuario',
        texto: 'Habilitar',
        aviso: 'La cuenta volverá al estado aprobado.',
        peligroso: false,
        obligatorio: false
    },
    disable: {
        titulo: 'Deshabilitar usuario',
        texto: 'Deshabilitar',
        aviso: 'Se invalidarán todos los tokens del usuario y no podrá entrar hasta habilitarlo.',
        peligroso: true,
        obligatorio: true
    }
}