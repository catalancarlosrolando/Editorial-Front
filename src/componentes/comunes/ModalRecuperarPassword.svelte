<script>
  import { solicitarRecuperacionPassword } from '../../api/sesion.api.js'
  import Boton from './Boton.svelte'
  import Campo from './Campo.svelte'

  let {
    abierto = $bindable(true),
    emailInicial = '',
    onCerrar
  } = $props()

  let email = $state('')
  let enviando = $state(false)
  let errores = $state({})
  let mensaje = $state('')
  let exito = $state(false)

  let abiertoPrevio = false
  $effect(() => {
    if (abierto && !abiertoPrevio) {
      email = emailInicial || ''
      errores = {}
      mensaje = ''
      exito = false
      enviando = false
    }
    abiertoPrevio = abierto
  })

  function cerrar() {
    if (enviando) return
    abierto = false
    onCerrar?.()
  }

  async function enviarSolicitud(e) {
    e.preventDefault()
    enviando = true
    errores = {}
    mensaje = ''
    exito = false

    try {
      const resultado = await solicitarRecuperacionPassword(email)
      if (!resultado.ok) {
        errores = resultado.errores || {}
        mensaje =
          resultado.mensaje || 'No se pudo enviar el enlace. Revisá el correo ingresado.'
        return
      }

      exito = true
      mensaje = resultado.mensaje || 'Enlace enviado a tu correo'
    } catch {
      mensaje = 'No se pudo conectar con el backend. ¿Está corriendo en http://localhost:8080?'
    } finally {
      enviando = false
    }
  }

  $effect(() => {
    if (!abierto || enviando) return
    const onKey = (e) => {
      if (e.key === 'Escape') cerrar()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })
</script>

{#if abierto}
  <button
    type="button"
    class="velo"
    aria-label="Cerrar modal"
    onclick={cerrar}
    disabled={enviando}
  ></button>
  <div class="dialogo" role="dialog" aria-modal="true" aria-labelledby="titulo-olvido">
    <div class="cabecera-modal">
      <h2 id="titulo-olvido">Recuperar contraseña</h2>
      {#if !enviando}
        <button
          type="button"
          class="boton-cerrar"
          aria-label="Cerrar modal"
          onclick={cerrar}
        >
          ✕
        </button>
      {/if}
    </div>

    {#if exito}
      <div class="alerta feedback-exito" role="status">
        <span class="icono-check" aria-hidden="true">✓</span>
        <div class="contenido-feedback">
          <strong>¡Correo enviado!</strong>
          <p>{mensaje || 'Enlace enviado a tu correo'}</p>
        </div>
      </div>
      <div class="acciones-modal">
        <Boton variante="primaria" onclick={cerrar}>
          Volver al inicio de sesión
        </Boton>
      </div>
    {:else}
      <p class="descripcion-modal">
        Ingresá el correo electrónico asociado a tu cuenta y te enviaremos un enlace para restablecer tu contraseña.
      </p>

      <form class="form-modal" onsubmit={enviarSolicitud}>
        <Campo
          id="olvido-email"
          tipo="email"
          etiqueta="Correo electrónico"
          bind:valor={email}
          placeholder="admin@ejemplo.com"
          requerido
          errores={errores.email ?? []}
        />

        {#if mensaje}
          <div class="alerta feedback-error" role="alert">
            <span class="icono-cruz" aria-hidden="true">✕</span>
            <span>{mensaje}</span>
          </div>
        {/if}

        <div class="acciones-modal">
          <Boton
            variante="neutra"
            tipo="button"
            deshabilitado={enviando}
            onclick={cerrar}
          >
            Cancelar
          </Boton>
          <Boton
            variante="primaria"
            tipo="submit"
            deshabilitado={enviando}
          >
            {enviando ? 'Enviando enlace…' : 'Enviar enlace'}
          </Boton>
        </div>
      </form>
    {/if}
  </div>
{/if}

<style>
  .velo {
    position: fixed;
    inset: 0;
    z-index: 50;
    background: rgb(9 9 9 / 0.4);
    border: none;
    padding: 0;
    cursor: default;
  }

  .dialogo {
    position: fixed;
    z-index: 51;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: min(28rem, calc(100vw - 2rem));
    background: var(--color-panel);
    border: 1px solid var(--color-borde);
    border-radius: var(--radio-panel);
    box-shadow:
      var(--anillo),
      0 20px 25px -5px rgb(0 0 0 / 0.1),
      0 8px 10px -6px rgb(0 0 0 / 0.1);
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .cabecera-modal {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
  }

  .cabecera-modal h2 {
    font-size: 1.125rem;
    font-weight: 600;
  }

  .boton-cerrar {
    background: transparent;
    border: none;
    font-size: 1.125rem;
    color: var(--color-texto-suave);
    cursor: pointer;
    padding: 0.25rem 0.5rem;
    border-radius: var(--radio-boton);
    line-height: 1;
  }

  .boton-cerrar:hover {
    background: var(--color-gris-100);
    color: var(--color-texto);
  }

  .descripcion-modal {
    color: var(--color-texto-medio);
    font-size: 0.875rem;
    line-height: 1.4;
  }

  .form-modal {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .acciones-modal {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
    margin-top: 0.25rem;
  }

  .alerta {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
    padding: 0.6rem 0.8rem;
    border-radius: var(--radio-campo);
    font-size: 0.875rem;
    line-height: 1.35;
  }

  .feedback-exito {
    background: #f0fdf4;
    border: 1px solid #bbf7d0;
    color: #166534;
  }

  .feedback-error {
    background: #fef2f2;
    border: 1px solid #fecaca;
    color: #991b1b;
  }

  .icono-check {
    font-weight: bold;
    color: #16a34a;
  }

  .icono-cruz {
    font-weight: bold;
    color: #dc2626;
  }

  .contenido-feedback p {
    font-size: 0.8125rem;
    margin-top: 0.25rem;
  }
</style>
