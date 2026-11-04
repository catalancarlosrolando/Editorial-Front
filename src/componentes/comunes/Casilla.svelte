<script>
  // Checkbox con etiqueta (ej.: "Activo" del dispositivo, "Recordarme" del login).
  let { id, etiqueta, marcado = $bindable(false) } = $props()
</script>

<div class="casilla">
  <input id={id} type="checkbox" bind:checked={marcado} />
  <label for={id}>{etiqueta}</label>
</div>

<style>
  .casilla {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  input {
    width: 1rem;
    height: 1rem;
    accent-color: var(--color-primario);
    cursor: pointer;
  }

  label {
    font-size: 0.875rem;
    cursor: pointer;
  }
</style>
