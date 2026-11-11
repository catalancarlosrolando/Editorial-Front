<script>
  import Boton from '../comunes/Boton.svelte'
  import Campo from '../comunes/Campo.svelte'
  import AreaTexto from '../comunes/AreaTexto.svelte'
  import Seleccion from '../comunes/Seleccion.svelte'
  import GrupoCasillas from '../comunes/GrupoCasillas.svelte'
  import MensajeError from '../comunes/MensajeError.svelte'
  import Icono from '../comunes/Icono.svelte'

  // Formulario dual de publicación (etapa E): crear (inicial = null) y
  // editar (inicial = la fila del listado, que trae channels y medias
  // completas, así que no hace falta un fetch de detalle para rellenarlo).
  // El CONCEPTO NUEVO es el cascado: canales elegidos → los medios que se
  // pueden elegir son SOLO los de esos canales (RN-P02). La recarga del
  // catálogo de medios la hace el hook (con guardia anti-carrera); este
  // componente le avisa con onCanalesCambian cada vez que la selección
  // cambia, y limpia de la selección los medios que quedaron sin canal.
  // Etapa F: bloque de ADJUNTOS con <input type="file" multiple bind:files>.
  let {
    inicial = null,
    tipos = [],
    canales = [],
    medios = [],
    adjuntosExistentes = [],
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

  // ── Etapa F: adjuntos ──
  // `archivos` es el FileList del input (bind:files). La lista se convierte
  // en array recién al enviar, y se valida acá en el cliente (RN-P05: máx.
  // 10 archivos × 10 MB por operación, con los mimes de la spec).
  let archivos = $state(null)
  let errorAdjuntos = $state('')
  let inputArchivos = $state(null)

  const MAX_ADJUNTOS = 10
  const MAX_BYTES = 10 * 1024 * 1024
  // Mimes de la spec (05-api-endpoints): jpg, jpeg, png, gif, webp, mp4, mov,
  // avi, webm, mp3, wav, pdf. Se aceptan los dos nombres que sueltan los
  // navegadores para avi y wav.
  const MIMES_PERMITIDOS = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/avi', 'video/webm',
    'audio/mpeg', 'audio/wav', 'audio/x-wav', 'application/pdf'
  ]
  // Si el navegador no reconoce el tipo (file.type vacío) se decide por la
  // extensión del nombre, que es exactamente la lista del backend.
  const EXTENSIONES_PERMITIDAS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'mov', 'avi', 'webm', 'mp3', 'wav', 'pdf']
  const ACEPTAR =
    MIMES_PERMITIDOS.join(',') + ',' + EXTENSIONES_PERMITIDAS.map((e) => '.' + e).join(',')

  const archivosElegidos = $derived(archivos ? [...archivos] : [])
  const adjuntosPrevios = $derived(adjuntosExistentes)

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

  // RN-P05 en el cliente: cantidad, tamaño y tipo. Devuelve '' si todo bien,
  // o el texto del primer problema encontrado (con el nombre del archivo).
  function validarAdjuntos(lista) {
    if (lista.length > MAX_ADJUNTOS) {
      return `Máximo ${MAX_ADJUNTOS} archivos por operación (elegiste ${lista.length}).`
    }
    for (const archivo of lista) {
      if (archivo.size > MAX_BYTES) {
        return `«${archivo.name}» supera los 10 MB.`
      }
      const tipoOk =
        archivo.type
          ? MIMES_PERMITIDOS.includes(archivo.type)
          : EXTENSIONES_PERMITIDAS.includes(archivo.name.split('.').pop().toLowerCase())
      if (!tipoOk) {
        return `«${archivo.name}» no es un tipo permitido (imágenes, videos, audios o PDF).`
      }
    }
    return ''
  }

  // Suelta la selección entera: el FileList no se puede recortar archivo por
  // archivo, así que el input se limpia por completo (bind:this + value='').
  function soltarArchivos() {
    if (inputArchivos) inputArchivos.value = ''
    archivos = null
    errorAdjuntos = ''
  }

  // El backend guarda solo mime_type + path (sin nombre original): para
  // mostrar los existentes se saca el nombre final del path.
  function nombreDeAdjunto(path) {
    return String(path ?? '').split('/').pop()
  }

  function formatoTamanio(bytes) {
    if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
    if (bytes >= 1024) return Math.round(bytes / 1024) + ' KB'
    return bytes + ' B'
  }

  function enviar(e) {
    e.preventDefault()
    errorFecha = ''
    // RN-P06 también se chequea en el cliente: la fecha debe ser futura.
    if (scheduledAt && new Date(scheduledAt).getTime() <= Date.now()) {
      errorFecha = 'La fecha de programación debe ser posterior a la actual.'
      return
    }
    // RN-P05: validar los archivos ANTES de salir hacia el hook. Si hay un
    // problema, el formulario sigue abierto y no viaja ningún byte.
    errorAdjuntos = validarAdjuntos(archivosElegidos)
    if (errorAdjuntos) return
    onGuardar(
      {
        name,
        content,
        type,
        scheduled_at: scheduledAt ? aMysql(scheduledAt) : null,
        channel_ids: canalesElegidos,
        media_ids: mediosElegidos
      },
      archivosElegidos
    )
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

  <!-- Adjuntos (etapa F): bind:files + multiple. En edición se listan los
       que ya tiene el post y se avisa RN-P04: la edición SOLO agrega. -->
  <fieldset class="adjuntos" disabled={guardando}>
    <legend>Adjuntos</legend>

    {#if inicial}
      <p class="nota">RN-P04: los adjuntos existentes se mantienen; la edición solo puede <strong>agregar</strong> nuevos (no hay forma de quitarlos desde acá).</p>
      {#if adjuntosPrevios.length}
        <ul class="lista-adjuntos">
          {#each adjuntosPrevios as adjunto (adjunto.id)}
            <li>
              <Icono nombre="adjunto" tamano={14} />
              <span class="nombre-adjunto">{nombreDeAdjunto(adjunto.path)}</span>
              <span class="tipo-adjunto">{adjunto.mime_type}</span>
            </li>
          {/each}
        </ul>
      {:else}
        <p class="sin-adjuntos">Esta publicación todavía no tiene adjuntos.</p>
      {/if}
    {/if}

    <label class="etiqueta-archivos" for="post-archivos">Agregar archivos (hasta 10 × 10 MB)</label>
    <input
      id="post-archivos"
      type="file"
      multiple
      accept={ACEPTAR}
      bind:files={archivos}
      bind:this={inputArchivos}
    />

    {#if archivosElegidos.length}
      <ul class="lista-adjuntos">
        {#each archivosElegidos as archivo (archivo.name + ':' + archivo.size)}
          <li>
            <Icono nombre="adjunto" tamano={14} />
            <span class="nombre-adjunto">{archivo.name}</span>
            <span class="tipo-adjunto">{formatoTamanio(archivo.size)}</span>
          </li>
        {/each}
      </ul>
      <Boton tipo="button" variante="neutra" onclick={soltarArchivos}>
        Quitar selección
      </Boton>
    {/if}

    {#if errorAdjuntos}
      <p class="error-adjuntos" role="alert">{errorAdjuntos}</p>
    {/if}
  </fieldset>

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

  /* Bloque de adjuntos (etapa F), mismo estilo de fieldset que el resto */
  .adjuntos {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    border: 1px solid var(--color-borde);
    border-radius: var(--radio-panel);
    padding: 0.9rem;
  }

  .adjuntos legend {
    font-size: 0.8125rem;
    font-weight: 600;
    color: var(--color-texto-medio);
    padding: 0 0.35rem;
  }

  .nota {
    font-size: 0.8125rem;
    color: var(--color-texto-medio);
    background: var(--color-gris-100);
    border-radius: var(--radio-boton);
    padding: 0.5rem 0.65rem;
  }

  .etiqueta-archivos {
    font-size: 0.875rem;
    font-weight: 500;
  }

  .adjuntos input[type='file'] {
    font-size: 0.8125rem;
    color: var(--color-texto-medio);
  }

  .lista-adjuntos {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  .lista-adjuntos li {
    display: flex;
    align-items: center;
    gap: 0.45rem;
    font-size: 0.8125rem;
    color: var(--color-texto-medio);
    background: var(--color-gris-100);
    border-radius: var(--radio-boton);
    padding: 0.35rem 0.55rem;
    min-width: 0;
  }

  .nombre-adjunto {
    font-weight: 500;
    color: var(--color-texto);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    min-width: 0;
  }

  .tipo-adjunto {
    margin-left: auto;
    flex-shrink: 0;
    font-size: 0.75rem;
  }

  .sin-adjuntos {
    font-size: 0.8125rem;
    color: var(--color-texto-suave);
  }

  .error-adjuntos {
    color: #b91c1c; /* danger-700 */
    font-size: 0.8125rem;
  }

  .acciones {
    display: flex;
    gap: 0.6rem;
    margin-top: 0.25rem;
  }
</style>
