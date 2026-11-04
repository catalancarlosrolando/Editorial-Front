<script>
  import Boton from '../comunes/Boton.svelte'
  import Campo from '../comunes/Campo.svelte'
  import AreaTexto from '../comunes/AreaTexto.svelte'
  import Seleccion from '../comunes/Seleccion.svelte'

  // Formulario dual: sirve para crear (inicial = null) y para editar
  // (inicial = canal). Los nombres de campo (name, type, ...) son los que
  // espera la API, por eso van en inglés aunque el resto del código esté en español.
  let { inicial = null, tipos = [], errores = {}, guardando = false, onGuardar, onCancelar } =
    $props()

  // Estado local del formulario: $state se inicializa UNA vez por instancia
  // con los datos del canal recibido. La página lo envuelve en {#key} para
  // recrearlo cuando se pasa de crear a editar (o de un canal a otro), así
  // que leer `inicial` solo el valor inicial no deja nunca datos viejos.
  // svelte-ignore state_referenced_locally
  const { name: nombreInicial = '', type: tipoInicial = '', description: descripcionInicial = '', semantic_context: contextoInicial = '' } = inicial ?? {}
  let name = $state(nombreInicial)
  let type = $state(tipoInicial)
  let description = $state(descripcionInicial)
  let semantic_context = $state(contextoInicial)

  function enviar(e) {
    e.preventDefault()
    const datos = { name, type, description, semantic_context }
    if (!inicial) {
      onGuardar(datos)
      return
    }
    // En edición la API acepta campos opcionales: solo enviamos lo que cambió.
    const cambios = {}
    for (const clave of Object.keys(datos)) {
      if (datos[clave] !== (inicial[clave] ?? '')) {
        cambios[clave] = datos[clave]
      }
    }
    onGuardar(cambios)
  }
</script>

<form class="tarjeta" onsubmit={enviar}>
  <h2>{inicial ? 'Editar canal' : 'Nuevo canal'}</h2>
  <Campo
    id="canal-nombre"
    etiqueta="Nombre"
    bind:valor={name}
    requerido
    longitudMaxima={255}
    placeholder="Ej.: Departamento de Sistemas"
    errores={errores.name ?? []}
  />
  <Seleccion
    id="canal-tipo"
    etiqueta="Tipo"
    bind:valor={type}
    opciones={tipos}
    textoVacio="Seleccioná un tipo"
    requerido
    errores={errores.type ?? []}
  />
  <AreaTexto
    id="canal-descripcion"
    etiqueta="Descripción"
    bind:valor={description}
    longitudMaxima={1000}
    errores={errores.description ?? []}
  />
  <AreaTexto
    id="canal-contexto"
    etiqueta="Contexto semántico"
    bind:valor={semantic_context}
    filas={4}
    longitudMaxima={2000}
    errores={errores.semantic_context ?? []}
  />
  <div class="acciones">
    <Boton tipo="submit" deshabilitado={guardando}>
      {guardando ? 'Guardando…' : 'Guardar'}
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

  .acciones {
    display: flex;
    gap: 0.6rem;
    margin-top: 0.25rem;
  }
</style>
