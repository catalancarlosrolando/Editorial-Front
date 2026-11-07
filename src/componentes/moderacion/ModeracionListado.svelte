<script>
  import ModeracionFila from './ModeracionFila.svelte'

  // Tabla de la cola de moderación (etapa F): las publicaciones en
  // pending_review, ordenadas FIFO por el backend. Igual que en
  // PublicacionesListado, la tabla no decide nada: el menú de acciones
  // (Aprobar/Rechazar) lo arma la página y llega por la prop `acciones`.
  let { items, acciones, ocupado = false } = $props()
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
        <ModeracionFila {post} acciones={acciones(post)} {ocupado} />
      {/each}
    </tbody>
  </table>
</div>
