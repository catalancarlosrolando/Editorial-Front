<script>
  import { fade } from 'svelte/transition'
  import { navigate } from '../router.js'
  import { sesion, tienePermiso, tieneRol } from '../sesion.svelte.js'
  import { navegacion } from '../navegacion.svelte.js'
  import { usePublicaciones } from '../hooks/usePublicaciones.svelte.js'
  import Spinner from '../componentes/comunes/Spinner.svelte'
  import MensajeError from '../componentes/comunes/MensajeError.svelte'
  import Vacio from '../componentes/comunes/Vacio.svelte'
  import Boton from '../componentes/comunes/Boton.svelte'
  import Paginador from '../componentes/comunes/Paginador.svelte'
  import Confirmar from '../componentes/comunes/Confirmar.svelte'
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

  // Estado de PANTALLA del Confirmar (etapa F): { tipo, post } o null.
  // 'archivar' → confirm seco (RN-P10); 'detener' → motivo obligatorio
  // (RN-P11); 'eliminar' → motivo obligatorio (RN-P08).
  let dialogo = $state(null)

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

  // ── Etapa F: menú de acciones por fila ──
  // El menú de cada fila se decide acá (la tabla no piensa) según las
  // restricciones del backend, verificadas contra el backend real:
  //   Editar / Enviar a moderación → SOLO el dueño, y solo en draft (el
  //     backend responde 403 si no es dueño, RN-P03 para editar).
  //   Revertir a borrador → dueño o moderador/admin, desde pending_review,
  //     scheduled o published.
  //   Archivar → dueño o moderador/admin, desde scheduled o published
  //     (RN-P10: pide {confirm:true} → diálogo Confirmar sin motivo).
  //   Desarchivar → SOLO moderador/admin (RN-P12), desde archived.
  //   Detener difusión → dueño o moderador/admin, sobre published
  //     (RN-P11: pide confirm + reason → Confirmar con motivo obligatorio).
  //   Eliminar → SOLO el dueño, y solo estados sin publicar (RN-P09:
  //     draft / pending_review / approved_by_moderator / scheduled; el
  //     backend pide reason → Confirmar con motivo obligatorio).
  function accionesDe(post) {
    const items = []
    const esDuenio = post.user?.id === sesion.usuario?.id
    const esPrivilegiado = tieneRol('moderador', 'admin')

    if (esDuenio && post.status === 'draft') {
      items.push({ etiqueta: 'Editar', icono: 'editar', alElegir: () => abrirParaEditar(post) })
      items.push({
        etiqueta: 'Enviar a moderación',
        icono: 'enviar',
        alElegir: () => publicaciones.transicionar(post, 'submit')
      })
    }
    if (
      (esDuenio || esPrivilegiado) &&
      ['pending_review', 'scheduled', 'published'].includes(post.status)
    ) {
      items.push({
        etiqueta: 'Revertir a borrador',
        icono: 'restaurar',
        alElegir: () => publicaciones.transicionar(post, 'revert-to-draft')
      })
    }
    if ((esDuenio || esPrivilegiado) && ['scheduled', 'published'].includes(post.status)) {
      items.push({ etiqueta: 'Archivar', icono: 'archivar', alElegir: () => abrirDialogo(post, 'archivar') })
    }
    if (esPrivilegiado && post.status === 'archived') {
      items.push({
        etiqueta: 'Desarchivar',
        icono: 'restaurar',
        alElegir: () => publicaciones.transicionar(post, 'unarchive')
      })
    }
    if ((esDuenio || esPrivilegiado) && post.status === 'published') {
      items.push({
        etiqueta: 'Detener difusión',
        icono: 'detener',
        peligroso: true,
        alElegir: () => abrirDialogo(post, 'detener')
      })
    }
    if (
      esDuenio &&
      ['draft', 'pending_review', 'approved_by_moderator', 'scheduled'].includes(post.status)
    ) {
      items.push({
        etiqueta: 'Eliminar',
        icono: 'eliminar',
        peligroso: true,
        alElegir: () => abrirDialogo(post, 'eliminar')
      })
    }
    return items
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

  // El formulario avisa "guardé" con los datos (y los adjuntos nuevos,
  // etapa F); la página decide si era alta o edición. Si el hook devuelve
  // true, el listado ya se recargó solo.
  async function guardar(datos, adjuntos) {
    const guardado = await publicaciones.guardar(editando, datos, adjuntos)
    if (guardado) cerrarFormulario()
  }

  // El cascada: el formulario reporta la selección nueva de canales y el
  // hook recarga el catálogo de medios (con guardia anti-carrera).
  function canalesCambian(ids) {
    publicaciones.cargarMedios(ids)
  }

  // ── Etapa F: diálogos de confirmación ──
  function abrirDialogo(post, tipo) {
    dialogo = { tipo, post }
  }

  function cerrarDialogo() {
    dialogo = null
    publicaciones.limpiarErroresDialogo()
  }

  // El Confirmar avisa con el motivo ('' en el confirm seco del archivado).
  // Si el hook devuelve true ya recargó el listado: se cierra el diálogo; si
  // no, queda abierto mostrando erroresDialogo bajo el campo (o el estado).
  async function confirmarDialogo(motivo) {
    const { tipo, post } = dialogo
    let listo = false
    if (tipo === 'archivar') {
      listo = await publicaciones.transicionar(post, 'archive', { confirm: true })
    } else if (tipo === 'detener') {
      listo = await publicaciones.transicionar(post, 'stop', { confirm: true, reason: motivo })
    } else if (tipo === 'eliminar') {
      listo = await publicaciones.eliminar(post, motivo)
    }
    if (listo) cerrarDialogo()
  }

  // Textos del Confirmar según el tipo (la vista los lee del estado).
  const textoDialogo = $derived.by(() => {
    if (!dialogo) return null
    const nombre = dialogo.post.name
    if (dialogo.tipo === 'archivar') {
      return {
        titulo: 'Archivar publicación',
        mensaje: `«${nombre}» pasará a estado archivada y saldrá del listado por defecto (RN-P10).`,
        textoConfirmar: 'Archivar'
      }
    }
    if (dialogo.tipo === 'detener') {
      return {
        titulo: 'Detener difusión',
        mensaje: `«${nombre}» (publicada) volverá a borrador. Se registra un motivo (RN-P11).`,
        textoConfirmar: 'Detener'
      }
    }
    return {
      titulo: 'Eliminar publicación',
      mensaje: `Se dará de baja (borrado lógico) «${nombre}». El motivo es obligatorio (RN-P08).`,
      textoConfirmar: 'Eliminar'
    }
  })

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

    {#if publicaciones.errorOperacion}
      <p class="aviso-error" role="alert" transition:fade>{publicaciones.errorOperacion}</p>
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
          adjuntosExistentes={editando?.attachments ?? []}
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
        acciones={accionesDe}
        ocupado={publicaciones.idOperando !== null}
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

{#if dialogo}
  <!-- {#key} reinicia el motivo al abrir otro diálogo, como en Usuarios -->
  {#key dialogo.tipo + ':' + dialogo.post.id}
    <Confirmar
      titulo={textoDialogo.titulo}
      mensaje={textoDialogo.mensaje}
      textoConfirmar={textoDialogo.textoConfirmar}
      peligroso={dialogo.tipo !== 'archivar'}
      conMotivo={dialogo.tipo !== 'archivar'}
      motivoObligatorio={dialogo.tipo !== 'archivar'}
      ocupado={publicaciones.idOperando === dialogo.post.id}
      errores={publicaciones.erroresDialogo}
      onConfirmar={confirmarDialogo}
      onCancelar={cerrarDialogo}
    />
  {/key}
{/if}

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

  /* Aviso de error de una transición fuera de diálogo (submit, revert,
     unarchive, archive): rojo, mismo cuerpo que el aviso de éxito. */
  .aviso-error {
    background: #fef2f2; /* danger-50 */
    border: 1px solid #fecaca; /* danger-200 */
    color: #b91c1c; /* danger-700 */
    border-radius: var(--radio-panel);
    padding: 0.75rem 1rem;
    font-size: 0.875rem;
  }
</style>
