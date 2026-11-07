<script>
  import PublicacionFila from './PublicacionFila.svelte'

  // Tabla de publicaciones (etapas D y E). La tabla no decide nada: el
  // detalle expandido y su carga viven en el hook; cada fila solo avisa
  // onAlternar y onEditar. La decisión de QUIÉN puede editar una fila la
  // toma la página (esEditable): dueño + estado draft (RN-P03).
  // 'detalle' es el estado del hook ({ resumen, datos } | null): lo pasa
  // entero para que cada fila sepa si es ELLA la que está abierta.
  let { items, detalle, cargandoDetalle, errorDetalle, onAlternar, onEditar, esEditable } = $props()
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
        <th>Acciones</th>
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
          {onEditar}
          {esEditable}
        />
      {/each}
    </tbody>
  </table>
</div>
