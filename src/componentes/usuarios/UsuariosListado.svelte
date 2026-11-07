<script>
  import UsuarioFila from './UsuarioFila.svelte'

  // Tabla paginada de usuarios (20 por página, fijo en el backend). La tabla
  // no decide nada: los menús por fila suben a la página con callbacks.
  let { items, operando, onVerHistorial, onGestionarRoles, onCambiarEstado } = $props()
</script>

<div class="envoltura-tabla">
  <table class="tabla">
    <thead>
      <tr>
        <th>Usuario</th>
        <th>DNI</th>
        <th>Roles</th>
        <th>Estado</th>
        <th>Último acceso</th>
        <th>Acciones</th>
      </tr>
    </thead>
    <tbody>
      {#each items as usuario (usuario.id)}
        <UsuarioFila {usuario} {operando} {onVerHistorial} {onGestionarRoles} {onCambiarEstado} />
      {/each}
    </tbody>
  </table>
</div>
