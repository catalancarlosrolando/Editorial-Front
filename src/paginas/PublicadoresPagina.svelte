<script>
  import { fade } from 'svelte/transition'
  import { navigate } from '../router.js'
  import { sesion } from '../sesion.svelte.js'
  import { navegacion } from '../navegacion.svelte.js'
  import { useAsignaciones } from '../hooks/useAsignaciones.svelte.js'
  import { listar as listarCanales } from '../api/canales.api.js'
  import {
    listarPublishersTodos,
    canalesDeUsuario,
    asignarCanalesAUsuario,
    revocarCanalesDeUsuario
  } from '../api/asignaciones.api.js'
  import Seleccion from '../componentes/comunes/Seleccion.svelte'
  import Spinner from '../componentes/comunes/Spinner.svelte'
  import MensajeError from '../componentes/comunes/MensajeError.svelte'
  import Vacio from '../componentes/comunes/Vacio.svelte'
  import TransferList from '../componentes/comunes/TransferList.svelte'

  // Tercera página del MISMO hook factory de la etapa A (misma composición que
  // /asignar-medios y /asignar-canales): acá el "dueño" es un publicador y lo
  // que se le asigna son canales. Solo cambian las funciones de la capa api:
  //   cargarSelector → publishers (llega paginado a 7; se recorren las páginas)
  //   cargarFuente   → todos los canales (columna "disponibles")
  //   cargarAsignadas → canales de ese publicador ({ user, channels })
  //   asociar/desasociar → POST/DELETE con { channel_ids }
  const asignacion = useAsignaciones({
    cargarSelector: listarPublishersTodos,
    cargarFuente: listarCanales,
    cargarAsignadas: canalesDeUsuario,
    asociar: asignarCanalesAUsuario,
    desasociar: revocarCanalesDeUsuario
  })

  // El <select> escribe acá con bind:value; el $effect de abajo reacciona.
  let publicadorElegido = $state('')

  $effect(() => {
    if (!sesion.token) {
      navigate('/login')
      return
    }
    navegacion.seccion = '/publicadores'
    asignacion.cargarInicio()
  })

  // Select dependiente: cada publicador elegido dispara la carga de sus canales.
  $effect(() => {
    asignacion.elegir(publicadorElegido)
  })

  // El <select> espera opciones { value, label }; mostramos nombre + email para
  // distinguir publicadores que se llaman igual.
  const opcionesSelector = $derived(
    asignacion.opciones.map((publicador) => ({
      value: publicador.id,
      label: `${publicador.name} (${publicador.email})`
    }))
  )
</script>

<svelte:head>
  <title>Publicadores · Editorial Admin</title>
</svelte:head>

<div class="pagina">
  <div class="cabecera">
    <h1>Canales de un publicador</h1>
  </div>

  {#if asignacion.cargandoInicio}
    <div class="centrado">
      <Spinner />
    </div>
  {:else if asignacion.error}
    <MensajeError mensaje={asignacion.error} onReintentar={asignacion.cargarInicio} />
  {:else if asignacion.opciones.length === 0}
    <Vacio mensaje="No hay publicadores todavía. Recién se listan aquí los usuarios con rol publicador." />
  {:else}
    <div class="tarjeta eleccion">
      <Seleccion
        id="publicador-asignacion"
        etiqueta="Publicador"
        bind:valor={publicadorElegido}
        opciones={opcionesSelector}
        textoVacio="Elegí un publicador…"
      />
    </div>

    {#if !publicadorElegido}
      <Vacio mensaje="Elegí un publicador para ver y editar sus canales." />
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
        tituloDisponibles="Canales disponibles"
        tituloAsignadas="Canales del publicador"
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
