<script>
  // Filtros del listado de usuarios (etapa C): rol, estado, textos, rangos de
  // fechas y orden. El contrato con la página NO cambia: estado local y
  // callback onFiltrar(filtros) — con TODOS los valores, la capa api decide
  // cuáles van al query string. Solo cambió la UI: el formulario vive dentro
  // del panel lateral PanelFiltros (botón gatillo + drawer derecho), agrupado
  // por secciones y con los rangos de fechas de a dos por fila.
  //
  // El Enter en un texto ahora dispara el submit nativo del <form> del panel,
  // que llama a aplicarFiltros y cierra: mismo camino que el botón Filtrar,
  // por eso los FiltroTexto/FiltroFecha ya no necesitan alFiltrar.
  import PanelFiltros from '../comunes/PanelFiltros.svelte'
  import Seleccion from '../comunes/Seleccion.svelte'
  import FiltroTexto from '../comunes/FiltroTexto.svelte'
  import FiltroFecha from '../comunes/FiltroFecha.svelte'

  let { onFiltrar } = $props()

  // Valores de los enums según la spec del backend. No hay endpoint de
  // catálogo para estos (a diferencia de los tipos de canal/medio), así que
  // son los únicos valores fijos del proyecto. El listado excluye admins
  // (RN-U06), por eso el filtro de rol no los ofrece.
  const ROLES = [
    { value: 'publicador', label: 'Publicador' },
    { value: 'moderador', label: 'Moderador' },
    { value: 'invitado', label: 'Invitado' }
  ]
  const ESTADOS = [
    { value: 'registered', label: 'Registrado' },
    { value: 'verified', label: 'Verificado' },
    { value: 'approved', label: 'Aprobado' },
    { value: 'disabled', label: 'Deshabilitado' },
    { value: 'deleted', label: 'Eliminado' }
  ]
  const ORDENES = [
    { value: 'created_at', label: 'Fecha de registro' },
    { value: 'name', label: 'Nombre' },
    { value: 'email', label: 'Email' },
    { value: 'last_access_at', label: 'Último acceso' }
  ]
  const SENTIDOS = [
    { value: 'asc', label: 'Ascendente' },
    { value: 'desc', label: 'Descendente' }
  ]

  let role = $state('')
  let status = $state('')
  let name = $state('')
  let email = $state('')
  let dni = $state('')
  let registeredFrom = $state('')
  let registeredTo = $state('')
  let lastAccessFrom = $state('')
  let lastAccessTo = $state('')
  let sortBy = $state('')
  let sortOrder = $state('')

  function aplicarFiltros() {
    onFiltrar({
      role,
      status,
      name,
      email,
      dni,
      registered_from: registeredFrom,
      registered_to: registeredTo,
      last_access_from: lastAccessFrom,
      last_access_to: lastAccessTo,
      sort_by: sortBy,
      sort_order: sortOrder
    })
  }

  function limpiar() {
    role = status = name = email = dni = ''
    registeredFrom = registeredTo = lastAccessFrom = lastAccessTo = ''
    sortBy = sortOrder = ''
    onFiltrar({})
  }

  // El badge del gatillo cuenta cuántos criterios tienen valor (los rangos
  // cuentan por extremo: desde y hasta son dos criterios independientes).
  const activos = $derived(
    [
      role,
      status,
      name,
      email,
      dni,
      registeredFrom,
      registeredTo,
      lastAccessFrom,
      lastAccessTo,
      sortBy,
      sortOrder
    ].filter((v) => v !== '').length
  )
</script>

<PanelFiltros {activos} onAplicar={aplicarFiltros} onLimpiar={limpiar}>
  <p class="seccion">Rol y estado</p>
  <Seleccion id="filtro-rol" etiqueta="Rol" bind:valor={role} opciones={ROLES} textoVacio="Todos los roles" />
  <Seleccion
    id="filtro-estado"
    etiqueta="Estado"
    bind:valor={status}
    opciones={ESTADOS}
    textoVacio="Todos los estados"
  />
  <p class="seccion">Datos</p>
  <FiltroTexto id="filtro-nombre" etiqueta="Nombre" bind:valor={name} placeholder="María…" />
  <FiltroTexto id="filtro-email" etiqueta="Email" bind:valor={email} placeholder="maria@…" />
  <FiltroTexto id="filtro-dni" etiqueta="DNI" bind:valor={dni} placeholder="12345678" />
  <p class="seccion">Fechas</p>
  <div class="rango">
    <FiltroFecha id="filtro-registro-desde" etiqueta="Registro desde" bind:valor={registeredFrom} />
    <FiltroFecha id="filtro-registro-hasta" etiqueta="Registro hasta" bind:valor={registeredTo} />
  </div>
  <div class="rango">
    <FiltroFecha id="filtro-acceso-desde" etiqueta="Último acceso desde" bind:valor={lastAccessFrom} />
    <FiltroFecha id="filtro-acceso-hasta" etiqueta="Último acceso hasta" bind:valor={lastAccessTo} />
  </div>
  <p class="seccion">Orden</p>
  <Seleccion
    id="filtro-orden"
    etiqueta="Ordenar por"
    bind:valor={sortBy}
    opciones={ORDENES}
    textoVacio="Por defecto"
  />
  <Seleccion
    id="filtro-sentido"
    etiqueta="Sentido"
    bind:valor={sortOrder}
    opciones={SENTIDOS}
    textoVacio="Por defecto"
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
