<script>
  import { navigate } from '../router.js'
  import { sesion, iniciarSesion } from '../sesion.svelte.js'
  import { navegacion } from '../navegacion.svelte.js'
  import { login } from '../api/sesion.api.js'
  import Boton from '../componentes/comunes/Boton.svelte'
  import Campo from '../componentes/comunes/Campo.svelte'
  import Casilla from '../componentes/comunes/Casilla.svelte'

  // Esta página es pública: si ya hay sesión, directito al inicio.
  $effect(() => {
    navegacion.seccion = '/login'
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
  <form class="tarjeta login" onsubmit={enviar}>
    <h1>📰 Editorial Admin</h1>
    <p class="subtitulo">Iniciá sesión para administrar el sistema.</p>
    <Campo
      id="login-email"
      tipo="email"
      etiqueta="Correo electrónico"
      bind:valor={correo}
      placeholder="admin@ejemplo.com"
      requerido
      errores={errores.email ?? []}
    />
    <Campo
      id="login-password"
      tipo="password"
      etiqueta="Contraseña"
      bind:valor={contrasena}
      requerido
      errores={errores.password ?? []}
    />
    <Casilla id="login-recordarme" etiqueta="Recordarme (sesión de 30 días)" bind:marcado={recordarme} />
    {#if mensaje}
      <p class="mensaje-error" role="alert">{mensaje}</p>
    {/if}
    <Boton tipo="submit" deshabilitado={enviando}>
      {enviando ? 'Ingresando…' : 'Ingresar'}
    </Boton>
    <div class="pie-enlace">
      <span>¿No tenés una cuenta?</span>
      <a href="/register" onclick={(e) => { e.preventDefault(); navigate('/register'); }}>
        Registrate acá
      </a>
    </div>
  </form>
</div>

<style>
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

  .fondo {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1.5rem;
  }

  .login {
    width: 100%;
    max-width: 24rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .subtitulo {
    color: var(--color-texto-suave);
    font-size: 0.875rem;
  }

  .mensaje-error {
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: var(--radio-campo);
    padding: 0.6rem 0.8rem;
    color: #b91c1c;
    font-size: 0.875rem;
  }
</style>
