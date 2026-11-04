<script>
  // Campo de texto con etiqueta y errores de validación (422) debajo.
  // El valor es $bindable: el formulario de dos vías vive en el padre.
  let {
    id,
    etiqueta,
    tipo = 'text',
    valor = $bindable(''),
    errores = [],
    requerido = false,
    longitudMaxima = null,
    placeholder = ''
  } = $props()
</script>

<div class="campo">
  <label for={id}>{etiqueta}{#if requerido}<span class="asterisco"> *</span>{/if}</label>
  <input
    id={id}
    type={tipo}
    bind:value={valor}
    placeholder={placeholder}
    required={requerido}
    maxlength={longitudMaxima}
    class:invalido={errores.length > 0}
  />
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

  /* Foco: borde primary + halo suave, como los inputs del sistema */
  input:focus {
    outline: none;
    border-color: var(--color-primario);
    box-shadow: 0 0 0 3px rgb(59 130 246 / 0.15);
  }

  input.invalido {
    border-color: var(--color-peligro);
  }

  input.invalido:focus {
    box-shadow: 0 0 0 3px rgb(239 68 68 / 0.15);
  }

  .error {
    color: var(--color-peligro-hover);
    font-size: 0.75rem;
    line-height: 1rem;
  }
</style>
