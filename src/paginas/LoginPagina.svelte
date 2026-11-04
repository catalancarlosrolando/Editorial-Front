<script>
  import { navigate } from '../router.js'
  import { sesion, iniciarSesion } from '../sesion.svelte.js'
  import { login } from '../api/sesion.api.js'

  // Esta página es pública: si ya hay sesión, directito al inicio.
  $effect(() => {
    if (sesion.token) {
      navigate('/inicio')
    }
  })

  let correo = $state('')
  let contrasena = $state('')
  let recordarme = $state(false)
  let enviando = $state(false)
  let errores = $state({})
  let mensaje = $state('')

  async function enviar(e) {
    e.preventDefault()
    enviando = true
    errores = {}
    mensaje = ''
    try {
      const resultado = await login(correo, contrasena, recordarme)
      if (resultado.errores) {
        // Credenciales incorrectas llegan como 422: mensaje general + campos.
        errores = resultado.errores
        mensaje = resultado.mensaje ?? 'Revisá los datos e intentá de nuevo.'
        return
      }
      iniciarSesion(resultado) // guarda token + usuario (estado y localStorage)
      navigate('/inicio')
    } catch {
      mensaje = 'No se pudo conectar con el backend. ¿Está corriendo en http://localhost:8080?'
    } finally {
      enviando = false
    }
  }
</script>

<svelte:head>
  <title>Iniciar sesión · Editorial Admin</title>
</svelte:head>

<div class="fondo">
  <form class="tarjeta" onsubmit={enviar}>
    <h1>📰 Editorial Admin</h1>
    <p class="subtitulo">Iniciá sesión para administrar el sistema.</p>

    <div class="campo">
      <label for="login-email">Correo electrónico</label>
      <input
        id="login-email"
        type="email"
        bind:value={correo}
        placeholder="admin@ejemplo.com"
        required
      />
      {#each errores.email ?? [] as texto}
        <p class="error-campo">{texto}</p>
      {/each}
    </div>

    <div class="campo">
      <label for="login-password">Contraseña</label>
      <input id="login-password" type="password" bind:value={contrasena} required />
      {#each errores.password ?? [] as texto}
        <p class="error-campo">{texto}</p>
      {/each}
    </div>

    <label class="casilla">
      <input type="checkbox" bind:checked={recordarme} />
      <span>Recordarme (sesión de 30 días)</span>
    </label>

    {#if mensaje}
      <p class="mensaje-error" role="alert">{mensaje}</p>
    {/if}

    <button type="submit" disabled={enviando}>
      {enviando ? 'Ingresando…' : 'Ingresar'}
    </button>
  </form>
</div>

<style>
  .fondo {
    display: flex;
    justify-content: center;
    padding: 2rem 0;
  }

  .tarjeta {
    width: 100%;
    max-width: 24rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    background: #ffffff;
    border: 1px solid #e4e4e7;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 1px 2px rgb(9 9 9 / 0.05);
  }

  h1 {
    font-size: 1.25rem;
  }

  .subtitulo {
    color: #71717a;
    font-size: 0.875rem;
    margin-top: -0.5rem;
  }

  .campo {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  label {
    font-size: 0.875rem;
    font-weight: 500;
  }

  input {
    border: 1px solid #d4d4d8;
    border-radius: 8px;
    padding: 0.5rem 0.7rem;
    font: inherit;
    font-size: 0.875rem;
  }

  input:focus {
    outline: 2px solid #3b82f6;
    outline-offset: 1px;
  }

  .error-campo {
    color: #b91c1c;
    font-size: 0.8125rem;
  }

  .casilla {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
  }

  .mensaje-error {
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 8px;
    padding: 0.6rem 0.8rem;
    color: #b91c1c;
    font-size: 0.875rem;
  }

  button {
    border: none;
    border-radius: 6px;
    padding: 0.55rem 1rem;
    background: #2563eb;
    color: #ffffff;
    font: inherit;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
  }

  button:hover {
    background: #1d4ed8;
  }

  button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
</style>
