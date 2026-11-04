<script>
  // Estado "sin datos": un listado con total 0 NO es un error.
  let { mensaje } = $props()
</script>

<div class="vacio">
  <p>{mensaje}</p>
</div>

<style>
  .vacio {
    background: var(--color-panel);
    border: 1px solid var(--color-borde);
    border-radius: var(--radio-panel);
    box-shadow: var(--anillo);
    padding: 2.5rem 1.25rem;
    text-align: center;
    color: var(--color-texto-suave);
    font-size: 0.875rem;
  }
</style>
