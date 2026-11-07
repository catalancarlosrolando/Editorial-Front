<script>
  import Boton from './Boton.svelte'
  import AreaTexto from './AreaTexto.svelte'

  // Diálogo de confirmación CON motivo para las acciones que el backend
  // registra (rechazar, deshabilitar, eliminar, stop…): a diferencia de
  // window.confirm, acá el usuario puede (o debe, según motivoObligatorio)
  // escribir un motivo que viaja en onConfirmar(motivo). Los errores del
  // backend (422/403) llegan por la prop errores y se muestran bajo el campo,
  // con el diálogo abierto para que se corrija o se cancele.
  let {
    titulo,
    mensaje = '',
    textoConfirmar = 'Confirmar',
    peligroso = false,
    motivoObligatorio = false,
    ocupado = false,
    errores = [],
    onConfirmar,
    onCancelar
  } = $props()

  let motivo = $state('')
  let faltaMotivo = $state(false)

  function confirmar(e) {
    e.preventDefault()
    faltaMotivo = motivoObligatorio && motivo.trim() === ''
    if (faltaMotivo) return
    onConfirmar(motivo.trim())
  }

  // Escape cierra el diálogo (mientras no haya una operación en curso), con
  // la misma limpieza en $effect que el menú de acciones.
  $effect(() => {
    if (ocupado) return
    const cerrar = (e) => {
      if (e.key === 'Escape') onCancelar()
    }
    window.addEventListener('keydown', cerrar)
    return () => window.removeEventListener('keydown', cerrar)
  })
</script>

{#if !ocupado}
  <button type="button" class="velo" aria-label="Cerrar diálogo" onclick={onCancelar}></button>
{/if}
<div class="dialogo" role="dialog" aria-modal="true" aria-label={titulo}>
  <h2>{titulo}</h2>
  {#if mensaje}<p class="mensaje">{mensaje}</p>{/if}
  <form onsubmit={confirmar}>
    <AreaTexto
      id="motivo-confirmar"
      etiqueta={motivoObligatorio ? 'Motivo (obligatorio)' : 'Motivo (opcional)'}
      bind:valor={motivo}
      errores={errores}
      placeholder="Contá el motivo de la operación…"
    />
    {#if faltaMotivo}
      <p class="falta">El motivo es obligatorio para esta acción.</p>
    {/if}
    <div class="acciones">
      <Boton variante="neutra" deshabilitado={ocupado} onclick={onCancelar}>Cancelar</Boton>
      <Boton variante={peligroso ? 'peligrosa' : 'primaria'} tipo="submit" deshabilitado={ocupado}>
        {ocupado ? 'Aplicando…' : textoConfirmar}
      </Boton>
    </div>
  </form>
</div>

<style>
  .velo {
    position: fixed;
    inset: 0;
    z-index: 50;
    background: rgb(9 9 9 / 0.4);
    border: none;
    padding: 0;
    cursor: default;
  }

  /* El diálogo flota sobre TODO (incluida la sidebar, que es z-index 40) */
  .dialogo {
    position: fixed;
    z-index: 51;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: min(28rem, calc(100vw - 2rem));
    background: var(--color-panel);
    border: 1px solid var(--color-borde);
    border-radius: var(--radio-panel);
    box-shadow:
      var(--anillo),
      0 20px 25px -5px rgb(0 0 0 / 0.1),
      0 8px 10px -6px rgb(0 0 0 / 0.1);
    padding: 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .mensaje {
    color: var(--color-texto-medio);
    font-size: 0.875rem;
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .falta {
    color: var(--color-peligro-hover);
    font-size: 0.75rem;
    line-height: 1rem;
  }

  .acciones {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
    margin-top: 0.25rem;
  }
</style>
