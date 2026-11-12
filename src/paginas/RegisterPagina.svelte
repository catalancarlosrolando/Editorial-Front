<script>
  import { navigate } from "../router.js";
  import { sesion, iniciarSesion } from "../sesion.svelte.js";
  import { navegacion } from "../navegacion.svelte.js";
  import { register } from "../api/sesion.api.js";
  import Boton from "../componentes/comunes/Boton.svelte";
  import Campo from "../componentes/comunes/Campo.svelte";
  import AvisoVerificacionEmail from "../componentes/comunes/AvisoVerificacionEmail.svelte";

  let registrado = $state(false);

  // Esta página es pública: si ya hay sesión previa y no venimos de registrarnos, al inicio.
  $effect(() => {
    navegacion.seccion = "/register";
    if (sesion.token && !registrado) {
      navigate("/inicio");
    }
  });

  let firstName = $state("");
  let lastName = $state("");
  let name = $state("");
  let email = $state("");
  let password = $state("");
  let passwordConfirmation = $state("");

  let enviando = $state(false);
  let errores = $state({});
  let mensaje = $state("");

  // Normaliza errores a arrays para cada campo (esperado por Campo.svelte)
  function obtenerErroresCampo(campo) {
    const error = errores[campo];
    if (!error) return [];
    return Array.isArray(error) ? error : [error];
  }

  async function enviar(e) {
    e.preventDefault();
    enviando = true;
    errores = {};
    mensaje = "";

    if (password !== passwordConfirmation) {
      errores = { password_confirmation: ["Las contraseñas no coinciden."] };
      enviando = false;
      return;
    }

    try {
      const resultado = await register({
        first_name: firstName,
        last_name: lastName,
        name,
        email,
        password,
        password_confirmation: passwordConfirmation,
      });

      if (resultado.errores) {
        // Validación 422: errores por campo + mensaje global
        errores = resultado.errores;
        mensaje =
          resultado.mensaje ??
          "Revisá los datos ingresados e intentá de nuevo.";
        return;
      }

      // 201 exitoso: guardar token y datos de user (mismo mecanismo que el login)
      iniciarSesion(resultado);
      registrado = true;
    } catch (e) {
      mensaje = e.message?.startsWith("HTTP")
        ? "Ocurrió un error en el servidor (" + e.message + ")."
        : "No se pudo conectar con el backend. ¿Está corriendo en http://localhost:8080?";
    } finally {
      enviando = false;
    }
  }

  function irAlInicio() {
    navigate("/inicio");
  }
</script>

<svelte:head>
  <title>Registrarse · Editorial</title>
</svelte:head>

<div class="fondo">
  {#if registrado}
    <div class="tarjeta contenedor-exito">
      <div class="cabecera-exito">
        <div class="icono-check" aria-hidden="true">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="2"
            stroke="currentColor"
            width="32"
            height="32"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="m4.5 12.75 6 6 9-13.5"
            />
          </svg>
        </div>
        <h1>¡Cuenta creada con éxito!</h1>
        <p class="subtitulo">Tu usuario ha sido registrado en el sistema.</p>
      </div>

      <AvisoVerificacionEmail variante="tarjeta" {email} token={sesion.token} />

      <div class="acciones-finales">
        <Boton onclick={irAlInicio}>Continuar al panel de administración</Boton>
      </div>
    </div>
  {:else}
    <form class="tarjeta registro" onsubmit={enviar}>
      <h1>📰 Crear cuenta</h1>
      <p class="subtitulo">
        Completá tus datos para registrarte en el sistema.
      </p>

      <div class="fila-doble">
        <Campo
          id="register-first-name"
          tipo="text"
          etiqueta="Nombre"
          bind:valor={firstName}
          placeholder="Juan"
          requerido
          errores={obtenerErroresCampo("first_name")}
        />
        <Campo
          id="register-last-name"
          tipo="text"
          etiqueta="Apellido"
          bind:valor={lastName}
          placeholder="Pérez"
          requerido
          errores={obtenerErroresCampo("last_name")}
        />
      </div>

      <Campo
        id="register-name"
        tipo="text"
        etiqueta="Nombre de usuario"
        bind:valor={name}
        placeholder="juanperez"
        requerido
        errores={obtenerErroresCampo("name")}
      />

      <Campo
        id="register-email"
        tipo="email"
        etiqueta="Correo electrónico"
        bind:valor={email}
        placeholder="juan@ejemplo.com"
        requerido
        errores={obtenerErroresCampo("email")}
      />

      <Campo
        id="register-password"
        tipo="password"
        etiqueta="Contraseña"
        bind:valor={password}
        requerido
        errores={obtenerErroresCampo("password")}
      />

      <Campo
        id="register-password-confirmation"
        tipo="password"
        etiqueta="Confirmar contraseña"
        bind:valor={passwordConfirmation}
        requerido
        errores={obtenerErroresCampo("password_confirmation")}
      />

      {#if mensaje}
        <p class="mensaje-error" role="alert">{mensaje}</p>
      {/if}

      <Boton tipo="submit" deshabilitado={enviando}>
        {enviando ? "Creando cuenta…" : "Crear cuenta"}
      </Boton>

      <div class="pie-enlace">
        <span>¿Ya tenés una cuenta?</span>
        <a
          href="/login"
          onclick={(e) => {
            e.preventDefault();
            navigate("/login");
          }}
        >
          Iniciá sesión acá
        </a>
      </div>
    </form>
  {/if}
</div>

<style>
  .fondo {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1.5rem;
  }

  .registro {
    width: 100%;
    max-width: 28rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .contenedor-exito {
    width: 100%;
    max-width: 30rem;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    align-items: stretch;
  }

  .cabecera-exito {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 0.5rem;
  }

  .icono-check {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: #dcfce7;
    color: var(--color-exito-texto, #16a34a);
    margin-bottom: 0.25rem;
  }

  .subtitulo {
    color: var(--color-texto-suave);
    font-size: 0.875rem;
  }

  .fila-doble {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
  }

  @media (width < 30rem) {
    .fila-doble {
      grid-template-columns: 1fr;
    }
  }

  .mensaje-error {
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: var(--radio-campo);
    padding: 0.6rem 0.8rem;
    color: #b91c1c;
    font-size: 0.875rem;
  }

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

  .acciones-finales {
    display: flex;
    justify-content: center;
    margin-top: 0.5rem;
  }
</style>
