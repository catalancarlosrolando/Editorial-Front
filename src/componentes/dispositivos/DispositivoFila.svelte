<script>
  import MenuAcciones from '../comunes/MenuAcciones.svelte'

  // Una fila del listado de dispositivos. El uid lo mostró el backend al crear.
  // Este modelo no se edita: el único permiso es eliminar (va en el menú ⋮).
  let { dispositivo, eliminandoId = null, onQuitar } = $props()

  // Las fechas llegan en ISO; las mostramos en formato local.
  function formatoFecha(valor) {
    if (!valor) return '—'
    return new Date(valor).toLocaleString()
  }
</script>

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
  <td>
    <span class="celda-etiqueta">Acciones</span>
    <MenuAcciones
      etiqueta={`Acciones de ${dispositivo.uid}`}
      deshabilitado={eliminandoId === dispositivo.id}
      items={[
        { etiqueta: 'Eliminar', icono: 'eliminar', peligroso: true, alElegir: () => onQuitar(dispositivo.id) }
      ]}
    />
  </td>
</tr>
