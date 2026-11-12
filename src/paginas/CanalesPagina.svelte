<script>
  import { navigate } from "../router.js";
  import { sesion } from "../sesion.svelte.js";
  import { navegacion } from "../navegacion.svelte.js";
  import { useCanales } from "../hooks/useCanales.svelte.js";
  import Boton from "../componentes/comunes/Boton.svelte";
  import Spinner from "../componentes/comunes/Spinner.svelte";
  import MensajeError from "../componentes/comunes/MensajeError.svelte";
  import Vacio from "../componentes/comunes/Vacio.svelte";
  import CanalesListado from "../componentes/canales/CanalesListado.svelte";
  import CanalForm from "../componentes/canales/CanalForm.svelte";

  const canales = useCanales();

  // Estado de la pantalla: el formulario está cerrado, o abierto para
  // crear (editando = null) o para editar (editando = canal elegido).
  let formularioVisible = $state(false);
  let editando = $state(null);

  $effect(() => {
    if (!sesion.token) {
      navigate("/login");
      return;
    }
    navegacion.seccion = "/canales";
    canales.cargar();
    canales.cargarTipos();
  });

  function abrirParaCrear() {
    editando = null;
    formularioVisible = true;
  }

  function abrirParaEditar(canal) {
    editando = canal;
    formularioVisible = true;
  }

  function cerrarFormulario() {
    formularioVisible = false;
    editando = null;
    canales.limpiarErrores();
  }

  // El formulario avisa "guardé" con la callback onGuardar; la página decide
  // si era alta o edición según `editando`.
  async function guardar(datos) {
    const guardado = editando
      ? await canales.editar(editando.id, datos)
      : await canales.agregar(datos);
    if (guardado) cerrarFormulario();
  }

  function reintentar() {
    canales.cargar();
  }
</script>

<svelte:head>
  <title>Canales · Editorial Admin</title>
</svelte:head>

<div class="pagina">
  <div class="cabecera">
    <h1>Canales</h1>
    <Boton onclick={abrirParaCrear} deshabilitado={formularioVisible}
      >+ Nuevo canal</Boton
    >
  </div>

  {#if formularioVisible}
    <!-- {#key} recrea el formulario al cambiar de canal: así $state arranca
         limpio con los datos del canal elegido (o vacío para crear). -->
    {#key editando?.id ?? "nuevo"}
      <CanalForm
        inicial={editando}
        tipos={canales.tipos}
        errores={canales.erroresValidacion}
        guardando={canales.guardando}
        onGuardar={guardar}
        onCancelar={cerrarFormulario}
      />
    {/key}
  {/if}

  {#if canales.cargando}
    <div class="centrado">
      <Spinner />
    </div>
  {:else if canales.error}
    <MensajeError mensaje={canales.error} onReintentar={reintentar} />
  {:else if canales.items.length === 0}
    <Vacio
      mensaje="Todavía no hay canales. Creá el primero con «Nuevo canal»."
    />
  {:else}
    <CanalesListado
      items={canales.items}
      eliminandoId={canales.eliminandoId}
      onEditar={abrirParaEditar}
      onQuitar={canales.quitar}
    />
  {/if}
</div>
