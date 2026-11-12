<script>
  import Boton from "../comunes/Boton.svelte";
  import Spinner from "../comunes/Spinner.svelte";
  import { ETIQUETAS_ACCION } from "./etiquetas-roles-filtros-dialogos.js";

  // Panel del historial de un usuario (cambios de estado y de roles). Es solo
  // presentación: el hook trae items ya normalizados y los estados de carga.
  let {
    usuario,
    items = [],
    cargando = false,
    error = "",
    onCerrar,
  } = $props();

  function formatoFecha(valor) {
    if (!valor) return "—";
    return new Date(valor).toLocaleString();
  }
</script>

<div class="tarjeta panel">
  <div class="cabecera-panel">
    <h2>Historial de {usuario.name}</h2>
    <Boton variante="neutra" onclick={onCerrar}>Cerrar</Boton>
  </div>

  {#if cargando}
    <div class="centrado-panel">
      <Spinner />
    </div>
  {:else if error}
    <p class="error-panel">⚠️ {error}</p>
  {:else if items.length === 0}
    <p class="vacio-panel">
      Este usuario todavía no tiene cambios registrados.
    </p>
  {:else}
    <ul>
      {#each items as entrada (entrada.id)}
        <li>
          <div class="linea">
            <!-- Interpolacion de clases-->
            <span
              class="accion"
              style:color={ETIQUETAS_ACCION[entrada.action]?.color}
            >
              {ETIQUETAS_ACCION[entrada.action]?.label ?? entrada.action}
            </span>
            <span class="fecha">{formatoFecha(entrada.created_at)}</span>
          </div>
          {#if entrada.action === "status_change"}
            <p class="detalle">
              {entrada.old_value ?? "—"} → {entrada.new_value ?? "—"}
            </p>
          {:else if entrada.action === "role_assigned" || entrada.action === "role_revoked"}
            <p class="detalle">
              {entrada.new_value ?? entrada.old_value ?? "—"}
            </p>
          {/if}
          {#if entrada.reason}
            <p class="motivo">Motivo: “{entrada.reason}”</p>
          {/if}
          {#if entrada.changed_by?.name}
            <p class="autor">por {entrada.changed_by.name}</p>
          {/if}
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  .cabecera-panel {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }

  .centrado-panel {
    display: flex;
    justify-content: center;
    padding: 1.5rem 0;
  }

  .error-panel {
    color: var(--color-peligro-hover);
    font-size: 0.875rem;
  }

  .vacio-panel {
    color: var(--color-texto-suave);
    font-size: 0.875rem;
  }

  ul {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
  }

  li {
    border-top: 1px solid var(--color-borde);
    padding: 0.65rem 0.25rem;
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
  }

  li:first-child {
    border-top: none;
    padding-top: 0.25rem;
  }

  .linea {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
  }

  .accion {
    font-size: 0.875rem;
    font-weight: 600;
  }

  .fecha {
    color: var(--color-texto-suave);
    font-size: 0.75rem;
    white-space: nowrap;
  }

  .detalle {
    font-size: 0.8125rem;
    color: var(--color-texto-medio);
  }

  .motivo {
    font-size: 0.8125rem;
    color: var(--color-texto-medio);
    font-style: italic;
  }

  .autor {
    font-size: 0.75rem;
    color: var(--color-texto-suave);
  }
</style>
