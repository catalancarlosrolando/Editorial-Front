<script>
  import { fade } from "svelte/transition";
  import { navigate } from "../router.js";
  import { sesion } from "../sesion.svelte.js";
  import { navegacion } from "../navegacion.svelte.js";
  import { useAsignaciones } from "../hooks/useAsignaciones.svelte.js";
  import { listarTodos as listarDispositivos } from "../api/dispositivos.api.js";
  import { listar as listarCanales } from "../api/canales.api.js";
  import {
    canalesDeDispositivo,
    asignarCanales,
    desasignarCanales,
  } from "../api/asignaciones.api.js";
  import Seleccion from "../componentes/comunes/Seleccion.svelte";
  import Spinner from "../componentes/comunes/Spinner.svelte";
  import MensajeError from "../componentes/comunes/MensajeError.svelte";
  import Vacio from "../componentes/comunes/Vacio.svelte";
  import TransferList from "../componentes/comunes/TransferList.svelte";

  // El mismo hook que usa /asignar-medios; acá se elige un dispositivo y
  // sobre él se agregan o quitan canales.
  const asignacion = useAsignaciones({
    cargarSelector: listarDispositivos,
    cargarFuente: listarCanales,
    cargarAsignadas: canalesDeDispositivo,
    asociar: asignarCanales,
    desasociar: desasignarCanales,
  });

  // El <select> escribe acá con bind:value; el $effect de abajo reacciona.
  let dispositivoElegido = $state("");

  $effect(() => {
    if (!sesion.token) {
      navigate("/login");
      return;
    }
    navegacion.seccion = "/asignar-canales";
    asignacion.cargarInicio();
  });

  // Select dependiente: cada dispositivo elegido dispara la carga de sus canales.
  $effect(() => {
    asignacion.elegir(dispositivoElegido);
  });

  // El <select> espera opciones { value, label }: el nombre visible de un
  // dispositivo es su uid (el backend no le da nombre, RN-D01).
  const opcionesSelector = $derived(
    asignacion.opciones.map((dispositivo) => ({
      value: dispositivo.id,
      label: dispositivo.uid,
    })),
  );
</script>

<svelte:head>
  <title>Asignar canales · Editorial Admin</title>
</svelte:head>

<div class="pagina">
  <div class="cabecera">
    <h1>Asignar canales a un dispositivo</h1>
  </div>

  {#if asignacion.cargandoInicio}
    <div class="centrado">
      <Spinner />
    </div>
  {:else if asignacion.error}
    <MensajeError
      mensaje={asignacion.error}
      onReintentar={asignacion.cargarInicio}
    />
  {:else if asignacion.opciones.length === 0}
    <Vacio
      mensaje="No hay dispositivos todavía. Creá uno en la sección Dispositivos para poder asignarle canales."
    />
  {:else}
    <div class="tarjeta eleccion">
      <Seleccion
        id="dispositivo-asignacion"
        etiqueta="Dispositivo"
        bind:valor={dispositivoElegido}
        opciones={opcionesSelector}
        textoVacio="Elegí un dispositivo…"
      />
    </div>

    {#if !dispositivoElegido}
      <Vacio mensaje="Elegí un dispositivo para ver y editar sus canales." />
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
        tituloAsignadas="Canales del dispositivo"
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
