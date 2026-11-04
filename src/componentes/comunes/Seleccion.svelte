<script>
  // <select> genérico: recibe opciones [{ value, label }] que vienen de la API
  // (los tipos NUNCA se hardcodean) y un valor $bindable de dos vías.
  let {
    id,
    etiqueta,
    valor = $bindable(''),
    opciones = [],
    textoVacio = null,
    errores = [],
    requerido = false
  } = $props()
</script>

<div class="campo">
  <label for={id}>{etiqueta}{#if requerido}<span class="asterisco"> *</span>{/if}</label>
  <select id={id} bind:value={valor} required={requerido} class:invalido={errores.length > 0}>
    {#if textoVacio}
      <option value="">{textoVacio}</option>
    {/if}
    {#each opciones as opcion (opcion.value)}
      <option value={opcion.value}>{opcion.label}</option>
    {/each}
  </select>
  {#each errores as mensaje (mensaje)}
    <p class="error">{mensaje}</p>
  {/each}
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

  .asterisco {
    color: var(--color-peligro);
  }

  select {
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

  select:focus {
    outline: none;
    border-color: var(--color-primario);
    box-shadow: 0 0 0 3px rgb(59 130 246 / 0.15);
  }

  select.invalido {
    border-color: var(--color-peligro);
  }

  select.invalido:focus {
    box-shadow: 0 0 0 3px rgb(239 68 68 / 0.15);
  }

  .error {
    color: var(--color-peligro-hover);
    font-size: 0.75rem;
    line-height: 1rem;
  }
</style>
