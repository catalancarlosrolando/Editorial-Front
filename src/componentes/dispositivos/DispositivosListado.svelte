<script>
  // Tabla paginada de dispositivos (10 por página, fijo en el backend).
  let { items } = $props()

  // Las fechas llegan en ISO; las mostramos en formato local.
  function formatoFecha(valor) {
    if (!valor) return '—'
    return new Date(valor).toLocaleString()
  }
</script>

<div class="envoltura-tabla">
  <table class="tabla">
    <thead>
      <tr>
        <th>UID</th>
        <th>Estado</th>
        <th>Última conexión</th>
        <th>Creado</th>
      </tr>
    </thead>
    <tbody>
      {#each items as dispositivo (dispositivo.id)}
        <tr>
          <td>
            <span class="celda-etiqueta">UID</span>
            <span class="mono">{dispositivo.uid}</span>
          </td>
          <td>
            <span class="celda-etiqueta">Estado</span>
            <span class="badge" class:si={dispositivo.is_active} class:no={!dispositivo.is_active}>
              {dispositivo.is_active ? 'Activo' : 'Inactivo'}
            </span>
          </td>
          <td>
            <span class="celda-etiqueta">Última conexión</span>
            {formatoFecha(dispositivo.last_seen_at)}
          </td>
          <td>
            <span class="celda-etiqueta">Creado</span>
            {formatoFecha(dispositivo.created_at)}
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>
