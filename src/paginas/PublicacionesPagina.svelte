<script>
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

  const publicaciones = usePublicaciones()

  // Página protegida por el permiso 'editar-contenido' (spec etapa D). Si el
  // usuario no lo tiene, ni siquiera se intenta el fetch: se muestra el
  // panel de permisos con salida a /inicio. La lista de permisos viene del
  // login (usuario.permissions), así que el chequeo es local e instantáneo.
  const puedeVer = $derived(sesion.token && tienePermiso('editar-contenido'))

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

  // Filtrar o cambiar de página cierra el detalle: sus datos podrían quedar
  // viejos (la fila ya ni siquiera estaría en la página nueva).
  function filtrar(filtros) {
    publicaciones.cerrarDetalle()
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
    </div>

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
</style>
