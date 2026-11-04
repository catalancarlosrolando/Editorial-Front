<!-- Indicador de carga puro: no sabe de dónde vienen los datos. -->
<div class="spinner" role="status" aria-label="Cargando"></div>

<style>
  .spinner {
    width: 30px;
    height: 30px;
    border: 3px solid var(--color-borde);
    border-top-color: var(--color-primario);
    border-radius: 50%;
    animation: girar 0.8s linear infinite;
  }

  @keyframes girar {
    to {
      transform: rotate(360deg);
    }
  }
</style>
