<script>
  import MenuAcciones from '../comunes/MenuAcciones.svelte'

  // Una fila de la tabla de canales. Solo presentación: avisa al padre con
  // callbacks (onEditar recibe el canal, onQuitar su id). Las acciones viven
  // en el menú de desbordamiento, como los dropdowns del design system.
  let { canal, eliminandoId = null, onEditar, onQuitar } = $props()
</script>

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
  <td>
    <span class="celda-etiqueta">Acciones</span>
    <MenuAcciones
      etiqueta={`Acciones de ${canal.name}`}
      deshabilitado={eliminandoId === canal.id}
      items={[
        { etiqueta: 'Editar', icono: 'editar', alElegir: () => onEditar(canal) },
        { etiqueta: 'Eliminar', icono: 'eliminar', peligroso: true, alElegir: () => onQuitar(canal.id) }
      ]}
    />
  </td>
</tr>

<style>
  /* En desktop la tabla no corta palabras: la descripción es la excepción,
     con tope de ancho para no estirar el resto de las columnas. */
  .descripcion {
    max-width: 26rem;
    white-space: normal;
    color: var(--color-texto-medio);
  }
</style>
