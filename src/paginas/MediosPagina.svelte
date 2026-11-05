<script>
  import { navigate } from '../router.js'
  import { sesion } from '../sesion.svelte.js'
  import { navegacion } from '../navegacion.svelte.js'
  import { useMedios } from '../hooks/useMedios.svelte.js'
  import Spinner from '../componentes/comunes/Spinner.svelte'
  import MensajeError from '../componentes/comunes/MensajeError.svelte'
  import Vacio from '../componentes/comunes/Vacio.svelte'
  import MediosFiltros from '../componentes/medios/MediosFiltros.svelte'
  import MediosListado from '../componentes/medios/MediosListado.svelte'

  const medios = useMedios()

  $effect(() => {
    if (!sesion.token) {
      navigate('/login')
      return
    }
    navegacion.seccion = '/medios'
    medios.cargar()
    medios.cargarTipos()
  })

  // El componente de filtros avisa con la callback onFiltrar; acá recargamos.
  function filtrar(filtros) {
    medios.cargar(filtros)
  }

  function reintentar() {
    medios.cargar()
  }
</script>

<svelte:head>
  <title>Medios · Editorial Admin</title>
</svelte:head>

<div class="pagina">
  <div class="cabecera">
    <h1>Medios</h1>
  </div>

  <MediosFiltros tipos={medios.tipos} onFiltrar={filtrar} />

  {#if medios.cargando}
    <div class="centrado">
      <Spinner />
    </div>
  {:else if medios.error}
    <MensajeError mensaje={medios.error} onReintentar={reintentar} />
  {:else if medios.items.length === 0}
    <Vacio mensaje="No hay medios que coincidan con la búsqueda." />
  {:else}
    <MediosListado items={medios.items} tipos={medios.tipos} />
  {/if}
</div>
