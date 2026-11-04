<script>
  // Tabla de canales: recorre con {#each} y clave (canal.id), jamás el índice.
  // La clase global "tabla" la muestra como tabla en desktop y como tarjetas
  // apiladas en mobile (cada fila aporta sus celda-etiqueta).
  let { items } = $props()
</script>

<div class="envoltura-tabla">
  <table class="tabla">
    <thead>
      <tr>
        <th>ID</th>
        <th>Nombre</th>
        <th>Tipo</th>
        <th>Descripción</th>
      </tr>
    </thead>
    <tbody>
      {#each items as canal (canal.id)}
        <tr>
          <td>
            <span class="celda-etiqueta">ID</span>
            <span class="mono">{canal.id}</span>
          </td>
          <td>
            <span class="celda-etiqueta">Nombre</span>
            {canal.name}
          </td>
          <td>
            <span class="celda-etiqueta">Tipo</span>
            <span class="badge neutra">{canal.type}</span>
          </td>
          <td class="descripcion">
            <span class="celda-etiqueta">Descripción</span>
            {canal.description ?? '—'}
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<style>
  /* En desktop la tabla no corta palabras: la descripción es la excepción,
     con tope de ancho para no estirar el resto de las columnas. */
  .descripcion {
    max-width: 26rem;
    white-space: normal;
    color: var(--color-texto-medio);
  }
</style>
