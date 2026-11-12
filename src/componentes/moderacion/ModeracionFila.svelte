<script>
  import EstadoBadge from "../comunes/EstadoBadge.svelte";
  import MenuAcciones from "../comunes/MenuAcciones.svelte";
  import Icono from "../comunes/Icono.svelte";
  import {
    etiquetaEstado,
    etiquetaTipo,
  } from "../publicaciones/estados-publicacion.js";

  // Una fila de la cola de moderación (etapa F). Los textos del diálogo los
  // arma la página y el detalle se muestra en el DialogoPublicacion que
  // renderiza la tabla UNA sola vez: acá solo se pinta la fila y se avisa
  // onVerDetalle(post) y las acciones (Aprobar/Rechazar) hacia arriba.
  let { post, onVerDetalle, acciones = [], ocupado = false } = $props();

  function formatoFecha(valor) {
    if (!valor) return null;
    return new Date(valor).toLocaleString();
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
    <span class="celda-etiqueta">Autor</span>
    {post.user?.name ?? "—"}
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
      <span
        >Enviada {formatoFecha(post.updated_at) ??
          formatoFecha(post.created_at) ??
          "—"}</span
      >
      {#if post.scheduled_at}
        <span>Programada {formatoFecha(post.scheduled_at)}</span>
      {/if}
    </span>
  </td>
  <td>
    <span class="celda-etiqueta">Acciones</span>
    <MenuAcciones
      etiqueta="Acciones de moderación"
      items={acciones}
      deshabilitado={ocupado}
    />
  </td>
</tr>

<style>
  .titulo-celda {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    min-width: 0;
  }

  /* Botón del detalle (ojo): abre el mismo diálogo de detalle que
     Publicaciones. Mismo tamaño táctil y gramática de foco que allá. */
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
