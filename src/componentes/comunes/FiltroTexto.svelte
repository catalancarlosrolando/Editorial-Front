<script>
  // Input de filtro reutilizable: valor de dos vías con bind:value y callback
  // opcional alFiltrar, que dispara al apretar Enter. La callback es útil
  // dentro de formularios de filtros (el Enter evita el submit nativo y llama
  // a la misma recarga que el botón Filtrar); si se omite, el input se comporta
  // como uno común.
  let { id, etiqueta, valor = $bindable(''), placeholder = '', alFiltrar = null } = $props()

  function alApretarTecla(e) {
    if (alFiltrar && e.key === 'Enter') {
      e.preventDefault()
      alFiltrar()
    }
  }
</script>

<div class="campo">
  <label for={id}>{etiqueta}</label>
  <input id={id} type="text" bind:value={valor} {placeholder} onkeydown={alApretarTecla} />
</div>

<style>
  /* Misma gramática que Campo, pero pensado para filas de filtros */
  .campo {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  label {
    font-size: 0.875rem;
    font-weight: 600;
  }

  input {
    border: 1px solid var(--color-borde-fuerte);
    border-radius: var(--radio-campo);
    padding: 0.5rem 0.75rem;
    font: inherit;
    font-size: 0.875rem;
    line-height: 1.25rem;
    background: var(--color-panel);
    transition:
      border-color var(--transicion),
      box-shadow var(--transicion);
  }

  input::placeholder {
    color: var(--color-texto-suave);
  }

  input:focus {
    outline: none;
    border-color: var(--color-primario);
    box-shadow: 0 0 0 3px rgb(59 130 246 / 0.15);
  }
</style>
