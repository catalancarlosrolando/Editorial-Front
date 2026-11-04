<script>
  import CanalFila from './CanalFila.svelte'

  // Tabla de canales: recorre con {#each} y clave (canal.id), jamás el índice.
  // La clase global "tabla" la muestra como tabla en desktop y como tarjetas
  // apiladas en mobile (cada fila aporta sus celda-etiqueta).
  let { items, eliminandoId, onEditar, onQuitar } = $props()
</script>

<div class="envoltura-tabla">
  <table class="tabla">
    <thead>
      <tr>
        <th>ID</th>
        <th>Nombre</th>
        <th>Tipo</th>
        <th>Descripción</th>
        <th>Acciones</th>
      </tr>
    </thead>
    <tbody>
      {#each items as canal (canal.id)}
        <CanalFila {canal} {eliminandoId} {onEditar} {onQuitar} />
      {/each}
    </tbody>
  </table>
</div>
