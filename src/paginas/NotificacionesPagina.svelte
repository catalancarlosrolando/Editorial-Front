<script>
  import { navigate } from '../router.js'
  import { sesion } from '../sesion.svelte.js'
  import { navegacion } from '../navegacion.svelte.js'
  import { useNotificaciones } from '../hooks/useNotificaciones.svelte.js'
  import Boton from '../componentes/comunes/Boton.svelte'
  import Spinner from '../componentes/comunes/Spinner.svelte'
  import MensajeError from '../componentes/comunes/MensajeError.svelte'
  import Vacio from '../componentes/comunes/Vacio.svelte'
  import NotificacionesListado from '../componentes/notificaciones/NotificacionesListado.svelte'

  const notificaciones = useNotificaciones()

  $effect(() => {
    if (!sesion.token) {
      navigate('/login')
      return
    }
    navegacion.seccion = '/notificaciones'
    notificaciones.cargar()
  })

  function reintentar() {
    notificaciones.cargar()
  }

  // La eliminación de una notificación es una confirmación SIMPLE (sin motivo):
  // window.confirm alcanza. El Confirmar con motivo obligatorio es para
  // rechazar/deshabilitar/stop, que llegan en etapas posteriores.
  function quitar(id) {
    if (!window.confirm('¿Eliminar esta notificación?')) return
    notificaciones.eliminar(id)
  }
</script>

<svelte:head>
  <title>Notificaciones · Editorial Admin</title>
</svelte:head>

<div class="pagina">
  <div class="cabecera">
    <h1>Notificaciones</h1>
    <Boton
      variante="neutra"
      deshabilitado={
        notificaciones.cargando ||
        notificaciones.operandoTodas ||
        notificaciones.operandoId !== null ||
        notificaciones.noLeidas === 0
      }
      onclick={() => notificaciones.marcarTodas()}
    >
      Marcar todas como leídas
    </Boton>
  </div>

  {#if notificaciones.errorOperacion}
    <!-- Error de marcar/eliminar (distinto del error de carga): Reintentar recarga el listado -->
    <MensajeError mensaje={notificaciones.errorOperacion} onReintentar={reintentar} />
  {/if}

  {#if notificaciones.cargando}
    <div class="centrado">
      <Spinner />
    </div>
  {:else if notificaciones.error}
    <MensajeError mensaje={notificaciones.error} onReintentar={reintentar} />
  {:else if notificaciones.items.length === 0}
    <Vacio mensaje="No tenés notificaciones." />
  {:else}
    <NotificacionesListado
      items={notificaciones.items}
      operandoId={notificaciones.operandoId}
      onMarcarLeida={notificaciones.marcarLeida}
      onEliminar={quitar}
    />
  {/if}
</div>
