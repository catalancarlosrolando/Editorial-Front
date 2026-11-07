<script>
  import Icono from '../comunes/Icono.svelte'
  import EstadoBadge from '../comunes/EstadoBadge.svelte'
  import MenuAcciones from '../comunes/MenuAcciones.svelte'
  import DetallePublicacion from './DetallePublicacion.svelte'
  import { etiquetaEstado, etiquetaTipo } from './estados-publicacion.js'

  // Una fila del listado de publicaciones (etapas D, E y F). La interacción
  // de la etapa D es el DETALLE EXPANDIBLE — un botón chevron por fila que
  // avisa onAlternar(post) hacia arriba, y debajo del renglón se agrega una
  // segunda <tr> que ocupa las 7 columnas con el detalle. La fila NO decide
  // qué acciones ofrecer: la página le pasa el menú ya armado (`acciones`)
  // según estado, dueño y rol (etapas E y F) — igual que el hook le pasa el
  // detalle. Cada item es { etiqueta, icono, peligroso?, alElegir }.
  // El componente renderiza DOS filas de tabla: por eso no tiene un único
  // elemento raíz.
  let { post, detalle, cargandoDetalle, errorDetalle, onAlternar, acciones = [], ocupado = false } = $props()

  // ¿Esta fila es la que tiene el detalle abierto?
  const expandido = $derived(detalle?.resumen?.id === post.id)

  // Las fechas llegan en ISO; las mostramos en formato local.
  function formatoFecha(valor) {
    if (!valor) return null
    return new Date(valor).toLocaleString()
  }
</script>

<tr>
  <td>
    <span class="celda-etiqueta">Publicación</span>
    <span class="titulo-celda">
      <button
        type="button"
        class="chevron"
        class:abierto={expandido}
        aria-expanded={expandido}
        aria-label={expandido ? 'Ocultar detalle' : 'Ver detalle'}
        onclick={() => onAlternar(post)}
      >
        <Icono nombre="chevron" tamano={16} />
      </button>
      <span class="nombre">{post.name}</span>
    </span>
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
    <span class="celda-etiqueta">Autor</span>
    {post.user?.name ?? '—'}
  </td>
  <td>
    <span class="celda-etiqueta">Fechas</span>
    <span class="fechas">
      <span>Creada {formatoFecha(post.created_at) ?? '—'}</span>
      {#if post.scheduled_at}
        <span>Programada {formatoFecha(post.scheduled_at)}</span>
      {/if}
      {#if post.published_at}
        <span>Publicada {formatoFecha(post.published_at)}</span>
      {/if}
    </span>
  </td>
  <td>
    <span class="celda-etiqueta">Acciones</span>
    <MenuAcciones etiqueta="Acciones de la publicación" items={acciones} deshabilitado={ocupado} />
  </td>
</tr>

{#if expandido}
  <tr class="fila-detalle">
    <td colspan="7">
      <DetallePublicacion
        resumen={detalle.resumen}
        datos={detalle.datos}
        cargando={cargandoDetalle}
        error={errorDetalle}
        onReintentar={() => onAlternar(detalle.resumen)}
      />
    </td>
  </tr>
{/if}

<style>
  .titulo-celda {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    min-width: 0;
  }

  /* Botón chevron del detalle: mismo tamaño táctil que la hamburguesa pero
     en chico, y gira 90° cuando la fila está abierta. */
  .chevron {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1.5rem;
    height: 1.5rem;
    flex-shrink: 0;
    border: none;
    border-radius: var(--radio-boton);
    background: transparent;
    color: var(--color-texto-suave);
    cursor: pointer;
    transition:
      background-color var(--transicion),
      transform var(--transicion);
  }

  .chevron:hover {
    background: var(--color-gris-100);
    color: var(--color-texto);
  }

  .chevron:focus-visible {
    outline: 2px solid var(--color-primario);
    outline-offset: 1px;
  }

  .chevron.abierto {
    transform: rotate(90deg);
  }

  .nombre {
    font-weight: 600;
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

  /* El renglón del detalle no necesita el hover de fila activa. */
  tr.fila-detalle:hover {
    background: var(--color-panel);
  }
</style>
