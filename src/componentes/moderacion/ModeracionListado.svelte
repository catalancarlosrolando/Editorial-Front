<script>
  import ModeracionFila from './ModeracionFila.svelte'
  import DialogoPublicacion from '../publicaciones/DialogoPublicacion.svelte'

  // Tabla de la cola de moderación (etapa F): las publicaciones en
  // pending_review, ordenadas FIFO por el backend. Igual que en
  // PublicacionesListado, la tabla no decide nada: el menú de acciones
  // (Aprobar/Rechazar) lo arma la página y llega por la prop `acciones`,
  // y el detalle se muestra en UN DialogoPublicacion renderizado acá,
  // FUERA de la tabla (nunca uno por fila).
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
        <th>Autor</th>
        <th>Canales</th>
        <th>Fechas</th>
        <th>Acciones</th>
      </tr>
    </thead>
    <tbody>
      {#each items as post (post.id)}
        <ModeracionFila {post} {onVerDetalle} acciones={acciones(post)} {ocupado} />
      {/each}
    </tbody>
  </table>
</div>

<!-- El mismo diálogo de detalle que Publicaciones: mientras el hook tenga
     `detalle`, se muestra; onCerrar/onReintentar delegan en el hook. -->
<DialogoPublicacion
  detalle={detalle}
  cargandoDetalle={cargandoDetalle}
  errorDetalle={errorDetalle}
  onCerrar={onCerrarDetalle}
  onReintentar={onReintentarDetalle}
/>
