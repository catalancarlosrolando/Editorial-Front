<script>
  // Botón reutilizable. El texto se pasa como snippet children y el click
  // sube al padre con la callback prop onclick.
  let {
    variante = 'primaria',
    tipo = 'button',
    deshabilitado = false,
    onclick = null,
    children
  } = $props()
</script>

<button type={tipo} class={variante} disabled={deshabilitado} {onclick}>
  {@render children?.()}
</button>

<style>
  button {
    border: 1px solid transparent;
    border-radius: var(--radio-boton);
    padding: 0.5rem 1rem;
    font: inherit;
    font-size: 0.875rem;
    font-weight: 500;
    line-height: 1.25rem;
    cursor: pointer;
    transition:
      background-color var(--transicion),
      border-color var(--transicion),
      color var(--transicion);
  }

  button:focus-visible {
    outline: 2px solid var(--color-primario);
    outline-offset: 2px;
  }

  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .primaria {
    background: var(--color-primario);
    color: #fff;
  }

  .primaria:hover:not(:disabled) {
    background: var(--color-primario-hover);
  }

  .peligrosa {
    background: var(--color-peligro);
    color: #fff;
  }

  .peligrosa:hover:not(:disabled) {
    background: var(--color-peligro-hover);
  }

  /* Neutro: superficie blanca con borde, como los botones secundarios del sistema */
  .neutra {
    background: var(--color-panel);
    color: var(--color-texto-medio);
    border-color: var(--color-borde-fuerte);
  }

  .neutra:hover:not(:disabled) {
    background: var(--color-fondo);
    color: var(--color-texto);
  }
</style>
