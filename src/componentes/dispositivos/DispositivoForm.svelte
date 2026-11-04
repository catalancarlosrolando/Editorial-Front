<script>
  import Boton from '../comunes/Boton.svelte'
  import Casilla from '../comunes/Casilla.svelte'

  // Crear dispositivo: SOLO el checkbox is_active; el uid lo genera el
  // backend (RN-D01), por eso el formulario no lo pide.
  let { guardando = false, onGuardar } = $props()

  let activo = $state(true)

  function enviar(e) {
    e.preventDefault()
    onGuardar({ is_active: activo })
  }
</script>

<form class="tarjeta" onsubmit={enviar}>
  <h2>Nuevo dispositivo</h2>
  <p class="nota">El identificador (uid) lo genera el backend automáticamente.</p>
  <Casilla id="dispositivo-activo" etiqueta="Activo" bind:marcado={activo} />
  <div>
    <Boton tipo="submit" deshabilitado={guardando}>
      {guardando ? 'Creando…' : 'Crear dispositivo'}
    </Boton>
  </div>
</form>

<style>
  form {
    display: flex;
    flex-direction: column;
    gap: 0.9rem;
  }

  .nota {
    color: var(--color-texto-suave);
    font-size: 0.875rem;
  }
</style>
