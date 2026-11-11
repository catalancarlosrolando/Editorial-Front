<script>
  // Panel lateral de filtros: reemplaza al formulario horizontal de una fila.
  // El botón gatillo vive donde antes estaba el formulario y el drawer se
  // desliza desde la derecha con velo y cierre por Escape (la misma gramática
  // que Confirmar y la sidebar off-canvas). Los campos llegan como snippet
  // children y el <form> es de acá: así el Enter en un campo de texto dispara
  // lo mismo que el botón Filtrar (submit nativo → aplicar → cerrar).
  //
  // Contrato con los filtros que lo usan: onAplicar se llama al confirmar y
  // el panel se cierra solo (aplicar vuelve a la tabla); onLimpiar resetea y
  // deja el panel abierto mostrando el estado limpio. El gatillo muestra un
  // contador con la cantidad de criterios que tienen valor (prop activos).
  import { fade, fly } from 'svelte/transition'
  import Boton from './Boton.svelte'
  import Icono from './Icono.svelte'

  let { activos = 0, titulo = 'Filtros', onAplicar, onLimpiar, children } = $props()

  let abierto = $state(false)

  function aplicar(e) {
    e.preventDefault()
    onAplicar()
    abierto = false
  }

  // Escape cierra mientras está abierto, con la misma limpieza en $effect
  // que Confirmar y el menú de acciones.
  $effect(() => {
    if (!abierto) return
    const cerrar = (e) => {
      if (e.key === 'Escape') abierto = false
    }
    window.addEventListener('keydown', cerrar)
    return () => window.removeEventListener('keydown', cerrar)
  })
</script>

<div class="gatillo">
  <Boton
    variante="neutra"
    onclick={() => (abierto = true)}
    aria-haspopup="dialog"
    aria-expanded={abierto}
  >
    <span class="contenido-gatillo">
      <Icono nombre="filtros" tamano={16} />
      {titulo}
      {#if activos > 0}
        <span class="contador">{activos}</span>
      {/if}
    </span>
  </Boton>
</div>

{#if abierto}
  <button
    type="button"
    class="velo"
    aria-label="Cerrar filtros"
    onclick={() => (abierto = false)}
    transition:fade={{ duration: 150 }}
  ></button>
  <div
    class="panel"
    role="dialog"
    aria-modal="true"
    aria-label={titulo}
    transition:fly={{ x: 320, duration: 150 }}
  >
    <header class="cabecera-panel">
      <h2>{titulo}</h2>
      <button type="button" class="cerrar" aria-label="Cerrar" onclick={() => (abierto = false)}>
        <Icono nombre="cruzar" tamano={18} />
      </button>
    </header>
    <form onsubmit={aplicar}>
      <div class="cuerpo">
        {@render children?.()}
      </div>
      <footer class="pie">
        <Boton variante="neutra" onclick={onLimpiar}>Limpiar</Boton>
        <Boton tipo="submit">Filtrar</Boton>
      </footer>
    </form>
  </div>
{/if}

<style>
  .gatillo {
    display: flex;
  }

  .contenido-gatillo {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
  }

  /* Contador de criterios activos: pill con la gramática badge (fondo 50 +
     texto 600) pero en azul, para que el gatillo quede marcado sin serlo */
  .contador {
    min-width: 1.25rem;
    padding: 0 0.375rem;
    border-radius: 999px;
    background: var(--color-primario-suave);
    color: var(--color-primario-hover);
    font-size: 0.75rem;
    line-height: 1.125rem;
    font-weight: 600;
    text-align: center;
  }

  /* Velo y z-index idénticos a Confirmar: por encima de la sidebar (z-40) */
  .velo {
    position: fixed;
    inset: 0;
    z-index: 50;
    background: rgb(9 9 9 / 0.4);
    border: none;
    padding: 0;
    cursor: default;
  }

  .panel {
    position: fixed;
    z-index: 51;
    top: 0;
    right: 0;
    bottom: 0;
    width: min(22rem, 100vw);
    display: flex;
    flex-direction: column;
    background: var(--color-panel);
    border: 1px solid var(--color-borde);
    border-right: none;
    border-radius: var(--radio-panel) 0 0 var(--radio-panel);
    box-shadow:
      var(--anillo),
      0 20px 25px -5px rgb(0 0 0 / 0.1),
      0 8px 10px -6px rgb(0 0 0 / 0.1);
  }

  .cabecera-panel {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 1rem 1.25rem;
    border-bottom: 1px solid var(--color-borde);
  }

  .cerrar {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    border: none;
    background: transparent;
    border-radius: var(--radio-boton);
    color: var(--color-texto-medio);
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
    outline-offset: 2px;
  }

  /* El form ocupa todo el alto restante: cuerpo scrolleable y pie fijo abajo */
  form {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
  }

  .cuerpo {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding: 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .pie {
    display: flex;
    justify-content: space-between;
    gap: 0.5rem;
    padding: 1rem 1.25rem;
    border-top: 1px solid var(--color-borde);
  }
</style>
