<script>
  // Área de texto multilínea, igual que Campo pero con <textarea>.
  let {
    id,
    etiqueta,
    valor = $bindable(''),
    errores = [],
    filas = 3,
    longitudMaxima = null,
    placeholder = '',
    requerido = false
  } = $props()
</script>

<div class="campo">
  <label for={id}>{etiqueta}{#if requerido}<span class="asterisco"> *</span>{/if}</label>
  <textarea
    id={id}
    rows={filas}
    bind:value={valor}
    placeholder={placeholder}
    maxlength={longitudMaxima}
    required={requerido}
    class:invalido={errores.length > 0}
  ></textarea>
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

  textarea {
    border: 1px solid var(--color-borde-fuerte);
    border-radius: var(--radio-campo);
    padding: 0.5rem 0.75rem;
    font: inherit;
    font-size: 0.875rem;
    line-height: 1.25rem;
    resize: vertical;
    background: var(--color-panel);
    transition:
      border-color var(--transicion),
      box-shadow var(--transicion);
  }

  textarea::placeholder {
    color: var(--color-texto-suave);
  }

  textarea:focus {
    outline: none;
    border-color: var(--color-primario);
    box-shadow: 0 0 0 3px rgb(59 130 246 / 0.15);
  }

  textarea.invalido {
    border-color: var(--color-peligro);
  }

  textarea.invalido:focus {
    box-shadow: 0 0 0 3px rgb(239 68 68 / 0.15);
  }

  .error {
    color: var(--color-peligro-hover);
    font-size: 0.75rem;
    line-height: 1rem;
  }
</style>
