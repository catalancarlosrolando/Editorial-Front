<script>
  import NotificacionFila from './NotificacionFila.svelte'

  // Tabla de notificaciones. Las callbacks suben con el id de la fila.
  let { items, operandoId = null, onMarcarLeida, onEliminar } = $props()
</script>

<div class="envoltura-tabla">
  <table class="tabla">
    <thead>
      <tr>
        <th>Título</th>
        <th>Mensaje</th>
        <th>Fecha</th>
        <th>Estado</th>
        <th>Acciones</th>
      </tr>
    </thead>
    <tbody>
      {#each items as notificacion (notificacion.id)}
        <NotificacionFila
          notificacion={notificacion}
          operando={operandoId === notificacion.id}
          onMarcarLeida={() => onMarcarLeida(notificacion.id)}
          onEliminar={() => onEliminar(notificacion.id)}
        />
      {/each}
    </tbody>
  </table>
</div>
