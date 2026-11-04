<script>
  import { Router } from 'sv-router'
  // Importar router.js registra las rutas (createRouter corre al importarlo).
  import { navigate } from './router.js'
  import { sesion, cerrarSesion } from './sesion.svelte.js'
  import { navegacion } from './navegacion.svelte.js'
  import { logout, usuarioActual } from './api/sesion.api.js'

  // Al abrir la app con un token guardado lo validamos UNA vez (GET /api/user)
  // antes de mostrar cualquier página, para no operar con un token vencido.
  const tokenAlAbrir = sesion.token
  let verificando = $state(Boolean(tokenAlAbrir))

  // Menú lateral off-canvas (solo en pantallas menores a 1024px, donde la
  // sidebar no queda fija y aparece el botón hamburguesa en la topbar).
  let menuLateralAbierto = $state(false)

  function abrirMenuLateral() {
    menuLateralAbierto = true
  }

  function cerrarMenuLateral() {
    menuLateralAbierto = false
  }

  // Título de la topbar según la sección anunciada por cada página.
  const nombreSeccion = $derived.by(() => {
    if (navegacion.seccion === '/login') return 'Iniciar sesión'
    return 'Inicio'
  })

  $effect(() => {
    // Al cambiar de sección (leemos la ruta compartida) el menú mobile se cierra.
    navegacion.seccion
    menuLateralAbierto = false
  })

  $effect(() => {
    verificarSesionGuardada()
  })

  async function verificarSesionGuardada() {
    if (!tokenAlAbrir) return
    try {
      // El token sigue vivo: refrescamos el usuario por si cambió en el backend.
      sesion.usuario = await usuarioActual(tokenAlAbrir)
    } catch {
      // 401: el token ya no sirve; sesión afuera y a la pantalla de login.
      cerrarSesion()
      navigate('/login')
    } finally {
      verificando = false
    }
  }

  async function salir() {
    // Si el logout falla igual cerramos: lo importante es limpiar el lado cliente.
    try {
      await logout(sesion.token)
    } catch {
      // Error ignorado a propósito: el cierre local es lo que manda acá.
    }
    cerrarSesion()
    navigate('/login')
  }
</script>

{#if verificando}
  <div class="cargando-inicial">
    <p>Verificando sesión…</p>
  </div>
{:else if sesion.token}
  <a class="salto" href="#contenido">Saltar al contenido</a>
  <div class="disposicion">
    {#if menuLateralAbierto}
      <button type="button" class="velo" aria-label="Cerrar menú" onclick={cerrarMenuLateral}></button>
    {/if}

    <aside class="lateral" class:abierta={menuLateralAbierto}>
      <div class="marca">📰 <span>Editorial Admin</span></div>
      <nav aria-label="Principal">
        <p class="grupo">Administración</p>
        <a href="/inicio" class:activa={navegacion.seccion === '/inicio'}>
          <span>Inicio</span>
        </a>
      </nav>
      <div class="pie">
        <div class="usuario">
          <span class="inicial">{sesion.usuario?.name?.charAt(0)?.toUpperCase() ?? '?'}</span>
          <span class="nombre">{sesion.usuario?.name}</span>
        </div>
        <button type="button" class="salir" onclick={salir}>
          <span>Salir</span>
        </button>
      </div>
    </aside>

    <div class="principal">
      <header class="topbar">
        <button
          type="button"
          class="hamburguesa"
          aria-label="Abrir menú de navegación"
          aria-expanded={menuLateralAbierto}
          onclick={abrirMenuLateral}
        >
          ☰
        </button>
        <span class="seccion-actual">{nombreSeccion}</span>
      </header>
      <main id="contenido">
        <Router />
      </main>
    </div>
  </div>
{:else}
  <main id="contenido">
    <Router />
  </main>
{/if}

<style>
  /* Skip-link: invisible hasta que recibe foco (teclado) */
  .salto {
    position: absolute;
    left: -9999px;
  }

  .salto:focus {
    left: 1rem;
    top: 1rem;
    z-index: 50;
    background: #ffffff;
    border: 1px solid #e4e4e7;
    border-radius: 6px;
    box-shadow: 0 1px 2px rgb(9 9 9 / 0.05);
    padding: 0.5rem 1rem;
    color: #18181b;
    text-decoration: none;
    font-size: 0.875rem;
  }

  .cargando-inicial {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    align-items: center;
    justify-content: center;
    color: #71717a;
  }

  /* ── Layout dashboard: sidebar fija + contenido ── */
  .disposicion {
    min-height: 100vh;
  }

  .lateral {
    position: fixed;
    inset-block: 0;
    left: 0;
    width: 320px;
    background: #ffffff;
    border-right: 1px solid #e4e4e7;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1rem 0.75rem;
    z-index: 40;
    transform: translateX(-100%);
    transition: transform 150ms;
  }

  .lateral.abierta {
    transform: translateX(0);
    box-shadow: 0 1px 2px rgb(9 9 9 / 0.05);
  }

  .velo {
    position: fixed;
    inset: 0;
    z-index: 39;
    background: rgb(9 9 9 / 0.4);
    border: none;
    padding: 0;
    cursor: default;
  }

  .marca {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 700;
    font-size: 1rem;
    padding: 0 0.75rem;
  }

  nav {
    display: flex;
    flex-direction: column;
    gap: 2px;
    flex: 1;
    overflow-y: auto;
  }

  /* Encabezado de grupo de navegación */
  .grupo {
    margin: 0 0 6px;
    padding: 0 0.75rem;
    font-size: 0.6875rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: #71717a;
  }

  nav a {
    display: flex;
    align-items: center;
    gap: 0.65rem;
    padding: 0.5rem 0.75rem;
    border-radius: 6px;
    color: #52525b;
    font-size: 0.875rem;
    font-weight: 500;
    text-decoration: none;
    transition:
      background-color 150ms,
      color 150ms;
  }

  nav a:hover {
    background: #f4f4f5;
    color: #18181b;
  }

  /* Ítem activo: fondo suave + texto primario */
  nav a.activa {
    background: #eff6ff;
    color: #2563eb;
    font-weight: 600;
  }

  nav a:focus-visible {
    outline: 2px solid #3b82f6;
    outline-offset: 1px;
  }

  .pie {
    border-top: 1px solid #e4e4e7;
    padding-top: 0.75rem;
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  .usuario {
    display: flex;
    align-items: center;
    gap: 0.65rem;
    padding: 0 0.75rem;
    min-width: 0;
  }

  .inicial {
    width: 2rem;
    height: 2rem;
    flex-shrink: 0;
    border-radius: 999px;
    background: #eff6ff;
    color: #2563eb;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.8125rem;
    font-weight: 700;
  }

  .nombre {
    font-size: 0.875rem;
    font-weight: 600;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .salir {
    display: flex;
    align-items: center;
    gap: 0.65rem;
    padding: 0.5rem 0.75rem;
    border: none;
    border-radius: 6px;
    background: transparent;
    color: #52525b;
    font: inherit;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition:
      background-color 150ms,
      color 150ms;
  }

  .salir:hover {
    background: #f4f4f5;
    color: #18181b;
  }

  .salir:focus-visible {
    outline: 2px solid #3b82f6;
    outline-offset: 1px;
  }

  .principal {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .topbar {
    position: sticky;
    top: 0;
    z-index: 10;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    background: #ffffff;
    border-bottom: 1px solid #e4e4e7;
    padding: 0.55rem 1rem;
  }

  .hamburguesa {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 2.25rem;
    height: 2.25rem;
    border: none;
    border-radius: 6px;
    background: transparent;
    color: #52525b;
    font-size: 1.125rem;
    cursor: pointer;
    transition:
      background-color 150ms,
      color 150ms;
  }

  .hamburguesa:hover {
    background: #f4f4f5;
    color: #18181b;
  }

  .hamburguesa:focus-visible {
    outline: 2px solid #3b82f6;
    outline-offset: 2px;
  }

  .seccion-actual {
    font-size: 0.9375rem;
    font-weight: 600;
  }

  main {
    flex: 1;
  }

  /* Desktop: sidebar fija visible y sin hamburguesa */
  @media (width >= 64rem) {
    .lateral {
      transform: none;
    }

    .principal {
      margin-left: 320px;
    }

    .hamburguesa {
      display: none;
    }

    .velo {
      display: none;
    }
  }
</style>
