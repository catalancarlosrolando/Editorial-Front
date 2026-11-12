<script>
  import { fade } from 'svelte/transition'
  import { navigate } from '../router.js'
  import { sesion, tieneRol } from '../sesion.svelte.js'
  import { navegacion } from '../navegacion.svelte.js'
  import { useModeracion } from '../hooks/useModeracion.svelte.js'
  import Spinner from '../componentes/comunes/Spinner.svelte'
  import MensajeError from '../componentes/comunes/MensajeError.svelte'
  import Vacio from '../componentes/comunes/Vacio.svelte'
  import Boton from '../componentes/comunes/Boton.svelte'
  import Paginador from '../componentes/comunes/Paginador.svelte'
  import Confirmar from '../componentes/comunes/Confirmar.svelte'
  import ModeracionListado from '../componentes/moderacion/ModeracionListado.svelte'

  // Página de moderación (etapa F): la cola de publicaciones en
  // pending_review, ordenada FIFO por el backend (la más vieja primero).
  // El acceso es POR ROL, no por permiso: el backend chequea
  // hasRole(['moderador','admin']) dentro de cada método (RN-P13), así que
  // el guard replica esa condición con tieneRol(). El listado NO lleva
  // filtros: es una cola de trabajo, se la consume de arriba hacia abajo.
  const moderacion = useModeracion()

  const puedeVer = $derived(sesion.token && tieneRol('moderador', 'admin'))

  // Estado de PANTALLA del Confirmar: { tipo: 'aprobar'|'rechazar', post }.
  let dialogo = $state(null)

  $effect(() => {
    if (!sesion.token) {
      navigate('/login')
      return
    }
    navegacion.seccion = '/moderacion'
    if (puedeVer) moderacion.cargar(1)
  })

  // El menú por fila es fijo en esta cola: Aprobar (comentario OPCIONAL —
  // si el post tiene scheduled_at queda scheduled, si no published) y
  // Rechazar (comentario OBLIGATORIO: vuelve a draft).
  function accionesDe(post) {
    return [
      {
        etiqueta: 'Aprobar',
        icono: 'check-circulo',
        alElegir: () => abrirDialogo(post, 'aprobar')
      },
      {
        etiqueta: 'Rechazar',
        icono: 'cruz-circulo',
        peligroso: true,
        alElegir: () => abrirDialogo(post, 'rechazar')
      }
    ]
  }

  function abrirDialogo(post, tipo) {
    dialogo = { tipo, post }
  }

  function cerrarDialogo() {
    dialogo = null
    moderacion.limpiarErroresDialogo()
  }

  // El Confirmar avisa con el comentario (vacío en Aprobar si no escribió
  // nada). Si el hook devuelve true, la cola ya se refrescó sola.
  async function confirmarDialogo(comentario) {
    const { tipo, post } = dialogo
    const listo = await moderacion.operar(post, tipo, comentario)
    if (listo) cerrarDialogo()
  }

  const textoDialogo = $derived.by(() => {
    if (!dialogo) return null
    const nombre = dialogo.post.name
    if (dialogo.tipo === 'aprobar') {
      const destino = dialogo.post.scheduled_at ? 'programada' : 'publicada'
      return {
        titulo: 'Aprobar publicación',
        mensaje: `«${nombre}» pasará a estado ${destino} (según su fecha programada). El comentario es opcional.`,
        textoConfirmar: 'Aprobar'
      }
    }
    return {
      titulo: 'Rechazar publicación',
      mensaje: `«${nombre}» volverá a borrador y el publicador verá tu comentario (obligatorio).`,
      textoConfirmar: 'Rechazar'
    }
  })

  // Cambiar de página cierra el detalle: la fila ya no estaría en la cola
  // visible y sus datos quedarían viejos.
  function cambiarPagina(pagina) {
    moderacion.cerrarDetalle()
    moderacion.cambiarPagina(pagina)
  }

  // Reintentar el detalle fallido: reabre con el MISMO resumen (nuevo
  // pedido, mismos estados de carga/error del hook).
  function reintentarDetalle() {
    moderacion.abrirDetalle(moderacion.detalle.resumen)
  }
</script>

<svelte:head>
  <title>Moderación · Editorial Admin</title>
</svelte:head>

<div class="pagina">
  {#if !sesion.token}
    <!-- sin sesión: el $effect ya redirigió al login -->
  {:else if !puedeVer}
    <div class="cabecera">
      <h1>Moderación</h1>
    </div>
    <div class="panel-error" role="alert">
      <p>⚠️ Solo moderadores y administradores pueden acceder a la moderación.</p>
      <Boton variante="neutra" onclick={() => navigate('/inicio')}>Ir al inicio</Boton>
    </div>
  {:else}
    <div class="cabecera">
      <h1>Moderación</h1>
      <span class="contador">{moderacion.total} pendiente(s) de revisión</span>
    </div>

    {#if moderacion.mensaje}
      <p class="aviso" role="status" transition:fade>{moderacion.mensaje}</p>
    {/if}

    {#if moderacion.cargando}
      <div class="centrado">
        <Spinner />
      </div>
    {:else if moderacion.error}
      <MensajeError mensaje={moderacion.error} onReintentar={moderacion.reintentar} />
    {:else if moderacion.items.length === 0}
      <Vacio mensaje="No hay publicaciones esperando revisión. ¡La cola está despejada!" />
    {:else}
      <p class="orden">
        Orden FIFO: la más antigua primero. Apruébala (con o sin comentario) o recházala con un comentario para el publicador.
      </p>
      <ModeracionListado
        items={moderacion.items}
        detalle={moderacion.detalle}
        cargandoDetalle={moderacion.cargandoDetalle}
        errorDetalle={moderacion.errorDetalle}
        onVerDetalle={moderacion.abrirDetalle}
        onCerrarDetalle={moderacion.cerrarDetalle}
        onReintentarDetalle={reintentarDetalle}
        acciones={accionesDe}
        ocupado={moderacion.idOperando !== null}
      />
      <Paginador
        pagina={moderacion.paginaActual}
        ultimaPagina={moderacion.ultimaPagina}
        total={moderacion.total}
        cargando={moderacion.cargando}
        onCambiar={cambiarPagina}
      />
    {/if}
  {/if}
</div>

{#if dialogo}
  {#key dialogo.tipo + ':' + dialogo.post.id}
    <Confirmar
      titulo={textoDialogo.titulo}
      mensaje={textoDialogo.mensaje}
      textoConfirmar={textoDialogo.textoConfirmar}
      peligroso={dialogo.tipo === 'rechazar'}
      motivoObligatorio={dialogo.tipo === 'rechazar'}
      ocupado={moderacion.idOperando === dialogo.post.id}
      errores={moderacion.erroresDialogo}
      onConfirmar={confirmarDialogo}
      onCancelar={cerrarDialogo}
    />
  {/key}
{/if}

<style>
  /* Mismo panel de permisos que PublicacionesPagina (acá por rol) */
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

  .cabecera {
    display: flex;
    align-items: baseline;
    gap: 0.75rem;
    flex-wrap: wrap;
  }

  .contador {
    font-size: 0.8125rem;
    color: var(--color-texto-medio);
  }

  .orden {
    font-size: 0.8125rem;
    color: var(--color-texto-suave);
    margin-bottom: 0.5rem;
  }

  /* Aviso de éxito tras aprobar/rechazar, igual que en Publicaciones. */
  .aviso {
    background: #f0fdf4; /* success-50 */
    border: 1px solid #bbf7d0; /* success-200 */
    color: var(--color-exito-texto);
    border-radius: var(--radio-panel);
    padding: 0.75rem 1rem;
    font-size: 0.875rem;
  }
</style>
