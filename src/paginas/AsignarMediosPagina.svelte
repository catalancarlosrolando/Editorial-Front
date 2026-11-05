<script>
  import { fade } from 'svelte/transition'
  import { navigate } from '../router.js'
  import { sesion } from '../sesion.svelte.js'
  import { navegacion } from '../navegacion.svelte.js'
  import { useAsignaciones } from '../hooks/useAsignaciones.svelte.js'
  import { listar as listarCanales } from '../api/canales.api.js'
  import { listar as listarMedios } from '../api/medios.api.js'
  import { mediosDeCanal, asignarMedios, desasignarMedios } from '../api/asignaciones.api.js'
  import Seleccion from '../componentes/comunes/Seleccion.svelte'
  import Spinner from '../componentes/comunes/Spinner.svelte'
  import MensajeError from '../componentes/comunes/MensajeError.svelte'
  import Vacio from '../componentes/comunes/Vacio.svelte'
  import TransferList from '../componentes/comunes/TransferList.svelte'

  // El mismo hook que usa /asignar-canales; acá solo le decimos QUÉ recursos
  // maneja: se elige un canal y sobre él se agregan o quitan medios.
  const asignacion = useAsignaciones({
    cargarSelector: listarCanales,
    cargarFuente: listarMedios,
    cargarAsignadas: mediosDeCanal,
    asociar: asignarMedios,
    desasociar: desasignarMedios
  })

  // El <select> escribe acá con bind:value; el $effect de abajo reacciona.
  let canalElegido = $state('')

  $effect(() => {
    if (!sesion.token) {
      navigate('/login')
      return
    }
    navegacion.seccion = '/asignar-medios'
    asignacion.cargarInicio()
  })

  // Select dependiente: cada canal elegido dispara la carga de sus medios.
  $effect(() => {
    asignacion.elegir(canalElegido)
  })

  // El <select> espera opciones { value, label }: convertimos los canales.
  const opcionesSelector = $derived(
    asignacion.opciones.map((canal) => ({ value: canal.id, label: canal.name }))
  )
</script>

<svelte:head>
  <title>Asignar medios · Editorial Admin</title>
</svelte:head>

<div class="pagina">
  <div class="cabecera">
    <h1>Asignar medios a un canal</h1>
  </div>

  {#if asignacion.cargandoInicio}
    <div class="centrado">
      <Spinner />
    </div>
  {:else if asignacion.error}
    <MensajeError mensaje={asignacion.error} onReintentar={asignacion.cargarInicio} />
  {:else if asignacion.opciones.length === 0}
    <Vacio mensaje="No hay canales todavía. Creá uno en la sección Canales para poder asignarle medios." />
  {:else}
    <div class="tarjeta eleccion">
      <Seleccion
        id="canal-asignacion"
        etiqueta="Canal"
        bind:valor={canalElegido}
        opciones={opcionesSelector}
        textoVacio="Elegí un canal…"
      />
    </div>

    {#if !canalElegido}
      <Vacio mensaje="Elegí un canal para ver y editar sus medios." />
    {:else if asignacion.cargandoAsignadas}
      <div class="centrado">
        <Spinner />
      </div>
    {:else if asignacion.errorOperacion}
      <!-- arrow sin argumentos: si no, el click del botón entra como "id" -->
      <MensajeError
        mensaje={asignacion.errorOperacion}
        onReintentar={() => asignacion.traerAsignadas()}
      />
    {:else}
      <TransferList
        tituloDisponibles="Medios disponibles"
        tituloAsignadas="Medios del canal"
        disponibles={asignacion.fuente}
        asignadas={asignacion.asignadas}
        guardando={asignacion.guardando}
        onGuardar={asignacion.guardar}
      />
      {#each Object.entries(asignacion.erroresValidacion) as [campo, mensajes] (campo)}
        {#each mensajes as m (m)}
          <p class="error-validacion">{m}</p>
        {/each}
      {/each}
    {/if}

    {#if asignacion.mensaje}
      <p class="aviso" role="status" transition:fade>{asignacion.mensaje}</p>
    {/if}
  {/if}
</div>

<style>
  .eleccion {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .eleccion :global(.campo) {
    max-width: 28rem;
  }

  .error-validacion {
    color: var(--color-peligro-hover);
    font-size: 0.875rem;
  }

  .aviso {
    background: #f0fdf4; /* success-50 */
    border: 1px solid #bbf7d0; /* success-200 */
    color: var(--color-exito-texto);
    border-radius: var(--radio-panel);
    padding: 0.75rem 1rem;
    font-size: 0.875rem;
  }
</style>
