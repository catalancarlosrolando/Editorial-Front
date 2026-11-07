<script>
  // Filtros del listado de usuarios (etapa C): rol, estado, textos, rangos de
  // fechas y orden. Mismo contrato que MediosFiltros: estado local y callback
  // onFiltrar(filtros) — con TODOS los valores, la capa api decide cuáles van
  // al query string. Enter en un filtro dispara lo mismo que el botón.
  import Boton from '../comunes/Boton.svelte'
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

  function aplicar(e) {
    e.preventDefault()
    aplicarFiltros()
  }

  function limpiar() {
    role = status = name = email = dni = ''
    registeredFrom = registeredTo = lastAccessFrom = lastAccessTo = ''
    sortBy = sortOrder = ''
    onFiltrar({})
  }
</script>

<form class="tarjeta filtros" onsubmit={aplicar}>
  <Seleccion id="filtro-rol" etiqueta="Rol" bind:valor={role} opciones={ROLES} textoVacio="Todos los roles" />
  <Seleccion
    id="filtro-estado"
    etiqueta="Estado"
    bind:valor={status}
    opciones={ESTADOS}
    textoVacio="Todos los estados"
  />
  <FiltroTexto id="filtro-nombre" etiqueta="Nombre" bind:valor={name} placeholder="María…" alFiltrar={aplicarFiltros} />
  <FiltroTexto id="filtro-email" etiqueta="Email" bind:valor={email} placeholder="maria@…" alFiltrar={aplicarFiltros} />
  <FiltroTexto id="filtro-dni" etiqueta="DNI" bind:valor={dni} placeholder="12345678" alFiltrar={aplicarFiltros} />
  <FiltroFecha id="filtro-registro-desde" etiqueta="Registro desde" bind:valor={registeredFrom} alFiltrar={aplicarFiltros} />
  <FiltroFecha id="filtro-registro-hasta" etiqueta="Registro hasta" bind:valor={registeredTo} alFiltrar={aplicarFiltros} />
  <FiltroFecha
    id="filtro-acceso-desde"
    etiqueta="Último acceso desde"
    bind:valor={lastAccessFrom}
    alFiltrar={aplicarFiltros}
  />
  <FiltroFecha
    id="filtro-acceso-hasta"
    etiqueta="Último acceso hasta"
    bind:valor={lastAccessTo}
    alFiltrar={aplicarFiltros}
  />
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
