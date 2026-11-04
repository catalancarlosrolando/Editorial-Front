<script>
  import { navigate } from '../router.js'
  import { sesion } from '../sesion.svelte.js'
  import { navegacion } from '../navegacion.svelte.js'
  import { useCanales } from '../useCanales.svelte.js'
  import Spinner from '../componentes/comunes/Spinner.svelte'
  import MensajeError from '../componentes/comunes/MensajeError.svelte'
  import Vacio from '../componentes/comunes/Vacio.svelte'
  import CanalesListado from '../componentes/canales/CanalesListado.svelte'

  const canales = useCanales()

  $effect(() => {
    if (!sesion.token) {
      navigate('/login')
      return
    }
    navegacion.seccion = '/canales'
    canales.cargar()
  })

  function reintentar() {
    canales.cargar()
  }
</script>

<svelte:head>
  <title>Canales · Editorial Admin</title>
</svelte:head>

<div class="pagina">
  <div class="cabecera">
    <h1>Canales</h1>
  </div>

  {#if canales.cargando}
    <div class="centrado">
      <Spinner />
    </div>
  {:else if canales.error}
    <MensajeError mensaje={canales.error} onReintentar={reintentar} />
  {:else if canales.items.length === 0}
    <Vacio mensaje="Todavía no hay canales." />
  {:else}
    <CanalesListado items={canales.items} />
  {/if}
</div>
