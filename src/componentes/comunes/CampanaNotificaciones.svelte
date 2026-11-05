<script>
  import Icono from './Icono.svelte'
  import { sesion } from '../../sesion.svelte.js'
  import { useNotificaciones } from '../../hooks/useNotificaciones.svelte.js'

  // La campana es el único lugar que necesita el conteo EN VIVO. Como el estado
  // del hook es compartido (vive a nivel de módulo), si la página /notificaciones
  // marca algo como leído, este badge se actualiza al instante.
  const notificaciones = useNotificaciones()

  // Polling del conteo cada 30 s, SOLO con sesión activa: el $effect lee
  // sesion.token (reacciona al login/logout) y devuelve clearInterval como
  // teardown (apunte §4.3): al desmontar la campana no queda el intervalo
  // colgado pidiendo el conteo para siempre (sin fugas).
  $effect(() => {
    if (!sesion.token) return
    notificaciones.cargarConteo()
    const intervalo = setInterval(() => notificaciones.cargarConteo(), 30000)
    return () => clearInterval(intervalo)
  })
</script>

<a
  href="/notificaciones"
  class="campana"
  aria-label={notificaciones.noLeidas > 0
    ? `Notificaciones (${notificaciones.noLeidas} sin leer)`
    : 'Notificaciones'}
>
  <Icono nombre="campana" />
  {#if notificaciones.noLeidas > 0}
    <!-- aria-hidden: el count ya está en el aria-label del enlace -->
    <span class="contador" aria-hidden="true">{notificaciones.noLeidas}</span>
  {/if}
</a>

<style>
  .campana {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 2.25rem;
    height: 2.25rem;
    border-radius: var(--radio-boton);
    color: var(--color-texto-medio);
    /* En la topbar queda alineada a la derecha del resto del contenido */
    margin-left: auto;
    transition:
      background-color var(--transicion),
      color var(--transicion);
  }

  .campana:hover {
    background: var(--color-gris-100);
    color: var(--color-texto);
  }

  .campana:focus-visible {
    outline: 2px solid var(--color-primario);
    outline-offset: 2px;
  }

  .contador {
    position: absolute;
    top: 0;
    right: 0;
    min-width: 1rem;
    height: 1rem;
    padding: 0 4px;
    border-radius: 999px;
    background: var(--color-peligro);
    color: #fff;
    font-size: 0.625rem;
    font-weight: 700;
    line-height: 1rem;
    text-align: center;
  }
</style>
