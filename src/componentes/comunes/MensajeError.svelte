<script>
  // Estado de error de un listado, con callback para reintentar la carga.
  import Boton from './Boton.svelte'

  let { mensaje, onReintentar } = $props()
</script>

<div class="panel-error" role="alert">
  <p>⚠️ {mensaje}</p>
  <Boton variante="neutra" onclick={onReintentar}>Reintentar</Boton>
</div>

<style>
  .panel-error {
    background: #fef2f2; /* danger-50 */
    border: 1px solid #fecaca; /* danger-200 */
    border-radius: var(--radio-panel);
    padding: 1rem 1.25rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    color: #b91c1c; /* danger-700 */
    font-size: 0.875rem;
  }
</style>
