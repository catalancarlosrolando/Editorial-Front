<script>
  import Icono from './Icono.svelte'

  // Menú de desbordamiento ("⋮") para las acciones de fila, como el dropdown
  // del design system. Recibe items = [{ etiqueta, icono, peligroso?, alElegir }]
  // y avisa con la callback alElegir de la opción elegida.
  let { items = [], deshabilitado = false, etiqueta = 'Acciones' } = $props()

  let abierto = $state(false)
  let coordenadas = $state({ arriba: 'auto', abajo: 'auto', derecha: '8px' })

  // El panel se dibuja con position:fixed (para no quedar recortado por el
  // scroll interno de la tabla): anclado al borde derecho del botón, y si no
  // entra hacia abajo, se abre hacia arriba.
  function alternar(e) {
    if (abierto) {
      abierto = false
      return
    }
    const rect = e.currentTarget.getBoundingClientRect()
    const entraHaciaAbajo = rect.bottom + 240 <= window.innerHeight
    coordenadas = {
      arriba: entraHaciaAbajo ? `${Math.round(rect.bottom + 6)}px` : 'auto',
      abajo: entraHaciaAbajo ? 'auto' : `${Math.round(window.innerHeight - rect.top + 6)}px`,
      derecha: `${Math.max(8, Math.round(window.innerWidth - rect.right))}px`
    }
    abierto = true
  }

  function elegir(item) {
    abierto = false
    item.alElegir()
  }

  function cerrarAlEscape(e) {
    if (e.key === 'Escape') abierto = false
  }

  // Mientras está abierto: Escape y cualquier scroll lo cierran. El $effect
  // devuelve la función de limpieza (patrón del apunte).
  $effect(() => {
    if (!abierto) return
    const cerrar = () => (abierto = false)
    window.addEventListener('keydown', cerrarAlEscape)
    window.addEventListener('scroll', cerrar, true)
    return () => {
      window.removeEventListener('keydown', cerrarAlEscape)
      window.removeEventListener('scroll', cerrar, true)
    }
  })
</script>

<div class="menu">
  <button
    type="button"
    class="disparador"
    aria-haspopup="menu"
    aria-expanded={abierto}
    aria-label={etiqueta}
    disabled={deshabilitado}
    onclick={alternar}
  >
    <Icono nombre="puntos" />
  </button>

  {#if abierto}
    <!-- Velo invisible: cualquier click afuera cierra el menú -->
    <button
      type="button"
      class="velo-menu"
      aria-label="Cerrar menú"
      onclick={() => (abierto = false)}
    ></button>
    <div
      class="panel"
      role="menu"
      style="top: {coordenadas.arriba}; bottom: {coordenadas.abajo}; right: {coordenadas.derecha};"
    >
      {#each items as item (item.etiqueta)}
        <button
          type="button"
          class="opcion"
          class:peligrosa={item.peligroso}
          role="menuitem"
          onclick={() => elegir(item)}
        >
          <Icono nombre={item.icono} tamano={16} />
          {item.etiqueta}
        </button>
      {/each}
    </div>
  {/if}
</div>

<style>
  .menu {
    position: relative;
    display: inline-flex;
  }

  .disparador {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    border: none;
    border-radius: var(--radio-boton);
    background: transparent;
    color: var(--color-texto-medio);
    cursor: pointer;
    transition:
      background-color var(--transicion),
      color var(--transicion);
  }

  .disparador:hover:not(:disabled) {
    background: var(--color-gris-100);
    color: var(--color-texto);
  }

  .disparador:focus-visible {
    outline: 2px solid var(--color-primario);
    outline-offset: 2px;
  }

  .disparador:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .velo-menu {
    position: fixed;
    inset: 0;
    z-index: 30;
    background: transparent;
    border: none;
    padding: 0;
    cursor: default;
  }

  .panel {
    position: fixed;
    z-index: 31;
    min-width: 11rem;
    background: var(--color-panel);
    border: 1px solid var(--color-borde);
    border-radius: var(--radio-campo);
    box-shadow:
      var(--anillo),
      0 10px 15px -3px rgb(0 0 0 / 0.1),
      0 4px 6px -4px rgb(0 0 0 / 0.1);
    padding: 0.25rem;
    display: flex;
    flex-direction: column;
  }

  .opcion {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    padding: 0.45rem 0.6rem;
    border: none;
    border-radius: var(--radio-boton);
    background: transparent;
    color: var(--color-texto);
    font: inherit;
    font-size: 0.875rem;
    font-weight: 500;
    text-align: left;
    cursor: pointer;
    transition:
      background-color var(--transicion),
      color var(--transicion);
  }

  .opcion:hover {
    background: var(--color-gris-100);
  }

  .opcion:focus-visible {
    outline: 2px solid var(--color-primario);
    outline-offset: 1px;
  }

  .opcion.peligrosa {
    color: var(--color-peligro-hover);
  }

  .opcion.peligrosa:hover {
    background: #fef2f2;
  }
</style>
