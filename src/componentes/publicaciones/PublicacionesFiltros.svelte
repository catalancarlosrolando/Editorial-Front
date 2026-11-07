<script>
  // Filtros del listado de publicaciones (etapa D): el formulario más largo
  // del proyecto — texto libre, estado, tipo, autor, TRES rangos de fechas
  // (creado / programado / publicado), adjuntos, orden y tamaño de página.
  // Mismo contrato que UsuariosFiltros: estado local y callback
  // onFiltrar(filtros) con TODOS los valores, la capa api decide cuáles viajan
  // al query string. Enter en un filtro dispara lo mismo que el botón.
  //
  // channel_ids / media_ids NO están en el formulario: para ofrecerlos hace
  // falta un catálogo de canales que la spec no define para todos los roles
  // (RN-P01 deja el endpoint de canales autorizados "a confirmar"). La capa
  // api/ ya los soporta como arrays para cuando la etapa E lo defina.
  import Boton from '../comunes/Boton.svelte'
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

  function aplicar(e) {
    e.preventDefault()
    aplicarFiltros()
  }

  function limpiar() {
    search = status = type = authorName = ''
    createdFrom = createdTo = ''
    scheduledFrom = scheduledTo = ''
    publishedFrom = publishedTo = ''
    hasAttachments = sortBy = sortOrder = perPage = ''
    onFiltrar({})
  }
</script>

<form class="tarjeta filtros" onsubmit={aplicar}>
  <FiltroTexto
    id="filtro-buscar"
    etiqueta="Buscar"
    bind:valor={search}
    placeholder="Título, contenido o autor…"
    alFiltrar={aplicarFiltros}
  />
  <Seleccion
    id="filtro-estado"
    etiqueta="Estado"
    bind:valor={status}
    opciones={ESTADOS_POST}
    textoVacio="Todos los estados"
  />
  <Seleccion id="filtro-tipo" etiqueta="Tipo" bind:valor={type} opciones={TIPOS_POST} textoVacio="Todos los tipos" />
  <FiltroTexto
    id="filtro-autor"
    etiqueta="Autor"
    bind:valor={authorName}
    placeholder="Nombre del autor…"
    alFiltrar={aplicarFiltros}
  />
  <FiltroFecha id="filtro-creado-desde" etiqueta="Creado desde" bind:valor={createdFrom} alFiltrar={aplicarFiltros} />
  <FiltroFecha id="filtro-creado-hasta" etiqueta="Creado hasta" bind:valor={createdTo} alFiltrar={aplicarFiltros} />
  <FiltroFecha
    id="filtro-programado-desde"
    etiqueta="Programado desde"
    bind:valor={scheduledFrom}
    alFiltrar={aplicarFiltros}
  />
  <FiltroFecha
    id="filtro-programado-hasta"
    etiqueta="Programado hasta"
    bind:valor={scheduledTo}
    alFiltrar={aplicarFiltros}
  />
  <FiltroFecha
    id="filtro-publicado-desde"
    etiqueta="Publicado desde"
    bind:valor={publishedFrom}
    alFiltrar={aplicarFiltros}
  />
  <FiltroFecha
    id="filtro-publicado-hasta"
    etiqueta="Publicado hasta"
    bind:valor={publishedTo}
    alFiltrar={aplicarFiltros}
  />
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
  <div class="acciones">
    <Boton tipo="submit">Filtrar</Boton>
    <Boton variante="neutra" onclick={limpiar}>Limpiar</Boton>
  </div>
</form>

<style>
  .filtros {
    display: flex;
    gap: 1rem;
    align-items: end;
    flex-wrap: wrap;
  }

  .filtros :global(.campo) {
    flex: 1;
    min-width: 11rem;
  }

  .acciones {
    display: flex;
    gap: 0.5rem;
  }
</style>
