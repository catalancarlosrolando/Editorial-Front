<script>
  import PublicacionFila from './PublicacionFila.svelte'

  // Tabla de publicaciones (etapa D). La tabla no decide nada: el detalle
  // expandido y su carga viven en el hook; cada fila solo avisa onAlternar.
  // 'detalle' es el estado del hook ({ resumen, datos } | null): lo pasa
  // entero para que cada fila sepa si es ELLA la que está abierta.
  let { items, detalle, cargandoDetalle, errorDetalle, onAlternar } = $props()
</script>

<div class="envoltura-tabla">
  <table class="tabla">
    <thead>
      <tr>
        <th>Publicación</th>
        <th>Tipo</th>
        <th>Estado</th>
        <th>Canales</th>
        <th>Autor</th>
        <th>Fechas</th>
      </tr>
    </thead>
    <tbody>
      {#each items as post (post.id)}
        <PublicacionFila
          {post}
          {detalle}
          {cargandoDetalle}
          {errorDetalle}
          {onAlternar}
        />
      {/each}
    </tbody>
  </table>
</div>
