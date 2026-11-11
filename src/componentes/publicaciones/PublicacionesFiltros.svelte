<script>
  // Filtros del listado de publicaciones (etapa D): texto libre, estado, tipo,
  // autor, TRES rangos de fechas (creado / programado / publicado), adjuntos,
  // orden y tamaño de página. El contrato con la página NO cambia: estado
  // local y callback onFiltrar(filtros) con TODOS los valores, la capa api
  // decide cuáles viajan al query string. Solo cambió la UI: el formulario
  // vive dentro del panel lateral PanelFiltros (botón gatillo + drawer
  // derecho), agrupado por secciones y con los rangos de fechas de a dos por
  // fila — es el formulario más largo del proyecto, el panel lo hace
  // scrolleable sin empujar la tabla.
  //
  // El Enter en un texto ahora dispara el submit nativo del <form> del panel,
  // que llama a aplicarFiltros y cierra: mismo camino que el botón Filtrar,
  // por eso los FiltroTexto/FiltroFecha ya no necesitan alFiltrar.
  //
  // channel_ids / media_ids NO están en el formulario: para ofrecerlos hace
  // falta un catálogo de canales que la spec no define para todos los roles
  // (RN-P01 deja el endpoint de canales autorizados "a confirmar"). La capa
  // api/ ya los soporta como arrays para cuando la etapa E lo defina.
  import PanelFiltros from '../comunes/PanelFiltros.svelte'
  import Seleccion from '../comunes/Seleccion.svelte'
  import FiltroTexto from '../comunes/FiltroTexto.svelte'
  import FiltroFecha from '../comunes/FiltroFecha.svelte'
  import { ESTADOS_POST, TIPOS_POST, TAMANIOS_PAGINA, CAMPOS_ORDEN, SENTIDOS } from './estados-publicacion.js'

  let { onFiltrar } = $props()

  let search = $state('')
  let status = $state('')
  let type = $state('')
  let authorName = $state('')
  let createdFrom = $state('')
  let createdTo = $state('')
  let scheduledFrom = $state('')
  let scheduledTo = $state('')
  let publishedFrom = $state('')
  let publishedTo = $state('')
  // has_attachments es booleano en la spec, pero el select necesita un valor
  // "sin filtro": '' viaja como ausente y 'true'/'false' como el booleano.
  let hasAttachments = $state('')
  let sortBy = $state('')
  let sortOrder = $state('')
  let perPage = $state('')

  function aplicarFiltros() {
    onFiltrar({
      search,
      status,
      type,
      author_name: authorName,
      created_from: createdFrom,
      created_to: createdTo,
      scheduled_from: scheduledFrom,
      scheduled_to: scheduledTo,
      published_from: publishedFrom,
      published_to: publishedTo,
      has_attachments: hasAttachments,
      sort_by: sortBy,
      sort_order: sortOrder,
      per_page: perPage
    })
  }

  function limpiar() {
    search = status = type = authorName = ''
    createdFrom = createdTo = ''
    scheduledFrom = scheduledTo = ''
    publishedFrom = publishedTo = ''
    hasAttachments = sortBy = sortOrder = perPage = ''
    onFiltrar({})
  }

  // El badge del gatillo cuenta cuántos criterios tienen valor (los rangos
  // cuentan por extremo: desde y hasta son dos criterios independientes).
  const activos = $derived(
    [
      search,
      status,
      type,
      authorName,
      createdFrom,
      createdTo,
      scheduledFrom,
      scheduledTo,
      publishedFrom,
      publishedTo,
      hasAttachments,
      sortBy,
      sortOrder,
      perPage
    ].filter((v) => v !== '').length
  )
</script>

<PanelFiltros {activos} onAplicar={aplicarFiltros} onLimpiar={limpiar}>
  <p class="seccion">Búsqueda</p>
  <FiltroTexto
    id="filtro-buscar"
    etiqueta="Buscar"
    bind:valor={search}
    placeholder="Título, contenido o autor…"
  />
  <FiltroTexto
    id="filtro-autor"
    etiqueta="Autor"
    bind:valor={authorName}
    placeholder="Nombre del autor…"
  />
  <p class="seccion">Estado</p>
  <Seleccion
    id="filtro-estado"
    etiqueta="Estado"
    bind:valor={status}
    opciones={ESTADOS_POST}
    textoVacio="Todos los estados"
  />
  <Seleccion id="filtro-tipo" etiqueta="Tipo" bind:valor={type} opciones={TIPOS_POST} textoVacio="Todos los tipos" />
  <Seleccion
    id="filtro-adjuntos"
    etiqueta="Adjuntos"
    bind:valor={hasAttachments}
    opciones={[
      { value: 'true', label: 'Solo con adjuntos' },
      { value: 'false', label: 'Solo sin adjuntos' }
    ]}
    textoVacio="Con o sin adjuntos"
  />
  <p class="seccion">Fechas</p>
  <div class="rango">
    <FiltroFecha id="filtro-creado-desde" etiqueta="Creado desde" bind:valor={createdFrom} />
    <FiltroFecha id="filtro-creado-hasta" etiqueta="Creado hasta" bind:valor={createdTo} />
  </div>
  <div class="rango">
    <FiltroFecha
      id="filtro-programado-desde"
      etiqueta="Programado desde"
      bind:valor={scheduledFrom}
    />
    <FiltroFecha
      id="filtro-programado-hasta"
      etiqueta="Programado hasta"
      bind:valor={scheduledTo}
    />
  </div>
  <div class="rango">
    <FiltroFecha
      id="filtro-publicado-desde"
      etiqueta="Publicado desde"
      bind:valor={publishedFrom}
    />
    <FiltroFecha
      id="filtro-publicado-hasta"
      etiqueta="Publicado hasta"
      bind:valor={publishedTo}
    />
  </div>
  <p class="seccion">Orden</p>
  <Seleccion
    id="filtro-orden"
    etiqueta="Ordenar por"
    bind:valor={sortBy}
    opciones={CAMPOS_ORDEN}
    textoVacio="Por defecto"
  />
  <Seleccion
    id="filtro-sentido"
    etiqueta="Sentido"
    bind:valor={sortOrder}
    opciones={SENTIDOS}
    textoVacio="Por defecto"
  />
  <Seleccion
    id="filtro-por-pagina"
    etiqueta="Por página"
    bind:valor={perPage}
    opciones={TAMANIOS_PAGINA}
    textoVacio="20 por página"
  />
</PanelFiltros>

<style>
  /* Rótulos de grupo del panel: la misma idea que el grupo "ADMINISTRACIÓN"
     de la sidebar (chico, negrita, mayúsculas, gris suave) */
  .seccion {
    font-size: 0.75rem;
    line-height: 1rem;
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: var(--color-texto-suave);
  }

  /* Dentro del panel angosto los pares desde/hasta comparten fila */
  .rango {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
  }
</style>
