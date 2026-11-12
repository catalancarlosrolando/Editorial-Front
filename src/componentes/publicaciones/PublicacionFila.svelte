<script>
  import Icono from '../comunes/Icono.svelte'
  import EstadoBadge from '../comunes/EstadoBadge.svelte'
  import MenuAcciones from '../comunes/MenuAcciones.svelte'
  import { etiquetaEstado, etiquetaTipo } from './estados-publicacion.js'

  // Una fila del listado de publicaciones (etapas D, E y F). La interacción
  // de la etapa D es el DETALLE EN DIÁLOGO — un botón por fila que avisa
  // onVerDetalle(post) hacia arriba; el detalle lo muestra el
  // DialogoPublicacion que la tabla renderiza UNA sola vez (no hay segunda
  // <tr> ni colspan). La fila NO decide qué acciones ofrecer: la página le
  // pasa el menú ya armado (`acciones`) según estado, dueño y rol (etapas E
  // y F). Cada item es { etiqueta, icono, peligroso?, alElegir }.
  let { post, onVerDetalle, acciones = [], ocupado = false } = $props()

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
        class="ver-detalle"
        aria-haspopup="dialog"
        aria-label="Ver detalle de {post.name}"
        onclick={() => onVerDetalle(post)}
      >
        <Icono nombre="ojo" tamano={16} />
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

<style>
  .titulo-celda {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    min-width: 0;
  }

  /* Botón del detalle (ojo): mismo tamaño táctil y gramática de foco que el
     chevron de antes, pero no alterna nada — cada clic pide abrir el
     diálogo con el detalle de ESTA fila. */
  .ver-detalle {
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
    transition: background-color var(--transicion);
  }

  .ver-detalle:hover {
    background: var(--color-gris-100);
    color: var(--color-texto);
  }

  .ver-detalle:focus-visible {
    outline: 2px solid var(--color-primario);
    outline-offset: 1px;
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
</style>
