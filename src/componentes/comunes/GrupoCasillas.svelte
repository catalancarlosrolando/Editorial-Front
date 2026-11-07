<script>
  // Grupo de checkboxes con bind:group (etapa E: canales y medios del
  // formulario de publicación). La CASILLA individual (Casilla.svelte) sirve
  // para un boolean ("Activo", "Recordarme"); acá la selección es un ARRAY de
  // ids, que es lo que esperan los channel_ids/media_ids del backend.
  // `elegidos` es $bindable: el grupo vive en el formulario. Si el checkbox
  // lleva onchange, corre DESPUÉS de que bind:group actualizó el array (el
  // listener del binding va directo en el input y el handler delegado salta
  // al burbujear), así que puede leer la selección ya actualizada.
  let {
    leyenda,
    opciones = [],
    elegidos = $bindable([]),
    requerido = false,
    deshabilitado = false,
    vacio = null,
    ayuda = null,
    errores = [],
    onchange = null
  } = $props()
</script>

<div class="grupo" class:invalido={errores.length > 0}>
  <span class="leyenda">
    {leyenda}{#if requerido}<span class="asterisco"> *</span>{/if}
  </span>
  {#if ayuda}
    <p class="ayuda">{ayuda}</p>
  {/if}
  {#if opciones.length === 0 && vacio}
    <p class="vacio">{vacio}</p>
  {:else}
    <div class="casillas">
      {#each opciones as opcion (opcion.id)}
        <label class="casilla">
          <input
            type="checkbox"
            value={opcion.id}
            bind:group={elegidos}
            onchange={onchange}
            disabled={deshabilitado}
          />
          <span>{opcion.etiqueta}</span>
        </label>
      {/each}
    </div>
  {/if}
  {#each errores as mensaje (mensaje)}
    <p class="error">{mensaje}</p>
  {/each}
</div>

<style>
  .grupo {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  .leyenda {
    font-size: 0.875rem;
    font-weight: 600;
  }

  .asterisco {
    color: var(--color-peligro);
  }

  .ayuda,
  .vacio {
    font-size: 0.75rem;
    color: var(--color-texto-suave);
  }

  .casillas {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem 1rem;
    max-height: 10rem;
    overflow-y: auto;
    border: 1px solid var(--color-borde-fuerte);
    border-radius: var(--radio-campo);
    padding: 0.5rem 0.75rem;
    background: var(--color-panel);
  }

  .casilla {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.875rem;
    cursor: pointer;
  }

  input {
    width: 1rem;
    height: 1rem;
    accent-color: var(--color-primario);
    cursor: pointer;
    flex-shrink: 0;
  }

  input:disabled + span {
    color: var(--color-texto-suave);
  }

  .grupo.invalido .casillas {
    border-color: var(--color-peligro);
  }

  .error {
    color: var(--color-peligro-hover);
    font-size: 0.75rem;
    line-height: 1rem;
  }
</style>
