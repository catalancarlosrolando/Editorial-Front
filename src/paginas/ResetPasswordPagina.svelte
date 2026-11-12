<script>
  import { navigate } from '../router.js'
  import { navegacion } from '../navegacion.svelte.js'
  import { restablecerPassword } from '../api/sesion.api.js'
  import Boton from '../componentes/comunes/Boton.svelte'
  import Campo from '../componentes/comunes/Campo.svelte'

  let token = $state('')
  let email = $state('')
  let password = $state('')
  let passwordConfirmation = $state('')

  let enviando = $state(false)
  let errores = $state({})
  let mensaje = $state('')
  let exito = $state(false)
  let faltaToken = $state(false)
  let temporizadorRedireccion = $state(null)

  $effect(() => {
    navegacion.seccion = '/reset-password'
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      token = params.get('token') || ''
      email = params.get('email') || ''
      if (!token) {
        faltaToken = true
      }
    }
  })

  // Normaliza errores a arrays para pasárselos a Campo.svelte
  function obtenerErroresCampo(campo) {
    const error = errores[campo]
    if (!error) return []
    return Array.isArray(error) ? error : [error]
  }

  async function enviar(e) {
    e.preventDefault()
    enviando = true
    errores = {}
    mensaje = ''

    if (password !== passwordConfirmation) {
      errores = { password_confirmation: ['Las contraseñas no coinciden.'] }
      enviando = false
      return
    }

    try {
      const resultado = await restablecerPassword({
        token,
        email,
        password,
        password_confirmation: passwordConfirmation
      })

      if (!resultado.ok) {
        errores = resultado.errores || {}
        mensaje =
          resultado.mensaje ||
          'No se pudo restablecer la contraseña. El enlace puede haber vencido o los datos son inválidos.'
        return
      }

      exito = true
      mensaje = resultado.mensaje || '¡Tu contraseña ha sido restablecida con éxito!'

      // Redirigir a login tras 3 segundos
      temporizadorRedireccion = setTimeout(() => {
        navigate('/login')
      }, 3000)
    } catch {
      mensaje = 'No se pudo conectar con el backend. ¿Está corriendo en http://localhost:8080?'
    } finally {
      enviando = false
    }
  }

  function irAlLogin() {
    if (temporizadorRedireccion) {
      clearTimeout(temporizadorRedireccion)
    }
    navigate('/login')
  }
</script>

<svelte:head>
  <title>Restablecer contraseña · Editorial Admin</title>
</svelte:head>

<div class="fondo">
  {#if exito}
    <div class="tarjeta contenedor-estado">
      <div class="cabecera-estado">
        <div class="icono-circulo exito" aria-hidden="true">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="2"
            stroke="currentColor"
            width="32"
            height="32"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="m4.5 12.75 6 6 9-13.5"
            />
          </svg>
        </div>
        <h1>¡Contraseña restablecida!</h1>
        <p class="subtitulo">{mensaje}</p>
        <p class="aviso-redireccion">Redirigiendo al inicio de sesión en unos segundos…</p>
      </div>

      <div class="acciones-estado">
        <Boton onclick={irAlLogin}>
          Iniciar sesión ahora
        </Boton>
      </div>
    </div>
  {:else if faltaToken}
    <div class="tarjeta contenedor-estado">
      <div class="cabecera-estado">
        <div class="icono-circulo advertencia" aria-hidden="true">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="2"
            stroke="currentColor"
            width="32"
            height="32"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
            />
          </svg>
        </div>
        <h1>Enlace incompleto</h1>
        <p class="subtitulo">
          El enlace de restablecimiento no contiene un token válido. Por favor, solicitá un nuevo enlace desde la pantalla de inicio de sesión.
        </p>
      </div>

      <div class="acciones-estado">
        <Boton onclick={irAlLogin}>
          Ir a Iniciar sesión
        </Boton>
      </div>
    </div>
  {:else}
    <form class="tarjeta formulario-reset" onsubmit={enviar}>
      <h1>📰 Editorial Admin</h1>
      <h2>Restablecer contraseña</h2>
      {#if email}
        <p class="subtitulo">
          Ingresá una nueva contraseña para la cuenta <strong>{email}</strong>.
        </p>
      {:else}
        <p class="subtitulo">
          Ingresá y confirmá tu nueva contraseña para recuperar el acceso a tu cuenta.
        </p>
      {/if}

      <!-- Inputs ocultos para mantener token y email en estado del formulario -->
      <input type="hidden" name="token" value={token} />
      <input type="hidden" name="email" value={email} />

      <Campo
        id="reset-password"
        tipo="password"
        etiqueta="Nueva contraseña"
        bind:valor={password}
        placeholder="Al menos 8 caracteres"
        requerido
        errores={obtenerErroresCampo('password')}
      />

      <Campo
        id="reset-password-confirmation"
        tipo="password"
        etiqueta="Confirmar nueva contraseña"
        bind:valor={passwordConfirmation}
        placeholder="Repetí la nueva contraseña"
        requerido
        errores={obtenerErroresCampo('password_confirmation')}
      />

      {#if mensaje}
        <div class="alerta-error" role="alert">
          <span class="icono-cruz" aria-hidden="true">✕</span>
          <span>{mensaje}</span>
        </div>
      {/if}

      <Boton tipo="submit" deshabilitado={enviando}>
        {enviando ? 'Restableciendo contraseña…' : 'Restablecer contraseña'}
      </Boton>

      <div class="pie-enlace">
        <span>¿Recordaste tu contraseña?</span>
        <a
          href="/login"
          onclick={(e) => {
            e.preventDefault()
            navigate('/login')
          }}
        >
          Iniciá sesión acá
        </a>
      </div>
    </form>
  {/if}
</div>

<style>
  .fondo {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1.5rem;
  }

  .formulario-reset {
    width: 100%;
    max-width: 26rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .contenedor-estado {
    width: 100%;
    max-width: 28rem;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    align-items: stretch;
  }

  .cabecera-estado {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 0.5rem;
  }

  .icono-circulo {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    margin-bottom: 0.25rem;
  }

  .icono-circulo.exito {
    background: #dcfce7;
    color: var(--color-exito-texto, #16a34a);
  }

  .icono-circulo.advertencia {
    background: #fef3c7;
    color: #d97706;
  }

  .subtitulo {
    color: var(--color-texto-suave);
    font-size: 0.875rem;
    line-height: 1.35rem;
  }

  .aviso-redireccion {
    color: var(--color-texto-medio);
    font-size: 0.8125rem;
    font-style: italic;
  }

  .acciones-estado {
    display: flex;
    justify-content: center;
    margin-top: 0.5rem;
  }

  .alerta-error {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: var(--radio-campo);
    padding: 0.6rem 0.8rem;
    color: #b91c1c;
    font-size: 0.875rem;
  }

  .icono-cruz {
    font-weight: 700;
  }

  .pie-enlace {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
    font-size: 0.875rem;
    color: var(--color-texto-suave);
    margin-top: 0.5rem;
  }

  .pie-enlace a {
    color: var(--color-primario);
    text-decoration: none;
    font-weight: 500;
  }

  .pie-enlace a:hover {
    text-decoration: underline;
  }
</style>

