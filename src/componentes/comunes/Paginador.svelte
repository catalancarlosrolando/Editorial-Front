<script>
  import Boton from './Boton.svelte'

  // Paginador reutilizable para TODO listado paginado. Extraído del paginado
  // de Dispositivos (fase 1) cuando la etapa C lo necesitó también en
  // /usuarios: misma pinta, props genéricas (Anterior/Siguiente + "Página X
  // de Y") y callback onCambiar(n) con el número de página destino.
  // 'total' y 'cargando' son opcionales: si vienen, se muestran el conteo de
  // registros y los botones se deshabilitan mientras carga.
  let { pagina, ultimaPagina, onCambiar, total = null, cargando = false } = $props()
</script>

<div class="paginado">
  <span class="info">
    {#if total !== null}{total} registro{total === 1 ? '' : 's'} · {/if}página {pagina} de {ultimaPagina}
  </span>
  <div class="botones">
    <Boton variante="neutra" deshabilitado={cargando || pagina <= 1} onclick={() => onCambiar(pagina - 1)}>
      ← Anterior
    </Boton>
    <Boton
      variante="neutra"
      deshabilitado={cargando || pagina >= ultimaPagina}
      onclick={() => onCambiar(pagina + 1)}
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
