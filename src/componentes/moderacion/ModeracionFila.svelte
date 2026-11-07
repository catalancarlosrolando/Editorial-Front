<script>
  import EstadoBadge from '../comunes/EstadoBadge.svelte'
  import MenuAcciones from '../comunes/MenuAcciones.svelte'
  import { etiquetaEstado, etiquetaTipo } from '../publicaciones/estados-publicacion.js'

  // Una fila de la cola de moderación (etapa F). El backend manda la fila
  // COMPLETA (content, canales, adjuntos), así que el moderador decide sin
  // otro fetch. Los textos del diálogo los arma la página: acá solo se
  // pinta y se avisa onAprobar/onRechazar hacia arriba.
  let { post, acciones = [], ocupado = false } = $props()

  // Vista previa del contenido: suficiente para decidir sin abrir nada.
  const resumenContenido = $derived((post.content ?? '').slice(0, 140))

  function formatoFecha(valor) {
    if (!valor) return null
    return new Date(valor).toLocaleString()
  }
</script>

<tr>
  <td>
    <span class="celda-etiqueta">Publicación</span>
    <span class="nombre">{post.name}</span>
    {#if resumenContenido}
      <span class="contenido">{resumenContenido}{post.content?.length > 140 ? '…' : ''}</span>
    {/if}
  </td>
  <td>
    <span class="celda-etiqueta">Tipo</span>
    {etiquetaTipo(post.type)}
  </td>
  <td>
    <span class="celda-etiqueta">Estado</span>
    <EstadoBadge estado={post.status} etiqueta={etiquetaEstado(post.status)} />
  </td>
  <td>
    <span class="celda-etiqueta">Autor</span>
    {post.user?.name ?? '—'}
  </td>
  <td>
    <span class="celda-etiqueta">Canales</span>
    {#if post.channels?.length}
      <span class="canales">
        {#each post.channels as canal (canal.id)}
          <span class="badge neutra canal">{canal.name}</span>
        {/each}
      </span>
    {:else}
      <span class="sin-dato">—</span>
    {/if}
  </td>
  <td>
    <span class="celda-etiqueta">Fechas</span>
    <span class="fechas">
      <span>Enviada {formatoFecha(post.updated_at) ?? formatoFecha(post.created_at) ?? '—'}</span>
      {#if post.scheduled_at}
        <span>Programada {formatoFecha(post.scheduled_at)}</span>
      {/if}
    </span>
  </td>
  <td>
    <span class="celda-etiqueta">Acciones</span>
    <MenuAcciones etiqueta="Acciones de moderación" items={acciones} deshabilitado={ocupado} />
  </td>
</tr>

<style>
  .nombre {
    display: block;
    font-weight: 600;
  }

  .contenido {
    display: block;
    font-size: 0.8125rem;
    color: var(--color-texto-medio);
    margin-top: 2px;
  }

  .canales {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }

  .canal {
    max-width: 14rem;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .sin-dato {
    color: var(--color-texto-suave);
  }

  .fechas {
    display: flex;
    flex-direction: column;
    gap: 2px;
    font-size: 0.8125rem;
    color: var(--color-texto-medio);
  }
</style>
