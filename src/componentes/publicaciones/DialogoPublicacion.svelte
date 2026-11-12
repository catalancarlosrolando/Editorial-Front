<script>
  import Icono from '../comunes/Icono.svelte'
  import DetallePublicacion from './DetallePublicacion.svelte'

  // Ventana de diálogo modal con el detalle de una publicación (etapa D).
  // Reemplaza la fila expandible: la tabla renderiza este componente UNA sola
  // vez y el estado (detalle/cargando/error) sigue viviendo en el hook; acá
  // solo se sincroniza el <dialog> nativo con ese estado: abierto mientras
  // haya detalle, cerrado cuando el hook lo pone en null. showModal() atrapa
  // el foco y close() lo devuelve al botón que abrió (nativo del navegador).
  // Todo cierre (Escape → cancel+close, botón X, clic en el velo) termina en
  // el evento 'close', que avisa onCerrar: UN único punto de sincronización
  // con el hook, sin importar la vía.
  let { detalle, cargandoDetalle, errorDetalle, onCerrar, onReintentar } = $props()

  // El elemento <dialog>, vía bind:this.
  let dialogo = $state(null)

  // Sincroniza el <dialog> nativo con el estado del hook. Mientras está
  // abierto bloquea el scroll del body; el cleanup del efecto lo restaura
  // (al cerrar y también al desmontar el componente).
  $effect(() => {
    const el = dialogo
    if (!el) return
    if (detalle) {
      if (!el.open) el.showModal()
      const overflowPrevio = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = overflowPrevio
      }
    }
    if (el.open) el.close()
  })

  // Clic en el velo (::backdrop): el navegador lo despacha sobre el propio
  // <dialog>, así que target === dialogo distingue el velo de un clic dentro
  // del contenido. El teclado ya está cubierto: Escape dispara el cierre
  // nativo (cancel → close) sin necesidad de un handler de teclas acá.
  function clicEnVelo(evento) {
    if (evento.target === dialogo) dialogo.close()
  }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_noninteractive_element_interactions -->
<dialog
  bind:this={dialogo}
  class="dialogo-publicacion"
  aria-labelledby="titulo-dialogo-publicacion"
  onclick={clicEnVelo}
  onclose={onCerrar}
>
  {#if detalle}
    <header class="cabecera">
      <h2 id="titulo-dialogo-publicacion">{detalle.resumen.name}</h2>
      <button
        type="button"
        class="cerrar"
        aria-label="Cerrar"
        onclick={() => dialogo.close()}
      >
        <Icono nombre="cruzar" tamano={18} />
      </button>
    </header>
    <div class="cuerpo">
      <DetallePublicacion
        resumen={detalle.resumen}
        datos={detalle.datos}
        cargando={cargandoDetalle}
        error={errorDetalle}
        onReintentar={onReintentar}
      />
    </div>
  {/if}
</dialog>

<style>
  /* Cáscara del diálogo: mismo panel del design system. El <dialog> nativo
     ya se centra solo con showModal(); el display:flex queda limitado a
     [open] porque dialog:not([open]) del navegador hace display:none y no
     hay que pisarlo. */
  .dialogo-publicacion {
    width: min(48rem, 92vw);
    max-height: 90dvh;
    padding: 0;
    border: 1px solid var(--color-borde);
    border-radius: var(--radio-panel);
    background: var(--color-panel);
    color: var(--color-texto);
    box-shadow: var(--anillo), var(--sombra);
  }

  .dialogo-publicacion[open] {
    display: flex;
    flex-direction: column;
  }

  /* Velo del modal, igual que el de Confirmar. */
  .dialogo-publicacion::backdrop {
    background: rgb(9 9 9 / 0.4);
  }

  /* Encabezado fijo arriba: título + botón de cerrar. */
  .cabecera {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 1rem 1.25rem;
    border-bottom: 1px solid var(--color-borde);
    flex-shrink: 0;
  }

  .cerrar {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    flex-shrink: 0;
    border: none;
    border-radius: var(--radio-boton);
    background: transparent;
    color: var(--color-texto-suave);
    cursor: pointer;
    transition:
      background-color var(--transicion),
      color var(--transicion);
  }

  .cerrar:hover {
    background: var(--color-gris-100);
    color: var(--color-texto);
  }

  .cerrar:focus-visible {
    outline: 2px solid var(--color-primario);
    outline-offset: 1px;
  }

  /* El cuerpo desplaza SU contenido: al llegar al max-height del diálogo,
     min-height: 0 deja que el item de flex encoja y habilite su scroll. */
  .cuerpo {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    padding: 1rem 1.25rem;
  }

  /* Entrada suave, solo para quien no pidió movimiento reducido. */
  @media (prefers-reduced-motion: no-preference) {
    .dialogo-publicacion[open] {
      animation: dialogo-entra var(--transicion);
    }

    .dialogo-publicacion[open]::backdrop {
      animation: velo-entra var(--transicion);
    }
  }

  @keyframes dialogo-entra {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes velo-entra {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  /* Móvil: ocupa casi toda la pantalla y el contenido largo desplaza adentro
     (la página de fondo queda quieta por el bloqueo del scroll del body). */
  @media (width < 40rem) {
    .dialogo-publicacion[open] {
      width: 100vw;
      max-width: 100vw;
      height: 100dvh;
      max-height: 100dvh;
      border-radius: 0;
    }
  }
</style>
