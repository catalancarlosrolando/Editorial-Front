<script>
  import { fade } from 'svelte/transition'
  import { navigate } from '../router.js'
  import { sesion, tienePermiso } from '../sesion.svelte.js'
  import { navegacion } from '../navegacion.svelte.js'
  import { usePublicaciones } from '../hooks/usePublicaciones.svelte.js'
  import Spinner from '../componentes/comunes/Spinner.svelte'
  import MensajeError from '../componentes/comunes/MensajeError.svelte'
  import Vacio from '../componentes/comunes/Vacio.svelte'
  import Boton from '../componentes/comunes/Boton.svelte'
  import Paginador from '../componentes/comunes/Paginador.svelte'
  import PublicacionesFiltros from '../componentes/publicaciones/PublicacionesFiltros.svelte'
  import PublicacionesListado from '../componentes/publicaciones/PublicacionesListado.svelte'
  import PublicacionForm from '../componentes/publicaciones/PublicacionForm.svelte'
  import { TIPOS_POST } from '../componentes/publicaciones/estados-publicacion.js'

  const publicaciones = usePublicaciones()

  // Página protegida por el permiso 'editar-contenido' (spec etapa D). Si el
  // usuario no lo tiene, ni siquiera se intenta el fetch: se muestra el
  // panel de permisos con salida a /inicio. La lista de permisos viene del
  // login (usuario.permissions), así que el chequeo es local e instantáneo.
  const puedeVer = $derived(sesion.token && tienePermiso('editar-contenido'))

  // Estado de PANTALLA del formulario (etapa E): cerrado, o abierto para
  // crear (editando = null) o para editar (editando = la fila elegida). Los
  // datos del formulario (canales, medios, guardado) viven en el hook.
  let formularioVisible = $state(false)
  let editando = $state(null)

  $effect(() => {
    if (!sesion.token) {
      navigate('/login')
      return
    }
    navegacion.seccion = '/publicaciones'
    if (puedeVer) {
      // Carga inicial SIN filtros: el hook recibe todo por parámetro para no
      // dejar que este efecto rastree (y re-dispare) su estado interno.
      publicaciones.cargar(1, {})
    }
  })

  // RN-P03 (cliente): solo se ofrece Editar a la fila propia en estado
  // draft. El backend lo vuelve a chequear (403 si no es dueño, 422 si no
  // está en draft); acá la decisión es de UI, y baja al menú de la fila.
  function esEditable(post) {
    return post.status === 'draft' && post.user?.id === sesion.usuario?.id
  }

  // Abrir el formulario carga los datos del cascada: los canales autorizados
  // (RN-P01) y, en edición, los medios de los canales de ese post. En crear
  // el cascada arranca sin canales elegidos → catálogo de medios vacío.
  function abrirParaCrear() {
    editando = null
    formularioVisible = true
    publicaciones.quitarMensaje()
    publicaciones.limpiarErroresFormulario()
    publicaciones.cargarCanales()
    publicaciones.cargarMedios([])
  }

  function abrirParaEditar(post) {
    editando = post
    formularioVisible = true
    publicaciones.quitarMensaje()
    publicaciones.limpiarErroresFormulario()
    publicaciones.cargarCanales()
    publicaciones.cargarMedios((post.channels ?? []).map((c) => c.id))
  }

  function cerrarFormulario() {
    formularioVisible = false
    editando = null
    publicaciones.limpiarErroresFormulario()
  }

  // El formulario avisa "guardé" con los datos; la página decide si era alta
  // o edición. Si el hook devuelve true, el listado ya se recargó solo.
  async function guardar(datos) {
    const guardado = await publicaciones.guardar(editando, datos)
    if (guardado) cerrarFormulario()
  }

  // El cascada: el formulario reporta la selección nueva de canales y el
  // hook recarga el catálogo de medios (con guardia anti-carrera).
  function canalesCambian(ids) {
    publicaciones.cargarMedios(ids)
  }

  // Filtrar o cambiar de página cierra el detalle: sus datos podrían quedar
  // viejos (la fila ya ni siquiera estaría en la página nueva).
  function filtrar(filtros) {
    publicaciones.cerrarDetalle()
    publicaciones.quitarMensaje()
    publicaciones.aplicarFiltros(filtros)
  }

  function cambiarPagina(pagina) {
    publicaciones.cerrarDetalle()
    publicaciones.cambiarPagina(pagina)
  }
</script>

<svelte:head>
  <title>Publicaciones · Editorial Admin</title>
</svelte:head>

<div class="pagina">
  {#if !sesion.token}
    <!-- sin sesión: el $effect ya redirigió al login -->
  {:else if !puedeVer}
    <div class="cabecera">
      <h1>Publicaciones</h1>
    </div>
    <div class="panel-error" role="alert">
      <p>⚠️ No tenés permiso para ver las publicaciones (se requiere el permiso «editar-contenido»).</p>
      <Boton variante="neutra" onclick={() => navigate('/inicio')}>Ir al inicio</Boton>
    </div>
  {:else}
    <div class="cabecera">
      <h1>Publicaciones</h1>
      <Boton onclick={abrirParaCrear} deshabilitado={formularioVisible}>+ Nueva publicación</Boton>
    </div>

    {#if publicaciones.mensaje}
      <p class="aviso" role="status" transition:fade>{publicaciones.mensaje}</p>
    {/if}

    {#if formularioVisible}
      <!-- {#key} recrea el formulario al pasar de crear a editar (o entre
           posts): así el $state local arranca con los datos del post
           elegido, como en CanalesPagina. -->
      {#key editando?.id ?? 'nueva'}
        <PublicacionForm
          inicial={editando}
          tipos={TIPOS_POST}
          canales={publicaciones.canalesUsuario}
          medios={publicaciones.mediasDisponibles}
          cargandoCanales={publicaciones.cargandoCanales}
          cargandoMedios={publicaciones.cargandoMedios}
          errorCanales={publicaciones.errorCanales}
          errorMedios={publicaciones.errorMedios}
          errores={publicaciones.erroresFormulario}
          error={publicaciones.errorFormulario}
          guardando={publicaciones.guardando}
          onGuardar={guardar}
          onCancelar={cerrarFormulario}
          onCanalesCambian={canalesCambian}
        />
      {/key}
    {/if}

    <PublicacionesFiltros onFiltrar={filtrar} />

    {#if publicaciones.cargando}
      <div class="centrado">
        <Spinner />
      </div>
    {:else if publicaciones.error}
      <MensajeError mensaje={publicaciones.error} onReintentar={publicaciones.reintentar} />
    {:else if publicaciones.items.length === 0}
      <Vacio mensaje="No hay publicaciones que coincidan con los filtros aplicados." />
    {:else}
      <PublicacionesListado
        items={publicaciones.items}
        detalle={publicaciones.detalle}
        cargandoDetalle={publicaciones.cargandoDetalle}
        errorDetalle={publicaciones.errorDetalle}
        onAlternar={publicaciones.alternarDetalle}
        onEditar={abrirParaEditar}
        esEditable={esEditable}
      />
      <Paginador
        pagina={publicaciones.paginaActual}
        ultimaPagina={publicaciones.ultimaPagina}
        total={publicaciones.total}
        cargando={publicaciones.cargando}
        onCambiar={cambiarPagina}
      />
    {/if}
  {/if}
</div>

<style>
  /* Mismo panel de permisos que MensajeError, pero con salida a /inicio
     en vez de Reintentar (no sirve reintentar sin permiso). */
  .panel-error {
    background: #fef2f2; /* danger-50 */
    border: 1px solid #fecaca; /* danger-200 */
    border-radius: var(--radio-panel);
    padding: 1rem 1.25rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    color: #b91c1c; /* danger-700 */
    font-size: 0.875rem;
  }

  /* Aviso de éxito tras crear/editar, igual que en Asignar y Usuarios. */
  .aviso {
    background: #f0fdf4; /* success-50 */
    border: 1px solid #bbf7d0; /* success-200 */
    color: var(--color-exito-texto);
    border-radius: var(--radio-panel);
    padding: 0.75rem 1rem;
    font-size: 0.875rem;
  }
</style>
