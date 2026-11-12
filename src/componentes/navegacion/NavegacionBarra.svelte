<script>
  import Icono from "../comunes/Icono.svelte";
  import { navegacion } from "../../navegacion.svelte.js";
  let { tienePermiso, tieneRol } = $props();
</script>

<nav aria-label="Principal">
  <p class="grupo">Menu</p>
  <a href="/inicio" class:activa={navegacion.seccion === "/inicio"}>
    <Icono nombre="inicio" />
    <span>Inicio</span>
  </a>

  {#if tienePermiso("editar-contenido")}
    <p class="grupo">Contenido</p>
    <a
      href="/publicaciones"
      class:activa={navegacion.seccion === "/publicaciones"}
    >
      <Icono nombre="publicaciones" />
      <span>Publicaciones</span>
    </a>
  {/if}
  <!-- Etapa F: la moderación es por ROL (moderador/admin, RN-P13),
               no por permiso — igual que lo chequea el backend. -->
  {#if tieneRol("moderador")}
    <a href="/moderacion" class:activa={navegacion.seccion === "/moderacion"}>
      <Icono nombre="ojo" />
      <span>Moderación</span>
    </a>
  {/if}
  {#if tieneRol("admin")}
    <a href="/canales" class:activa={navegacion.seccion === "/canales"}>
      <Icono nombre="canales" />
      <span>Canales</span>
    </a>
    <a
      href="/dispositivos"
      Z
      class:activa={navegacion.seccion === "/dispositivos"}
    >
      <Icono nombre="dispositivos" />
      <span>Dispositivos</span>
    </a>
    <a href="/medios" class:activa={navegacion.seccion === "/medios"}>
      <Icono nombre="medios" />
      <span>Medios</span>
    </a>
    <p class="grupo">Asignaciones</p>
    <a
      href="/asignar-medios"
      class:activa={navegacion.seccion === "/asignar-medios"}
    >
      <Icono nombre="medios" />
      <span>Asignar medios</span>
    </a>
    <a
      href="/asignar-canales"
      class:activa={navegacion.seccion === "/asignar-canales"}
    >
      <Icono nombre="canales" />
      <span>Asignar canales</span>
    </a>
    <p class="grupo">Usuarios</p>
    <a href="/usuarios" class:activa={navegacion.seccion === "/usuarios"}>
      <Icono nombre="usuarios" />
      <span>Usuarios</span>
    </a>
    <a
      href="/publicadores"
      class:activa={navegacion.seccion === "/publicadores"}
    >
      <Icono nombre="canales" />
      <span>Publicadores</span>
    </a>
  {/if}
</nav>

<style>
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
</style>
