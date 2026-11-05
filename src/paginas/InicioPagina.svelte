<script>
  import { navigate } from "../router.js";
  import { sesion } from "../sesion.svelte.js";
  import { navegacion } from "../navegacion.svelte.js";

  // Página protegida: sin sesión no hay nada que ver acá.
  $effect(() => {
    if (!sesion.token) {
      navigate("/login");
      return;
    }
    navegacion.seccion = "/inicio";
  });
</script>

<svelte:head>
  <title>Inicio · Editorial Admin</title>
</svelte:head>

<div class="pagina">
  <h1>Hola{sesion.usuario?.name ? `, ${sesion.usuario.name}` : ""} 👋</h1>
  <p class="intro">Elegí una sección para administrar:</p>

  <div class="accesos">
    <a href="/canales" class="tarjeta acceso">
      <h2>Canales</h2>
      <p>CRUD completo: listar, crear, editar y eliminar.</p>
    </a>
    <a href="/dispositivos" class="tarjeta acceso">
      <h2>Dispositivos</h2>
      <p>Crear, listar con paginación y eliminar. Sin edición.</p>
    </a>
    <a href="/medios" class="tarjeta acceso">
      <h2>Medios</h2>
      <p>Consulta con filtros por tipo y nombre. Solo lectura.</p>
    </a>
  </div>
</div>

<style>
  .intro {
    color: var(--color-texto-suave);
    font-size: 0.875rem;
  }

  .accesos {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
    gap: 1rem;
  }

  .acceso {
    text-decoration: none;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    transition:
      border-color var(--transicion),
      transform var(--transicion);
  }

  .acceso:hover {
    border-color: var(--color-primario);
    transform: translateY(-2px);
  }

  .acceso h2 {
    font-size: 1.0625rem;
    color: var(--color-primario-hover);
  }

  .acceso p {
    color: var(--color-texto-suave);
    font-size: 0.875rem;
  }
</style>
