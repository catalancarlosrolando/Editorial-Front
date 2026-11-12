<script>
  import Boton from "../comunes/Boton.svelte";
  import Seleccion from "../comunes/Seleccion.svelte";
  import { ROLES } from "./etiquetas-roles-filtros-dialogos.js";

  // Panel de roles de un usuario: asignar (cualquier rol de la spec) y revocar
  // (solo los que ya tiene). Solo presentación: los errores del backend llegan
  // listos desde el hook — error es el 403 de auto-protección (RN-U04) y
  // errores los mensajes 422 por campo.
  let {
    usuario,
    ocupado = false,
    error = "",
    errores = [],
    onAsignar,
    onRevocar,
    onCerrar,
  } = $props();

  let rolAsignar = $state("");
  let rolRevocar = $state("");

  // Opciones del <select> de revocar: SOLO los roles actuales del usuario.
  const rolesActuales = $derived(
    (usuario.roles ?? []).map((rol) => ({ value: rol, label: rol })),
  );

  function asignar(e) {
    e.preventDefault();
    if (!rolAsignar) return;
    onAsignar(rolAsignar);
    rolAsignar = ""; // estado del formulario predecible: limpio tras cada intento
  }

  function revocar(e) {
    e.preventDefault();
    if (!rolRevocar) return;
    onRevocar(rolRevocar);
    rolRevocar = "";
  }
</script>

<div class="tarjeta panel">
  <div class="cabecera-panel">
    <h2>Roles de {usuario.name}</h2>
    <Boton variante="neutra" onclick={onCerrar}>Cerrar</Boton>
  </div>

  {#if error}
    <p class="error-panel">⚠️ {error}</p>
  {/if}
  {#each errores as mensaje (mensaje)}
    <p class="error-panel">{mensaje}</p>
  {/each}

  <div class="columnas">
    <form onsubmit={asignar}>
      <Seleccion
        id="rol-asignar"
        etiqueta="Asignar rol"
        bind:valor={rolAsignar}
        opciones={ROLES}
        textoVacio="Elegí un rol…"
      />
      <Boton tipo="submit" deshabilitado={ocupado || !rolAsignar}>Asignar</Boton
      >
    </form>
    <form onsubmit={revocar}>
      <Seleccion
        id="rol-revocar"
        etiqueta="Revocar rol"
        bind:valor={rolRevocar}
        opciones={rolesActuales}
        textoVacio="Elegí un rol…"
      />
      <Boton
        tipo="submit"
        variante="peligrosa"
        deshabilitado={ocupado || !rolRevocar}>Revocar</Boton
      >
    </form>
  </div>

  {#if (usuario.roles ?? []).length === 0}
    <p class="sin-roles">El usuario no tiene ningún rol.</p>
  {/if}
</div>

<style>
  .cabecera-panel {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }

  .error-panel {
    color: var(--color-peligro-hover);
    font-size: 0.875rem;
  }

  .columnas {
    display: flex;
    gap: 1.5rem;
    flex-wrap: wrap;
  }

  form {
    display: flex;
    align-items: end;
    gap: 0.5rem;
    flex: 1;
    min-width: 14rem;
  }

  form :global(.campo) {
    flex: 1;
  }

  .sin-roles {
    color: var(--color-texto-suave);
    font-size: 0.875rem;
  }
</style>
