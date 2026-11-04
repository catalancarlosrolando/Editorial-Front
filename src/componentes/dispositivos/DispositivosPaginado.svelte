<script>
  import Boton from '../comunes/Boton.svelte'

  // Barra de paginación (botones Anterior/Siguiente con ?page=N).
  let { paginaActual, ultimaPagina, total, cargando, onAnterior, onSiguiente } = $props()
</script>

<div class="paginado">
  <span class="info">
    {total} dispositivo{total === 1 ? '' : 's'} · página {paginaActual} de {ultimaPagina}
  </span>
  <div class="botones">
    <Boton variante="neutra" deshabilitado={cargando || paginaActual <= 1} onclick={onAnterior}>
      ← Anterior
    </Boton>
    <Boton
      variante="neutra"
      deshabilitado={cargando || paginaActual >= ultimaPagina}
      onclick={onSiguiente}
    >
      Siguiente →
    </Boton>
  </div>
</div>

<style>
  .paginado {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    flex-wrap: wrap;
  }

  /* Overview de paginación al estilo del sistema: texto suave 14px */
  .info {
    color: var(--color-texto-suave);
    font-size: 0.875rem;
  }

  .botones {
    display: flex;
    gap: 0.5rem;
  }
</style>
