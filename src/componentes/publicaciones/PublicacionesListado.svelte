<script>
  import PublicacionFila from './PublicacionFila.svelte'

  // Tabla de publicaciones (etapas D, E y F). La tabla no decide nada: el
  // detalle expandido y su carga viven en el hook; cada fila solo avisa
  // onAlternar. El menú de acciones de cada fila lo arma la página
  // (accionesDe(post)) con estado + dueño + rol: llega por la prop
  // `acciones` (etapa E: Editar; etapa F: ciclo de vida completo).
  // 'detalle' es el estado del hook ({ resumen, datos } | null): lo pasa
  // entero para que cada fila sepa si es ELLA la que está abierta.
  let { items, detalle, cargandoDetalle, errorDetalle, onAlternar, acciones, ocupado = false } = $props()
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
          acciones={acciones(post)}
          {ocupado}
        />
      {/each}
    </tbody>
  </table>
</div>
