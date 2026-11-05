<script>
  import MedioFila from './MedioFila.svelte'

  // Tabla de medios (solo lectura). Recibe `tipos` para mostrar el nombre
  // lindo de cada tipo en lugar del valor del enum.
  let { items, tipos = [] } = $props()
</script>

<div class="envoltura-tabla">
  <table class="tabla">
    <thead>
      <tr>
        <th>ID</th>
        <th>Nombre</th>
        <th>Tipo</th>
        <th>Estado</th>
        <th>Webhook</th>
      </tr>
    </thead>
    <tbody>
      {#each items as medio (medio.id)}
        <MedioFila {medio} {tipos} />
      {/each}
    </tbody>
  </table>
</div>
