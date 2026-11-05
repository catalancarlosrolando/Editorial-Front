<script>
  import MenuAcciones from '../comunes/MenuAcciones.svelte'

  // Una fila del listado de notificaciones. Si ya está leída, el menú solo
  // ofrece Eliminar (marcar como leída no tiene sentido dos veces).
  let { notificacion, operando = false, onMarcarLeida, onEliminar } = $props()

  // Las fechas llegan en ISO; las mostramos en formato local.
  function formatoFecha(valor) {
    if (!valor) return '—'
    return new Date(valor).toLocaleString()
  }
</script>

<tr>
  <td>
    <span class="celda-etiqueta">Título</span>
    <span class="titulo" class:sin-leer={!notificacion.leida}>{notificacion.titulo}</span>
  </td>
  <td>
    <span class="celda-etiqueta">Mensaje</span>
    <span class="mensaje">{notificacion.mensaje || '—'}</span>
  </td>
  <td>
    <span class="celda-etiqueta">Fecha</span>
    {formatoFecha(notificacion.fecha)}
  </td>
  <td>
    <span class="celda-etiqueta">Estado</span>
    <span class="badge" class:si={notificacion.leida} class:neutra={!notificacion.leida}>
      {notificacion.leida ? 'Leída' : 'Sin leer'}
    </span>
  </td>
  <td>
    <span class="celda-etiqueta">Acciones</span>
    <MenuAcciones
      etiqueta="Acciones de la notificación"
      deshabilitado={operando}
      items={[
        ...(notificacion.leida
          ? []
          : [{ etiqueta: 'Marcar como leída', icono: 'check', alElegir: onMarcarLeida }]),
        { etiqueta: 'Eliminar', icono: 'eliminar', peligroso: true, alElegir: onEliminar }
      ]}
    />
  </td>
</tr>

<style>
  .titulo.sin-leer {
    font-weight: 600;
  }

  /* Los mensajes pueden ser largos: recorte con elipsis en vez de ensanchar la tabla */
  .mensaje {
    display: inline-block;
    max-width: 24rem;
    overflow: hidden;
    text-overflow: ellipsis;
    vertical-align: bottom;
  }
</style>
