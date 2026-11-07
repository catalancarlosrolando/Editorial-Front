<script>
  import Boton from '../comunes/Boton.svelte'
  import Campo from '../comunes/Campo.svelte'
  import AreaTexto from '../comunes/AreaTexto.svelte'
  import Seleccion from '../comunes/Seleccion.svelte'
  import GrupoCasillas from '../comunes/GrupoCasillas.svelte'
  import MensajeError from '../comunes/MensajeError.svelte'

  // Formulario dual de publicación (etapa E): crear (inicial = null) y
  // editar (inicial = la fila del listado, que trae channels y medias
  // completas, así que no hace falta un fetch de detalle para rellenarlo).
  // El CONCEPTO NUEVO es el cascado: canales elegidos → los medios que se
  // pueden elegir son SOLO los de esos canales (RN-P02). La recarga del
  // catálogo de medios la hace el hook (con guardia anti-carrera); este
  // componente le avisa con onCanalesCambian cada vez que la selección
  // cambia, y limpia de la selección los medios que quedaron sin canal.
  let {
    inicial = null,
    tipos = [],
    canales = [],
    medios = [],
    cargandoCanales = false,
    cargandoMedios = false,
    errorCanales = '',
    errorMedios = '',
    errores = {},
    error = '',
    guardando = false,
    onGuardar,
    onCancelar,
    onCanalesCambian
  } = $props()

  // Estado local del formulario: se lee `inicial` UNA vez por instancia y la
  // página lo envuelve en {#key}, así que pasar de crear a editar (o entre
  // posts) siempre arranca con datos frescos. Los nombres de campo son los
  // que espera la API (name, content, ...), en inglés como en CanalForm.
  // svelte-ignore state_referenced_locally
  const { name: nombreInicial = '', content: contenidoInicial = '', type: tipoInicial = '' } =
    inicial ?? {}
  let name = $state(nombreInicial)
  let content = $state(contenidoInicial)
  let type = $state(tipoInicial)
  // svelte-ignore state_referenced_locally
  let scheduledAt = $state(inicial?.scheduled_at ? aDatetimeLocal(inicial.scheduled_at) : '')
  // svelte-ignore state_referenced_locally
  let canalesElegidos = $state((inicial?.channels ?? []).map((c) => c.id))
  // svelte-ignore state_referenced_locally
  let mediosElegidos = $state((inicial?.medias ?? []).map((m) => m.id))
  let errorFecha = $state('')

  // El <input type="datetime-local"> trabaja con "YYYY-MM-DDTHH:MM" en hora
  // LOCAL; el backend manda ISO con zona. Se convierte ida y vuelta con Date
  // (JS estándar del navegador).
  function aDatetimeLocal(iso) {
    const fecha = new Date(iso)
    if (Number.isNaN(fecha.getTime())) return ''
    const dos = (n) => String(n).padStart(2, '0')
    return (
      `${fecha.getFullYear()}-${dos(fecha.getMonth() + 1)}-${dos(fecha.getDate())}` +
      `T${dos(fecha.getHours())}:${dos(fecha.getMinutes())}`
    )
  }

  // MySQL (datetime) acepta "YYYY-MM-DD HH:MM:SS" sin ambigüedad de zona:
  // lo que el usuario vio en el formulario es lo que se guarda.
  function aMysql(valor) {
    return valor.replace('T', ' ') + (valor.length === 16 ? ':00' : '')
  }

  // onchange del grupo de canales: bind:group YA actualizó canalesElegidos.
  // RN-P02 / criterio de la etapa: un medio elegido solo puede quedarse si
  // alguno de sus canales sigue elegido (medio.canales lo anota el hook al
  // armar el catálogo). Un medio que todavía no está en el catálogo (formulario
  // recién abierto) no se toca: su canal sigue elegido y el catálogo nuevo lo
  // va a incluir. Después avisa al hook para recargar el catálogo.
  function canalesCambiaron() {
    mediosElegidos = mediosElegidos.filter((id) => {
      const medio = medios.find((m) => m.id === id)
      if (!medio) return true
      return medio.canales.some((c) => canalesElegidos.includes(c))
    })
    onCanalesCambian([...canalesElegidos])
  }

  function enviar(e) {
    e.preventDefault()
    errorFecha = ''
    // RN-P06 también se chequea en el cliente: la fecha debe ser futura.
    if (scheduledAt && new Date(scheduledAt).getTime() <= Date.now()) {
      errorFecha = 'La fecha de programación debe ser posterior a la actual.'
      return
    }
    onGuardar({
      name,
      content,
      type,
      scheduled_at: scheduledAt ? aMysql(scheduledAt) : null,
      channel_ids: canalesElegidos,
      media_ids: mediosElegidos
    })
  }

  const opcionesCanales = $derived(canales.map((c) => ({ id: c.id, etiqueta: c.name })))
  const opcionesMedios = $derived(medios.map((m) => ({ id: m.id, etiqueta: m.name })))
  const textoVacioMedios = $derived(
    canalesElegidos.length === 0
      ? 'Elegí primero al menos un canal.'
      : 'Los canales elegidos no tienen medios asociados.'
  )
</script>

<form class="tarjeta" onsubmit={enviar}>
  <h2>{inicial ? 'Editar publicación' : 'Nueva publicación'}</h2>
  {#if inicial}
    <p class="contexto">Estás editando «{inicial.name}» (estado {inicial.status}).</p>
  {/if}

  <Campo
    id="post-nombre"
    etiqueta="Nombre"
    bind:valor={name}
    requerido
    longitudMaxima={255}
    placeholder="Ej.: Comunicado de prensa"
    errores={errores.name ?? []}
  />
  <AreaTexto
    id="post-contenido"
    etiqueta="Contenido"
    bind:valor={content}
    requerido
    filas={6}
    longitudMaxima={10000}
    placeholder="Texto de la publicación (máx. 10.000 caracteres)"
    errores={errores.content ?? []}
  />
  <div class="fila-doble">
    <Seleccion
      id="post-tipo"
      etiqueta="Tipo"
      bind:valor={type}
      opciones={tipos}
      textoVacio="Seleccioná un tipo"
      requerido
      errores={errores.type ?? []}
    />
    <Campo
      id="post-programacion"
      etiqueta="Programar para (opcional)"
      tipo="datetime-local"
      bind:valor={scheduledAt}
      errores={[...(errores.scheduled_at ?? []), ...(errorFecha ? [errorFecha] : [])]}
    />
  </div>

  {#if errorCanales}
    <MensajeError mensaje={errorCanales} onReintentar={() => onCanalesCambian([...canalesElegidos])} />
  {:else}
    <GrupoCasillas
      leyenda="Canales"
      requerido
      bind:elegidos={canalesElegidos}
      opciones={opcionesCanales}
      deshabilitado={cargandoCanales || guardando}
      vacio="Tu usuario no tiene canales asignados: un admin puede asignártelos desde Usuarios → Publicadores."
      ayuda={cargandoCanales ? 'Cargando canales…' : 'Solo podés publicar en tus canales autorizados.'}
      errores={errores.channel_ids ?? []}
      onchange={canalesCambiaron}
    />
  {/if}

  {#if errorMedios}
    <MensajeError mensaje={errorMedios} onReintentar={() => onCanalesCambian([...canalesElegidos])} />
  {:else}
    <GrupoCasillas
      leyenda="Medios (opcional)"
      bind:elegidos={mediosElegidos}
      opciones={opcionesMedios}
      deshabilitado={cargandoMedios || guardando}
      vacio={textoVacioMedios}
      ayuda={cargandoMedios ? 'Cargando medios…' : 'Solo medios de los canales elegidos.'}
      errores={errores.media_ids ?? []}
    />
  {/if}

  {#if error}
    <div class="error-general" role="alert">{error}</div>
  {/if}

  <div class="acciones">
    <Boton tipo="submit" deshabilitado={guardando || cargandoCanales || canalesElegidos.length === 0}>
      {guardando ? 'Guardando…' : inicial ? 'Guardar cambios' : 'Crear publicación'}
    </Boton>
    <Boton variante="neutra" onclick={onCancelar}>Cancelar</Boton>
  </div>
</form>

<style>
  form {
    display: flex;
    flex-direction: column;
    gap: 0.9rem;
  }

  .contexto {
    font-size: 0.8125rem;
    color: var(--color-texto-medio);
    margin-top: -0.5rem;
  }

  .fila-doble {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.9rem;
  }

  @media (max-width: 640px) {
    .fila-doble {
      grid-template-columns: 1fr;
    }
  }

  .error-general {
    background: #fef2f2; /* danger-50 */
    border: 1px solid #fecaca; /* danger-200 */
    border-radius: var(--radio-campo);
    padding: 0.6rem 0.75rem;
    color: #b91c1c; /* danger-700 */
    font-size: 0.875rem;
  }

  .acciones {
    display: flex;
    gap: 0.6rem;
    margin-top: 0.25rem;
  }
</style>
