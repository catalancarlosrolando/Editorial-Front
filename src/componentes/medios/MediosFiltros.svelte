<script>
  import Boton from '../comunes/Boton.svelte'
  import Campo from '../comunes/Campo.svelte'
  import Seleccion from '../comunes/Seleccion.svelte'

  // Filtros del listado de medios. Maneja su propio estado local y avisa a la
  // página con la callback onFiltrar({ type, name }).
  let { tipos = [], onFiltrar } = $props()

  let type = $state('')
  let name = $state('')

  function aplicar(e) {
    e.preventDefault()
    onFiltrar({ type, name })
  }

  function limpiar() {
    type = ''
    name = ''
    onFiltrar({ type: '', name: '' })
  }
</script>

<form class="tarjeta filtros" onsubmit={aplicar}>
  <Seleccion
    id="medio-tipo"
    etiqueta="Tipo"
    bind:valor={type}
    opciones={tipos}
    textoVacio="Todos los tipos"
  />
  <Campo
    id="medio-nombre"
    etiqueta="Nombre"
    bind:valor={name}
    placeholder="Buscar por nombre…"
  />
  <div class="acciones">
    <Boton tipo="submit">Filtrar</Boton>
    <Boton variante="neutra" onclick={limpiar}>Limpiar</Boton>
  </div>
</form>

<style>
  .filtros {
    display: flex;
    gap: 1rem;
    align-items: end;
    flex-wrap: wrap;
  }

  .filtros :global(.campo) {
    flex: 1;
    min-width: 12rem;
  }

  .acciones {
    display: flex;
    gap: 0.5rem;
  }
</style>
