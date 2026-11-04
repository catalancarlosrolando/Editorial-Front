<script>
  import { navigate } from '../router.js'
  import { sesion } from '../sesion.svelte.js'
  import { navegacion } from '../navegacion.svelte.js'

  // Página protegida: sin sesión no hay nada que ver acá.
  $effect(() => {
    if (!sesion.token) {
      navigate('/login')
      return
    }
    navegacion.seccion = '/inicio'
  })
</script>

<svelte:head>
  <title>Inicio · Editorial Admin</title>
</svelte:head>

<div class="pagina">
  <h1>Hola{sesion.usuario?.name ? `, ${sesion.usuario.name}` : ''} 👋</h1>
  <p class="intro">
    Acá vas a administrar las secciones del sistema. El menú va a ir creciendo
    a medida que agreguemos funcionalidad.
  </p>
</div>

<style>
  .pagina h1 {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
  }

  .intro {
    color: #71717a;
    font-size: 0.9375rem;
    max-width: 60ch;
  }
</style>
