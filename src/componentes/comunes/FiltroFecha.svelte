<script>
  // Input de filtro de FECHA (YYYY-MM-DD, el formato que pide el backend):
  // mismo contrato que FiltroTexto — bind:value + callback opcional alFiltrar
  // al apretar Enter. Es type="date" (no datetime-local) porque los filtros
  // del backend son por día, sin hora.
  let { id, etiqueta, valor = $bindable(''), alFiltrar = null } = $props()

  function alApretarTecla(e) {
    if (alFiltrar && e.key === 'Enter') {
      e.preventDefault()
      alFiltrar()
    }
  }
</script>

<div class="campo">
  <label for={id}>{etiqueta}</label>
  <input id={id} type="date" bind:value={valor} onkeydown={alApretarTecla} />
</div>

<style>
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

  input:focus {
    outline: none;
    border-color: var(--color-primario);
    box-shadow: 0 0 0 3px rgb(59 130 246 / 0.15);
  }
</style>
