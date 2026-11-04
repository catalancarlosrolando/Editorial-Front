// Estado compartido para marcar en la barra de navegación la sección actual.
// Cada página "anuncia" su ruta al montarse (un $effect por página) y así
// App.svelte puede destacar el enlace activo sin depender de más API del router.
// (sv-router también ofrece route.pathname para esto; elegimos $state para
// quedarnos dentro del vocabulario del apunte.)
export const navegacion = $state({
  seccion: '/'
})
