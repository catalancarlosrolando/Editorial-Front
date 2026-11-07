<script>
  import Spinner from '../comunes/Spinner.svelte'
  import MensajeError from '../comunes/MensajeError.svelte'
  import EstadoBadge from '../comunes/EstadoBadge.svelte'
  import { etiquetaEstado } from './estados-publicacion.js'

  // Contenido del detalle expandido de una publicación (etapa D). Muestra
  // los mismos 4 estados que un listado pero a escala de fila: cargando /
  // error (con Reintentar) / datos. El resumen de la fila basta para el
  // encabezado; el cuerpo sale de 'datos' (GET /posts/{id}).
  let { resumen, datos, cargando, error, onReintentar } = $props()

  function formatoFecha(valor) {
    if (!valor) return '—'
    return new Date(valor).toLocaleString()
  }
</script>

<div class="detalle">
  <div class="cabecera-detalle">
    <strong>{resumen.name}</strong>
    <EstadoBadge estado={resumen.status} etiqueta={etiquetaEstado(resumen.status)} />
  </div>

  {#if cargando}
    <div class="centrado">
      <Spinner />
    </div>
  {:else if error}
    <MensajeError mensaje={error} onReintentar={onReintentar} />
  {:else if datos}
    <p class="contenido">{datos.content}</p>

    {#if datos.moderator_comments}
      <p class="comentarios">
        <span class="rotulo">Comentarios del moderador:</span>
        {datos.moderator_comments}
      </p>
    {/if}

    <div class="grilla">
      <div>
        <span class="rotulo">Autor</span>
        <span>{datos.user?.name ?? '—'}</span>
      </div>
      <div>
        <span class="rotulo">Canales</span>
        <span>
          {#if datos.channels?.length}
            {datos.channels.map((c) => c.name).join(', ')}
          {:else}
            —
          {/if}
        </span>
      </div>
      <div>
        <span class="rotulo">Medios</span>
        <span>
          {#if datos.medias?.length}
            {datos.medias.map((m) => m.name).join(', ')}
          {:else}
            —
          {/if}
        </span>
      </div>
      <div>
        <span class="rotulo">Creada</span>
        <span>{formatoFecha(datos.created_at)}</span>
      </div>
      <div>
        <span class="rotulo">Última modificación</span>
        <span>{formatoFecha(datos.updated_at)}</span>
      </div>
      {#if datos.scheduled_at}
        <div>
          <span class="rotulo">Programada</span>
          <span>{formatoFecha(datos.scheduled_at)}</span>
        </div>
      {/if}
      {#if datos.published_at}
        <div>
          <span class="rotulo">Publicada</span>
          <span>{formatoFecha(datos.published_at)}</span>
        </div>
      {/if}
    </div>

    <div class="adjuntos">
      <span class="rotulo">Adjuntos ({datos.attachments?.length ?? 0})</span>
      {#if datos.attachments?.length}
        <ul>
          {#each datos.attachments as adjunto (adjunto.id)}
            <li><span class="mono">{adjunto.mime_type}</span> · {adjunto.path}</li>
          {/each}
        </ul>
      {:else}
        <span class="sin-dato">Esta publicación no tiene adjuntos.</span>
      {/if}
    </div>
  {/if}
</div>

<style>
  .detalle {
    background: var(--color-gris-100);
    border: 1px solid var(--color-borde);
    border-radius: var(--radio-panel);
    padding: 1rem 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    font-size: 0.875rem;
  }

  .cabecera-detalle {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .centrado {
    display: flex;
    justify-content: center;
    padding: 0.5rem;
  }

  /* El contenido puede llegar a 10.000 caracteres: se muestra con scroll
     propio para no romper el alto de la tabla. */
  .contenido {
    white-space: pre-wrap;
    max-height: 12rem;
    overflow-y: auto;
    margin: 0;
  }

  .comentarios {
    background: #fffbeb; /* amber-50 */
    border: 1px solid #fde68a; /* amber-200 */
    border-radius: var(--radio-panel);
    padding: 0.5rem 0.75rem;
    margin: 0;
    color: #b45309; /* amber-700 */
  }

  .rotulo {
    display: block;
    font-weight: 600;
    color: var(--color-texto-suave);
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 2px;
  }

  .grilla {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(12rem, 1fr));
    gap: 0.75rem 1rem;
  }

  .adjuntos ul {
    margin: 0.25rem 0 0;
    padding-left: 1.25rem;
  }

  .sin-dato {
    color: var(--color-texto-suave);
  }
</style>
