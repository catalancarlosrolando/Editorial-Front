<script>
  // Una fila del listado de medios. Con $derived traducimos el valor del enum
  // ("social_media") al label que definió el backend ("Redes Sociales").
  let { medio, tipos = [] } = $props()

  const tipoLabel = $derived(tipos.find((t) => t.value === medio.type)?.label ?? medio.type)
</script>

<tr>
  <td>
    <span class="celda-etiqueta">ID</span>
    <span class="mono">{medio.id}</span>
  </td>
  <td>
    <span class="celda-etiqueta">Nombre</span>
    {medio.name}
  </td>
  <td>
    <span class="celda-etiqueta">Tipo</span>
    <span class="badge neutra">{tipoLabel}</span>
  </td>
  <td>
    <span class="celda-etiqueta">Estado</span>
    <span class="badge" class:si={medio.is_active} class:no={!medio.is_active}>
      {medio.is_active ? 'Activo' : 'Inactivo'}
    </span>
  </td>
  <td>
    <span class="celda-etiqueta">Webhook</span>
    {#if medio.url_webhook}
      <span class="mono webhook">{medio.url_webhook}</span>
    {:else}
      —
    {/if}
  </td>
</tr>

<style>
  /* Los webhooks pueden ser largos: en desktop se recortan con elipsis
     (la tabla no corta palabras) y en la tarjeta mobile fluyen normal. */
  .webhook {
    display: inline-block;
    max-width: 14rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    vertical-align: bottom;
  }

  @media (width < 40rem) {
    .webhook {
      max-width: none;
      white-space: normal;
    }
  }
</style>
