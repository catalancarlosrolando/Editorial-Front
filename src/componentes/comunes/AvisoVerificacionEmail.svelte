<script>
  import { sesion } from '../../sesion.svelte.js'
  import { reenviarEmailVerificacion } from '../../api/sesion.api.js'

  let {
    variante = 'banner', // 'banner' | 'tarjeta' | 'vista'
    email = '',
    token = ''
  } = $props()

  let enviando = $state(false)
  let mensajeExito = $state('')
  let mensajeError = $state('')

  const correoDestino = $derived(email || sesion.usuario?.email || '')
  const tokenActual = $derived(token || sesion.token || '')

  async function reenviar() {
    if (enviando) return
    if (!tokenActual) {
      mensajeError = 'No se encontró una sesión activa para reenviar el correo.'
      return
    }

    enviando = true
    mensajeExito = ''
    mensajeError = ''

    try {
      const res = await reenviarEmailVerificacion(tokenActual)
      if (res.errores) {
        const detalles = Object.values(res.errores).flat().join(' ')
        mensajeError = detalles || res.mensaje || 'Error al reenviar el correo de verificación.'
      } else {
        mensajeExito = res.mensaje || '¡Correo de verificación reenviado con éxito! Por favor revisá tu casilla.'
      }
    } catch (e) {
      if (e.message === 'SESION_INVALIDA') {
        mensajeError = 'Tu sesión ha expirado. Por favor, volvé a iniciar sesión.'
      } else {
        mensajeError = e.message || 'No se pudo conectar con el servidor. Intentá de nuevo.'
      }
    } finally {
      enviando = false
    }
  }
</script>

{#if variante === 'banner'}
  <div class="contenedor-banner">
    <div class="banner-aviso" role="region" aria-label="Aviso de verificación de correo">
      <div class="info">
        <span class="icono-alerta" aria-hidden="true">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.7" stroke="currentColor" width="20" height="20">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
          </svg>
        </span>
        <p class="texto">
          <strong>Verifica tu correo electrónico:</strong>
          {#if correoDestino}
            Enviamos un enlace a <strong>{correoDestino}</strong> para activar tu cuenta.
          {:else}
            Tu cuenta aún no está verificada.
          {/if}
        </p>
      </div>

      <div class="acciones">
        <button
          type="button"
          class="btn-reenviar"
          disabled={enviando}
          onclick={reenviar}
        >
          {enviando ? 'Reenviando…' : 'Reenviar correo de verificación'}
        </button>
      </div>
    </div>

    {#if mensajeExito}
      <div class="alerta feedback-exito" role="status">
        <span class="icono-check" aria-hidden="true">✓</span>
        <span>{mensajeExito}</span>
      </div>
    {/if}

    {#if mensajeError}
      <div class="alerta feedback-error" role="alert">
        <span class="icono-cruz" aria-hidden="true">✕</span>
        <span>{mensajeError}</span>
      </div>
    {/if}
  </div>
{:else}
  <!-- Variante tarjeta / vista -->
  <div class="tarjeta-aviso" role="region" aria-label="Verificación de correo electrónico">
    <div class="icono-sobre" aria-hidden="true">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="40" height="40">
        <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
      </svg>
    </div>

    <h2>Verifica tu correo electrónico</h2>
    <p class="descripcion">
      {#if correoDestino}
        Hemos enviado un correo a <strong>{correoDestino}</strong>. Por favor, revisá tu bandeja de entrada o carpeta de spam y hacé clic en el enlace para validar tu dirección.
      {:else}
        Por favor verificá tu dirección de correo electrónico para acceder a todas las funciones del sistema.
      {/if}
    </p>

    {#if mensajeExito}
      <div class="alerta feedback-exito" role="status">
        <span class="icono-check" aria-hidden="true">✓</span>
        <span>{mensajeExito}</span>
      </div>
    {/if}

    {#if mensajeError}
      <div class="alerta feedback-error" role="alert">
        <span class="icono-cruz" aria-hidden="true">✕</span>
        <span>{mensajeError}</span>
      </div>
    {/if}

    <div class="acciones-tarjeta">
      <button
        type="button"
        class="btn-reenviar-destacado"
        disabled={enviando}
        onclick={reenviar}
      >
        {enviando ? 'Reenviando…' : 'Reenviar correo de verificación'}
      </button>
    </div>
  </div>
{/if}

<style>
  /* ══ Variante Banner ══ */
  .contenedor-banner {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    background: #fffbeb;
    border-bottom: 1px solid #fde68a;
  }

  .banner-aviso {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    flex-wrap: wrap;
    color: #92400e;
    font-size: 0.875rem;
  }

  .info {
    display: flex;
    align-items: center;
    gap: 0.6rem;
  }

  .icono-alerta {
    display: flex;
    align-items: center;
    color: #d97706;
    flex-shrink: 0;
  }

  .texto {
    line-height: 1.4;
  }

  .btn-reenviar {
    background: #ffffff;
    color: #92400e;
    border: 1px solid #fcd34d;
    border-radius: var(--radio-boton, 6px);
    padding: 0.35rem 0.75rem;
    font: inherit;
    font-size: 0.8125rem;
    font-weight: 600;
    cursor: pointer;
    transition: background-color var(--transicion, 150ms), border-color var(--transicion, 150ms);
    white-space: nowrap;
  }

  .btn-reenviar:hover:not(:disabled) {
    background: #fef3c7;
    border-color: #f59e0b;
  }

  .btn-reenviar:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  /* ══ Feedback Visual ══ */
  .alerta {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    border-radius: var(--radio-campo, 8px);
    font-size: 0.8125rem;
    line-height: 1.25rem;
  }

  .feedback-exito {
    background: #f0fdf4;
    border: 1px solid #bbf7d0;
    color: #166534;
  }

  .icono-check {
    font-weight: 700;
  }

  .feedback-error {
    background: #fef2f2;
    border: 1px solid #fecaca;
    color: #991b1b;
  }

  .icono-cruz {
    font-weight: 700;
  }

  /* ══ Variante Tarjeta / Vista ══ */
  .tarjeta-aviso {
    background: var(--color-panel, #ffffff);
    border: 1px solid var(--color-borde, #e4e4e7);
    border-radius: var(--radio-panel, 12px);
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 0.875rem;
  }

  .icono-sobre {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background: #eff6ff;
    color: var(--color-primario, #3b82f6);
  }

  .descripcion {
    font-size: 0.875rem;
    color: var(--color-texto-medio, #52525b);
    max-width: 28rem;
    line-height: 1.5;
  }

  .acciones-tarjeta {
    margin-top: 0.5rem;
    width: 100%;
    display: flex;
    justify-content: center;
  }

  .btn-reenviar-destacado {
    background: var(--color-primario, #3b82f6);
    color: #ffffff;
    border: 1px solid transparent;
    border-radius: var(--radio-boton, 6px);
    padding: 0.6rem 1.25rem;
    font: inherit;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color var(--transicion, 150ms);
  }

  .btn-reenviar-destacado:hover:not(:disabled) {
    background: var(--color-primario-hover, #2563eb);
  }

  .btn-reenviar-destacado:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
</style>

