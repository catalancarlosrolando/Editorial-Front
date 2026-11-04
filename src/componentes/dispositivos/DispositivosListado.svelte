<script>
  import DispositivoFila from './DispositivoFila.svelte'

  // Tabla paginada de dispositivos (10 por página, fijo en el backend).
  let { items, eliminandoId, onQuitar } = $props()
</script>

<div class="envoltura-tabla">
  <table class="tabla">
    <thead>
      <tr>
        <th>UID</th>
        <th>Estado</th>
        <th>Última conexión</th>
        <th>Creado</th>
        <th>Acciones</th>
      </tr>
    </thead>
    <tbody>
      {#each items as dispositivo (dispositivo.id)}
        <DispositivoFila {dispositivo} {eliminandoId} {onQuitar} />
      {/each}
    </tbody>
  </table>
</div>
