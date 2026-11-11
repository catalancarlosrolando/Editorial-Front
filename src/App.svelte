<script>
  import { Router } from 'sv-router'
  // Importar router.js registra las rutas (createRouter corre al importarlo).
  import { navigate } from './router.js'
  import { sesion, cerrarSesion, tienePermiso, tieneRol } from './sesion.svelte.js'
  import { navegacion } from './navegacion.svelte.js'
  import { logout, usuarioActual } from './api/sesion.api.js'
  import Icono from './componentes/comunes/Icono.svelte'
  import Spinner from './componentes/comunes/Spinner.svelte'
  import CampanaNotificaciones from './componentes/comunes/CampanaNotificaciones.svelte'

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
    if (navegacion.seccion === '/canales') return 'Canales'
    if (navegacion.seccion === '/dispositivos') return 'Dispositivos'
    if (navegacion.seccion === '/medios') return 'Medios'
    if (navegacion.seccion === '/asignar-medios') return 'Asignar medios'
    if (navegacion.seccion === '/asignar-canales') return 'Asignar canales'
    if (navegacion.seccion === '/notificaciones') return 'Notificaciones'
    if (navegacion.seccion === '/usuarios') return 'Usuarios'
    if (navegacion.seccion === '/publicadores') return 'Publicadores'
    if (navegacion.seccion === '/publicaciones') return 'Publicaciones'
    if (navegacion.seccion === '/moderacion') return 'Moderación'
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
    <Spinner />
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
          <Icono nombre="inicio" />
          <span>Inicio</span>
        </a>
        <a href="/canales" class:activa={navegacion.seccion === '/canales'}>
          <Icono nombre="canales" />
          <span>Canales</span>
        </a>
        <a href="/dispositivos" class:activa={navegacion.seccion === '/dispositivos'}>
          <Icono nombre="dispositivos" />
          <span>Dispositivos</span>
        </a>
        <a href="/medios" class:activa={navegacion.seccion === '/medios'}>
          <Icono nombre="medios" />
          <span>Medios</span>
        </a>
        <p class="grupo">Asignaciones</p>
        <a href="/asignar-medios" class:activa={navegacion.seccion === '/asignar-medios'}>
          <Icono nombre="medios" />
          <span>Asignar medios</span>
        </a>
        <a href="/asignar-canales" class:activa={navegacion.seccion === '/asignar-canales'}>
          <Icono nombre="canales" />
          <span>Asignar canales</span>
        </a>
        <p class="grupo">Usuarios</p>
        <a href="/usuarios" class:activa={navegacion.seccion === '/usuarios'}>
          <Icono nombre="usuarios" />
          <span>Usuarios</span>
        </a>
        <a href="/publicadores" class:activa={navegacion.seccion === '/publicadores'}>
          <Icono nombre="canales" />
          <span>Publicadores</span>
        </a>
        {#if tienePermiso('editar-contenido')}
          <p class="grupo">Contenido</p>
          <a href="/publicaciones" class:activa={navegacion.seccion === '/publicaciones'}>
            <Icono nombre="publicaciones" />
            <span>Publicaciones</span>
          </a>
          <!-- Etapa F: la moderación es por ROL (moderador/admin, RN-P13),
               no por permiso — igual que lo chequea el backend. -->
          {#if tieneRol('moderador', 'admin')}
            <a href="/moderacion" class:activa={navegacion.seccion === '/moderacion'}>
              <Icono nombre="ojo" />
              <span>Moderación</span>
            </a>
          {/if}
        {/if}
      </nav>
      <div class="pie">
        <div class="usuario">
          <span class="inicial">{sesion.usuario?.name?.charAt(0)?.toUpperCase() ?? '?'}</span>
          <span class="nombre">{sesion.usuario?.name}</span>
        </div>
        <button type="button" class="salir" onclick={salir}>
          <Icono nombre="salir" />
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
          <Icono nombre="menu" />
        </button>
        <span class="seccion-actual">{nombreSeccion}</span>
        <CampanaNotificaciones />
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
    background: var(--color-panel);
    border: 1px solid var(--color-borde);
    border-radius: var(--radio-boton);
    box-shadow: var(--sombra);
    padding: 0.5rem 1rem;
    color: var(--color-texto);
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
    color: var(--color-texto-suave);
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
    background: var(--color-panel);
    border-right: 1px solid var(--color-borde);
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1rem 0.75rem;
    z-index: 40;
    transform: translateX(-100%);
    transition: transform var(--transicion);
  }

  .lateral.abierta {
    transform: translateX(0);
    box-shadow: var(--sombra);
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

  /* Encabezado de grupo de navegación, como en la sidebar de referencia */
  .grupo {
    margin: 0 0 6px;
    padding: 0 0.75rem;
    font-size: 0.6875rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--color-texto-suave);
  }

  nav a {
    display: flex;
    align-items: center;
    gap: 0.65rem;
    padding: 0.5rem 0.75rem;
    border-radius: var(--radio-boton);
    color: var(--color-texto-medio);
    font-size: 0.875rem;
    font-weight: 500;
    text-decoration: none;
    transition:
      background-color var(--transicion),
      color var(--transicion);
  }

  nav a:hover {
    background: var(--color-gris-100);
    color: var(--color-texto);
  }

  /* Ítem activo: fondo suave + texto primary, como la sidebar del sistema */
  nav a.activa {
    background: var(--color-primario-suave);
    color: var(--color-primario-hover);
    font-weight: 600;
  }

  nav a:focus-visible {
    outline: 2px solid var(--color-primario);
    outline-offset: 1px;
  }

  .pie {
    border-top: 1px solid var(--color-borde);
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
    background: var(--color-primario-suave);
    color: var(--color-primario-hover);
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
    border-radius: var(--radio-boton);
    background: transparent;
    color: var(--color-texto-medio);
    font: inherit;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition:
      background-color var(--transicion),
      color var(--transicion);
  }

  .salir:hover {
    background: var(--color-gris-100);
    color: var(--color-texto);
  }

  .salir:focus-visible {
    outline: 2px solid var(--color-primario);
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
    background: var(--color-panel);
    border-bottom: 1px solid var(--color-borde);
    padding: 0.55rem 1rem;
  }

  .hamburguesa {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 2.25rem;
    height: 2.25rem;
    border: none;
    border-radius: var(--radio-boton);
    background: transparent;
    color: var(--color-texto-medio);
    cursor: pointer;
    transition:
      background-color var(--transicion),
      color var(--transicion);
  }

  .hamburguesa:hover {
    background: var(--color-gris-100);
    color: var(--color-texto);
  }

  .hamburguesa:focus-visible {
    outline: 2px solid var(--color-primario);
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
