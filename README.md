# Editorial Admin — CRUD con Svelte 5 + sv-router

SPA de administración que inicia sesión contra un backend Laravel (Sanctum, token
Bearer) y consume su API REST con `fetch`. Proyecto de la materia FrontEnd:
**Vite puro + Svelte 5** (no SvelteKit), **JavaScript vanilla**, ruteo del lado
cliente con **sv-router en modo code-based** y estado exclusivamente con **runas**
(`$state`, `$derived`, `$effect`) — sin stores, sin TypeScript.

## Correr el proyecto

```bash
npm install
npm run dev
```

## Estructura

```
src/
  main.js                  → mount(App, { target }) (lo genera Vite)
  App.svelte               → layout dashboard: sidebar + topbar con hamburguesa + <Router />
                             + validación del token al abrir
  router.js                → createRouter({ '/': ..., '/login': ... }) · exporta navigate
  config.js                → BASE_URL = 'http://localhost:8080/api'
  sesion.svelte.js         → usuario + token compartidos con $state + localStorage (§6.2)
  navegacion.svelte.js     → estado compartido para el enlace activo de la barra
  errores.js               → traduce errores técnicos a mensajes entendibles
  api/                     → capa de red: un archivo por modelo, solo fetch
    sesion.api.js          → login(), usuarioActual(), logout()
    canales.api.js         → listar/crear/actualizar/eliminar + tipos()
    dispositivos.api.js    → listar (paginado) / crear / eliminar
    medios.api.js          → listar (filtros) + tipos()
  useCanales.svelte.js     → hook: estado ($state) + funciones que llaman a la api
  useDispositivos.svelte.js
  useMedios.svelte.js
  componentes/             → SOLO presentación: nunca llaman a fetch
    comunes/               → Boton, Campo, AreaTexto, Seleccion, Casilla, Icono (SVG
                             inline), MenuAcciones (menú "⋮" de fila), Spinner,
                             MensajeError (mensaje + onReintentar), Vacio
    canales/               → CanalesListado → CanalFila · CanalForm (dual crear/editar)
    dispositivos/          → DispositivosListado → DispositivoFila · DispositivoForm
                             · DispositivosPaginado (Anterior/Siguiente)
    medios/                → MediosFiltros · MediosListado → MedioFila
  paginas/                 → componen hooks + componentes; las únicas en router.js
    LoginPagina.svelte · InicioPagina.svelte · CanalesPagina.svelte
    DispositivosPagina.svelte · MediosPagina.svelte
```


## Design System


- **Tokens en `src/app.css`**: colores semánticos (primary blue-500/600, danger
  red-500/600, success, warning), grises Zinc (body `gray-50`, paneles blancos,
  divisores `gray-200`, labels `gray-500`, texto `gray-950`), radios (botones 6px ·
  inputs 8px · paneles 12px), el combo panel `ring 1px 5% + sombra suave`, motion
  (transición global 150ms `cubic-bezier(.4,0,.2,1)` · hover de fila 75ms) y la
  tipografía **Albert Sans** vía Bunny Fonts (con fallback al stack del sistema).
- **Escala tipográfica**: cuerpo de tablas/inputs/labels en **14px/20px**, H1 de
  página 24px/32px/700, badges 12px.
- **Badges**: fondo 50 + borde 200 + texto 700 (Activo/Inactivo verdes y rojos,
  tipos en gris neutro).
- **Botones**: primario (azul), peligroso (rojo) y neutro (blanco con borde);
  focus visible con anillo primary.
- **Inputs**: foco con borde primary + halo 3px al 15%; borde `danger` + halo rojo
  cuando el campo tiene errores de validación (422).
- **⭐ Patrón responsive tabla→cards**: una sola estructura DOM por fila — cada
  `<td>` lleva su `<span class="celda-etiqueta">`. Con `@media (width < 40rem)` la
  tabla se apila en tarjetas (thead oculto, labels visibles, acciones al pie) y
  desde 640px es la tabla clásica con hover suave. Los tres listados lo comparten
  vía las clases globales `.tabla` / `.envoltura-tabla` / `.celda-etiqueta`.
- **Accesibilidad**: skip-link "Saltar al contenido", `nav aria-label`, labels
  `for` en todos los campos, `role="alert"` en errores, focus visible en botones
  y enlaces.
- **Layout dashboard**: sidebar fija de 320px (≥1024px) con marca, grupo de
  navegación, ítem activo y pie con usuario + Salir. En tablet y mobile la
  sidebar es off-canvas: se abre con el botón hamburguesa de la topbar, con velo
  oscuro de fondo, y se cierra al navegar (un `$effect` reacciona al cambio de
  sección) o al tocar el velo. La topbar muestra siempre la sección actual.
- **Menú de desbordamiento "⋮"** (`MenuAcciones`): las acciones de fila (Editar /
  Eliminar) viven en un dropdown disparado por el botón de tres puntos verticales,
  con `aria-haspopup`/`aria-expanded`, opciones con icono, y cierre por click
  afuera (velo invisible), Escape o scroll — este último con la función de
  limpieza del `$effect` (patrón del apunte). El panel se dibuja con
  `position: fixed` anclado al borde del botón (se mide con
  `getBoundingClientRect`) para no quedar recortado por el scroll interno de la
  tabla; si no entra hacia abajo, se abre hacia arriba.

