<script>
  import { fade } from "svelte/transition";
  import { navigate } from "../router.js";
  import { sesion } from "../sesion.svelte.js";
  import { navegacion } from "../navegacion.svelte.js";
  import { useUsuarios } from "../hooks/useUsuarios.svelte.js";
  import Spinner from "../componentes/comunes/Spinner.svelte";
  import MensajeError from "../componentes/comunes/MensajeError.svelte";
  import Vacio from "../componentes/comunes/Vacio.svelte";
  import Paginador from "../componentes/comunes/Paginador.svelte";
  import Confirmar from "../componentes/comunes/Confirmar.svelte";
  import UsuariosFiltros from "../componentes/usuarios/UsuariosFiltros.svelte";
  import UsuariosListado from "../componentes/usuarios/UsuariosListado.svelte";
  import HistorialUsuario from "../componentes/usuarios/HistorialUsuario.svelte";
  import RolesUsuario from "../componentes/usuarios/RolesUsuario.svelte";
  import { DIALOGOS } from "../componentes/usuarios/etiquetas-roles-filtros-dialogos.js";

  const usuarios = useUsuarios();

  // Panel de detalle bajo los filtros (uno a la vez): null, o
  // { tipo: 'historial' | 'roles', usuario }.
  let panel = $state(null);

  // Diálogo Confirmar en vuelo: null o { accion, usuario }. La config de cada
  // acción vive acá: Rechazar y Deshabilitar exigen motivo (la UI es más
  // estricta que la API, donde reason es opcional).
  let dialogo = $state(null);

  $effect(() => {
    if (!sesion.token) {
      navigate("/login");
      return;
    }
    navegacion.seccion = "/usuarios";
    // Carga inicial SIN filtros: el hook recibe todo por parámetro para no
    // dejar que este efecto rastree (y re-dispare) su estado interno.
    usuarios.cargar(1, {});
  });

  // Filtrar o cambiar de página cierra el panel: sus datos podrían quedar viejos.
  function filtrar(filtros) {
    panel = null;
    usuarios.aplicarFiltros(filtros);
  }

  function cambiarPagina(pagina) {
    panel = null;
    usuarios.cambiarPagina(pagina);
  }

  function pedirConfirmacion(accion, usuario) {
    dialogo = { accion, usuario };
  }

  async function confirmarAccion(motivo) {
    const ok = await usuarios.cambiarEstado(
      dialogo.accion,
      dialogo.usuario,
      motivo,
    );
    if (ok) dialogo = null; // éxito: cerrar; con 422/403 queda abierto mostrando el motivo
  }

  function verHistorial(usuario) {
    panel = { tipo: "historial", usuario };
    usuarios.verHistorial(usuario);
  }

  function gestionarRoles(usuario) {
    panel = { tipo: "roles", usuario };
    usuarios.limpiarErroresRoles();
  }

  // El panel de roles muestra SIEMPRE el usuario fresco del listado: tras
  // asignar/revocar, el hook recarga la página y los roles se actualizan.
  const usuarioPanel = $derived(
    panel
      ? (usuarios.items.find((u) => u.id === panel.usuario.id) ?? panel.usuario)
      : null,
  );
</script>

<svelte:head>
  <title>Usuarios · Editorial Admin</title>
</svelte:head>

<div class="pagina">
  <div class="cabecera">
    <h1>Usuarios</h1>
  </div>

  <UsuariosFiltros onFiltrar={filtrar} />

  {#if panel?.tipo === "historial"}
    <HistorialUsuario
      usuario={panel.usuario}
      items={usuarios.historial?.items ?? []}
      cargando={usuarios.cargandoHistorial}
      error={usuarios.errorHistorial}
      onCerrar={() => (panel = null)}
    />
  {:else if panel?.tipo === "roles" && usuarioPanel}
    <RolesUsuario
      usuario={usuarioPanel}
      ocupado={usuarios.operando}
      error={usuarios.errorRoles}
      errores={usuarios.erroresRoles}
      onAsignar={(rol) => usuarios.asignarRol(usuarioPanel, rol)}
      onRevocar={(rol) => usuarios.revocarRol(usuarioPanel, rol)}
      onCerrar={() => (panel = null)}
    />
  {/if}

  {#if usuarios.mensaje}
    <p class="aviso" role="status" transition:fade>{usuarios.mensaje}</p>
  {/if}

  {#if usuarios.cargando}
    <div class="centrado">
      <Spinner />
    </div>
  {:else if usuarios.error}
    <MensajeError mensaje={usuarios.error} onReintentar={usuarios.reintentar} />
  {:else if usuarios.items.length === 0}
    <Vacio mensaje="No hay usuarios que coincidan con los filtros aplicados." />
  {:else}
    <UsuariosListado
      items={usuarios.items}
      operando={usuarios.operando}
      onVerHistorial={verHistorial}
      onGestionarRoles={gestionarRoles}
      onCambiarEstado={pedirConfirmacion}
    />
    <Paginador
      pagina={usuarios.paginaActual}
      ultimaPagina={usuarios.ultimaPagina}
      total={usuarios.total}
      cargando={usuarios.cargando}
      onCambiar={cambiarPagina}
    />
  {/if}
</div>

{#if dialogo}
  <!-- {#key} reinicia el motivo cada vez que se abre el diálogo con otro usuario/acción -->
  {#key dialogo}
    <Confirmar
      titulo={DIALOGOS[dialogo.accion].titulo}
      mensaje={`${dialogo.usuario.name}: ${DIALOGOS[dialogo.accion].aviso}`}
      textoConfirmar={DIALOGOS[dialogo.accion].texto}
      peligroso={DIALOGOS[dialogo.accion].peligroso}
      motivoObligatorio={DIALOGOS[dialogo.accion].obligatorio}
      ocupado={usuarios.operando}
      errores={usuarios.erroresDialogo}
      onConfirmar={confirmarAccion}
      onCancelar={() => (dialogo = null)}
    />
  {/key}
{/if}

<style>
  .aviso {
    background: #f0fdf4; /* success-50 */
    border: 1px solid #bbf7d0; /* success-200 */
    color: var(--color-exito-texto);
    border-radius: var(--radio-panel);
    padding: 0.75rem 1rem;
    font-size: 0.875rem;
  }
</style>
