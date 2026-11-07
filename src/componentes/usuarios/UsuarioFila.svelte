<script>
  import MenuAcciones from '../comunes/MenuAcciones.svelte'
  import EstadoBadge from '../comunes/EstadoBadge.svelte'

  // Una fila del listado de usuarios. El menú depende del estado actual
  // (RN-U02, ciclo de vida unidireccional):
  //   registered/verified → Aprobar + Rechazar
  //   approved            → Deshabilitar
  //   disabled            → Habilitar
  //   deleted             → sin acciones de ciclo de vida
  // Ver historial y Gestionar roles están disponibles para cualquier estado.
  let { usuario, operando = false, onVerHistorial, onGestionarRoles, onCambiarEstado } = $props()

  // Las fechas llegan en ISO; las mostramos en formato local.
  function formatoFecha(valor) {
    if (!valor) return '—'
    return new Date(valor).toLocaleString()
  }
</script>

<tr>
  <td>
    <span class="celda-etiqueta">Usuario</span>
    <span class="nombre">{usuario.name}</span>
    <span class="email">{usuario.email}</span>
  </td>
  <td>
    <span class="celda-etiqueta">DNI</span>
    <span class="mono">{usuario.dni ?? '—'}</span>
  </td>
  <td>
    <span class="celda-etiqueta">Roles</span>
    {#if usuario.roles?.length}
      {#each usuario.roles as rol (rol)}
        <span class="badge neutra rol">{rol}</span>
      {/each}
    {:else}
      <span class="sin-roles">—</span>
    {/if}
  </td>
  <td>
    <span class="celda-etiqueta">Estado</span>
    <EstadoBadge estado={usuario.status} etiqueta={usuario.status_label} />
  </td>
  <td>
    <span class="celda-etiqueta">Último acceso</span>
    {formatoFecha(usuario.last_access_at)}
  </td>
  <td>
    <span class="celda-etiqueta">Acciones</span>
    <MenuAcciones
      etiqueta="Acciones del usuario"
      deshabilitado={operando}
      items={[
        ...(usuario.status === 'registered' || usuario.status === 'verified'
          ? [
              {
                etiqueta: 'Aprobar',
                icono: 'check',
                alElegir: () => onCambiarEstado('approve', usuario)
              },
              {
                etiqueta: 'Rechazar',
                icono: 'cruzar',
                peligroso: true,
                alElegir: () => onCambiarEstado('reject', usuario)
              }
            ]
          : []),
        ...(usuario.status === 'approved'
          ? [
              {
                etiqueta: 'Deshabilitar',
                icono: 'bloquear',
                peligroso: true,
                alElegir: () => onCambiarEstado('disable', usuario)
              }
            ]
          : []),
        ...(usuario.status === 'disabled'
          ? [
              {
                etiqueta: 'Habilitar',
                icono: 'desbloquear',
                alElegir: () => onCambiarEstado('enable', usuario)
              }
            ]
          : []),
        { etiqueta: 'Ver historial', icono: 'historial', alElegir: () => onVerHistorial(usuario) },
        { etiqueta: 'Gestionar roles', icono: 'editar', alElegir: () => onGestionarRoles(usuario) }
      ]}
    />
  </td>
</tr>

<style>
  .nombre {
    display: block;
    font-weight: 600;
  }

  .email {
    display: block;
    color: var(--color-texto-suave);
    font-size: 0.8125rem;
  }

  .rol {
    margin-right: 4px;
  }

  .sin-roles {
    color: var(--color-texto-suave);
  }
</style>
