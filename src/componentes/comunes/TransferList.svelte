<script>
  // TransferList: la pieza reutilizable de las relaciones N:M. Muestra dos
  // columnas (disponibles / asignadas) con un botón por fila para pasar o
  // quitar ítems, y avisa al padre con onGuardar(ids) — la lista COMPLETA de
  // ids que quedaron en la columna asignada (el padre calcula el delta).
  // Solo presentación: no sabe si son medios, canales ni contra qué endpoint.
  import Boton from './Boton.svelte'

  let {
    tituloDisponibles = 'Disponibles',
    tituloAsignadas = 'Asignadas',
    disponibles = [],
    asignadas = [],
    guardando = false,
    onGuardar
  } = $props()

  // Los ids que el usuario dejó en la columna asignada (estado de edición).
  let idsAsignadas = $state([])

  // Normalización defensiva: el componente es reutilizable y no controla de
  // dónde salen las listas, así que si el padre todavía no tiene arrays
  // (carga en curso u otra forma de respuesta) caen a listas vacías.
  const listaAsignadas = $derived(Array.isArray(asignadas) ? asignadas : [])
  const listaDisponibles = $derived(Array.isArray(disponibles) ? disponibles : [])

  // Cuando el padre trae datos nuevos (otra elección o el refresco tras
  // guardar), el estado local vuelve a arrancar de lo que dice el backend.
  $effect(() => {
    idsAsignadas = listaAsignadas.map((a) => a.id)
  })

  // Catálogo unificado por id: la lista completa más lo asignado. Va en un
  // Map para que un ítem asignado se muestre aunque ya no figure en la
  // lista completa del padre.
  const catalogo = $derived.by(() => {
    const mapa = new Map()
    for (const item of [...listaAsignadas, ...listaDisponibles]) mapa.set(item.id, item)
    return [...mapa.values()]
  })

  const enAsignadas = $derived(catalogo.filter((item) => idsAsignadas.includes(item.id)))
  const enDisponibles = $derived(catalogo.filter((item) => !idsAsignadas.includes(item.id)))

  // ¿El usuario movió algo respecto a lo que dice el backend?
  const hayCambios = $derived(
    idsAsignadas.length !== listaAsignadas.length ||
      listaAsignadas.some((a) => !idsAsignadas.includes(a.id))
  )

  function pasar(id) {
    idsAsignadas.push(id)
  }

  function quitar(id) {
    idsAsignadas = idsAsignadas.filter((x) => x !== id)
  }

  function guardarCambios() {
    onGuardar([...idsAsignadas])
  }
</script>

<div class="panel">
  <div class="columna">
    <h2>{tituloDisponibles} <span class="contador">{enDisponibles.length}</span></h2>
    <ul>
      {#each enDisponibles as item (item.id)}
        <li>
          <span class="nombre">{item.name}</span>
          <Boton variante="neutra" deshabilitado={guardando} onclick={() => pasar(item.id)}>
            Pasar →
          </Boton>
        </li>
      {:else}
        <li class="sin-items">No queda nada por agregar.</li>
      {/each}
    </ul>
  </div>

  <div class="columna">
    <h2>{tituloAsignadas} <span class="contador">{enAsignadas.length}</span></h2>
    <ul>
      {#each enAsignadas as item (item.id)}
        <li>
          <span class="nombre">{item.name}</span>
          <Boton variante="neutra" deshabilitado={guardando} onclick={() => quitar(item.id)}>
            ← Quitar
          </Boton>
        </li>
      {:else}
        <li class="sin-items">Todavía no hay nada asignado.</li>
      {/each}
    </ul>
  </div>
</div>

<div class="pie">
  <span class="aviso-cambios">
    {#if guardando}
      Guardando…
    {:else if hayCambios}
      Hay cambios sin guardar.
    {/if}
  </span>
  <Boton deshabilitado={guardando || !hayCambios} onclick={guardarCambios}>
    Guardar cambios
  </Boton>
</div>

<style>
  .panel {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  .columna {
    background: var(--color-panel);
    border: 1px solid var(--color-borde);
    border-radius: var(--radio-panel);
    box-shadow: var(--anillo), var(--sombra);
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    min-width: 0;
  }

  h2 {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .contador {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--color-texto-medio);
    background: var(--color-gris-100);
    border-radius: 999px;
    padding: 1px 8px;
  }

  ul {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    max-height: 320px;
    overflow-y: auto;
  }

  li {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    padding: 0.5rem 0.25rem;
    border-top: 1px solid var(--color-borde);
    font-size: 0.875rem;
  }

  li:first-child {
    border-top: none;
  }

  .nombre {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .sin-items {
    color: var(--color-texto-suave);
    font-size: 0.8125rem;
  }

  /* Botón compacto dentro de la fila: usa el Botón del sistema pero más chico */
  li :global(button) {
    padding: 0.25rem 0.625rem;
    font-size: 0.75rem;
    flex-shrink: 0;
  }

  .pie {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 1rem;
  }

  .aviso-cambios {
    font-size: 0.875rem;
    color: var(--color-texto-suave);
  }

  @media (width < 40rem) {
    .panel {
      grid-template-columns: 1fr;
    }
  }
</style>
