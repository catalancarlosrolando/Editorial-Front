<script>
  import PublicacionFila from './PublicacionFila.svelte'
  import DialogoPublicacion from './DialogoPublicacion.svelte'

  // Tabla de publicaciones (etapas D, E y F). La tabla no decide nada: el
  // detalle y su carga viven en el hook; cada fila solo avisa onVerDetalle.
  // El detalle se muestra en UN DialogoPublicacion renderizado acá, FUERA de
  // la tabla (nunca uno por fila). El menú de acciones de cada fila lo arma
  // la página (accionesDe(post)) con estado + dueño + rol: llega por la prop
  // `acciones` (etapa E: Editar; etapa F: ciclo de vida completo).
  let {
    items,
    detalle,
    cargandoDetalle,
    errorDetalle,
    onVerDetalle,
    onCerrarDetalle,
    onReintentarDetalle,
    acciones,
    ocupado = false
  } = $props()
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
        <PublicacionFila {post} {onVerDetalle} acciones={acciones(post)} {ocupado} />
      {/each}
    </tbody>
  </table>
</div>

<!-- El diálogo de detalle: uno solo para todas las filas. Mientras el hook
     tenga `detalle`, se muestra; onCerrar/onReintentar delegan en el hook. -->
<DialogoPublicacion
  detalle={detalle}
  cargandoDetalle={cargandoDetalle}
  errorDetalle={errorDetalle}
  onCerrar={onCerrarDetalle}
  onReintentar={onReintentarDetalle}
/>
