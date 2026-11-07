<script>
  import { navigate } from '../router.js'
  import { sesion } from '../sesion.svelte.js'
  import { navegacion } from '../navegacion.svelte.js'
  import { useDispositivos } from '../hooks/useDispositivos.svelte.js'
  import Spinner from '../componentes/comunes/Spinner.svelte'
  import MensajeError from '../componentes/comunes/MensajeError.svelte'
  import Vacio from '../componentes/comunes/Vacio.svelte'
  import DispositivoForm from '../componentes/dispositivos/DispositivoForm.svelte'
  import DispositivosListado from '../componentes/dispositivos/DispositivosListado.svelte'
  // refactor (etapa C): el paginado propio de dispositivos se extrajo a
  // componentes/comunes/Paginador.svelte, que ahora también usa /usuarios.
  import Paginador from '../componentes/comunes/Paginador.svelte'

  const dispositivos = useDispositivos()

  $effect(() => {
    if (!sesion.token) {
      navigate('/login')
      return
    }
    navegacion.seccion = '/dispositivos'
    dispositivos.cargar()
  })

  function cambiarPagina(pagina) {
    dispositivos.cargar(pagina)
  }

  async function guardar(datos) {
    await dispositivos.agregar(datos)
  }

  function reintentar() {
    dispositivos.cargar()
  }
</script>

<svelte:head>
  <title>Dispositivos · Editorial Admin</title>
</svelte:head>

<div class="pagina">
  <div class="cabecera">
    <h1>Dispositivos</h1>
  </div>

  <DispositivoForm guardando={dispositivos.guardando} onGuardar={guardar} />

  {#if dispositivos.cargando}
    <div class="centrado">
      <Spinner />
    </div>
  {:else if dispositivos.error}
    <MensajeError mensaje={dispositivos.error} onReintentar={reintentar} />
  {:else if dispositivos.items.length === 0}
    <Vacio mensaje="No hay dispositivos registrados. Creá el primero con el formulario de arriba." />
  {:else}
    <DispositivosListado
      items={dispositivos.items}
      eliminandoId={dispositivos.eliminandoId}
      onQuitar={dispositivos.quitar}
    />
    <Paginador
      pagina={dispositivos.paginaActual}
      ultimaPagina={dispositivos.ultimaPagina}
      total={dispositivos.total}
      cargando={dispositivos.cargando}
      onCambiar={cambiarPagina}
    />
  {/if}
</div>
