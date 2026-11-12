# 📰 Editorial Admin

**Panel de administración web (SPA) para una plataforma editorial multicanal.**
Aplicación de una sola página construida íntegramente en el cliente con **Svelte 5**, que centraliza la gestión de canales, dispositivos, medios, publicaciones y su ciclo de vida editorial, la moderación de contenido, la administración de usuarios y las notificaciones.

> **Nota de alcance:** este documento describe **únicamente el frontend**. No documenta la superficie de la API (endpoints, rutas ni estructura del servidor): esa información se gestiona en el repositorio del backend y a propósito no se replica acá.

---

## 📑 Índice

1. [Problemas que resuelve](#-problemas-que-resuelve)
2. [Funcionalidades](#-funcionalidades)
3. [Tecnologías](#-tecnologías)
4. [¿Por qué Svelte y no SvelteKit?](#-por-qué-svelte-y-no-sveltekit)
5. [Arquitectura](#-arquitectura)
6. [Estructura de archivos](#-estructura-de-archivos)
7. [Seguridad en el cliente](#-seguridad-en-el-cliente)
8. [Design system](#-design-system)
9. [Accesibilidad y responsive](#-accesibilidad-y-responsive)
10. [Puesta en marcha](#-puesta-en-marcha)
11. [Trabajo futuro](#-trabajo-futuro)

---

## 🧩 Problemas que resuelve

Un equipo editorial publica contenido en paralelo hacia múltiples superficies (pantallas físicas, redes sociales, plataformas editoriales) y necesita un lugar único donde administrar todo eso sin depender de operaciones manuales sobre la base de datos. Este panel resuelve, concretamente:

- **Gestión centralizada del ecosistema**: alta, edición y baja de canales y dispositivos, y consulta filtrable de medios, desde una sola interfaz consistente.
- **Relaciones muchos-a-muchos sin fricción**: asignar medios a un canal, canales a un dispositivo o canales a un usuario publicador, con un componente de doble columna (*transfer list*) que muestra siempre lo disponible y lo ya asignado.
- **Ciclo de vida editorial controlado**: una publicación avanza por estados (borrador → revisión → aprobada → programada/publicada → archivada) y la UI solo ofrece las transiciones válidas según el estado actual, la autoría del usuario y su rol.
- **Moderación ordenada**: los revisores atienden una cola FIFO de publicaciones pendientes y pueden aprobar, rechazar (con comentario obligatorio) o detener contenido ya publicado.
- **Control de acceso legible**: la navegación, los botones y las páginas se adaptan a los permisos y roles del usuario que inició sesión, evitando ofrecer acciones que igualmente serían rechazadas.
- **Experiencia predecible ante el error**: todo listado distingue carga, error (con reintento), vacío y datos; los errores de validación se muestran campo por campo junto a cada input; los errores técnicos se traducen a mensajes que una persona entiende.
- **Consistencia visual y de comportamiento**: un design system propio (tokens CSS compartidos) y patrones repetidos en los 14 módulos — la misma gramática de UI en toda la aplicación.

---

## ✨ Funcionalidades

### Acceso y cuenta
- **Iniciar sesión** con correo y contraseña; casilla *Recordarme* para una sesión más larga que la por defecto.
- **Recuperación de contraseña**: modal *¿Olvidaste tu contraseña?* que envía un correo con el enlace de restablecimiento.
- **Restablecer contraseña** desde el enlace recibido (la página toma token y correo de la URL) y redirige sola al login al terminar.
- **Registro público** de nuevas cuentas, con verificación por correo: mientras el correo no esté verificado, la aplicación muestra un aviso persistente en todas las pantallas.
- **Cerrar sesión** desde la barra lateral; si la petición de salida falla, el cierre local igualmente se completa (lo importante es limpiar el cliente).

### Administración (rol admin)
- **Canales** — CRUD completo: listado, creación, edición en la misma página y eliminación con confirmación. Los tipos de canal se cargan dinámicamente en el formulario (nada hardcodeado).
- **Dispositivos** — alta con solo marcar si está activo (el identificador único lo genera el sistema y se muestra tras crear), listado **paginado** y baja.
- **Medios** — consulta de solo lectura con **filtros combinables** por tipo y búsqueda por nombre.
- **Asignaciones** — relaciones N:M: medios ↔ canal y canales ↔ dispositivo, con `TransferList` de doble columna.
- **Usuarios** — administración con filtros recombinables (rol, estado, correo, nombre, DNI, rangos de fechas de registro y último acceso, orden por campo y sentido), paginación, acciones de ciclo de vida (aprobar / rechazar / habilitar / deshabilitar, las críticas con **motivo obligatorio**), asignación y revocación de roles, e historial de acciones por usuario.
- **Publicadores** — asignación de canales a cada usuario publicador con el mismo `TransferList`.

### Contenido (permiso editar-contenido)
- **Publicaciones** — listado con hasta 14 filtros recombinables (búsqueda de texto, estado, tipo, autor, tres rangos de fechas, con/sin adjuntos, orden, tamaño de página) + **detalle expandible por fila** (se pide al abrir la fila, con su propio estado de carga/error).
- **Crear y editar** con formulario dual y **selects en cascada**: primero se cargan los canales autorizados del usuario; al marcar canales se recargan los medios disponibles de esa selección, y al desmarcar un canal sus medios quedan fuera automáticamente.
- **Adjuntos** — subida de archivos (imágenes, video, audio y PDF) validada en el cliente: máximo 10 archivos × 10 MB por operación y tipos permitidos, con aviso inmediato antes de enviar nada.
- **Ciclo de vida** — enviar a revisión, revertir a borrador, archivar (con confirmación), desarchivar, detener publicación y eliminar con motivo. Cada acción aparece **solo** si el estado, la autoría y el rol del usuario lo permiten.
- **Moderación** (rol moderador o admin) — cola FIFO de publicaciones pendientes: aprobar con comentario opcional (si tiene fecha programada queda programada; si no, publicada), rechazar con comentario obligatorio (vuelve a borrador) y detener una publicación ya publicada (confirmación + motivo). El enlace solo es visible con el rol correspondiente.

### Notificaciones
- **Campana en la barra superior** con badge de no leídas que se **autorefresca cada 30 segundos** (polling con limpieza garantizada del intervalo al desmontar o cerrar sesión).
- **Página de notificaciones**: marcar como leída, marcar todas y eliminar; las acciones de la página actualizan el badge al instante porque campana y página comparten el mismo estado.

---

## 🛠 Tecnologías

| Tecnología | Uso | Por qué |
|---|---|---|
| **Svelte 5** (runas `$state`, `$derived`, `$effect`) | Todo el estado y la reactividad | Compilador, no runtime: el bundle es chico y la reactividad es explícita, sin librerías de estado |
| **Vite** | Dev server y build | Arranque instantáneo y `dist/` estático servible desde cualquier hosting |
| **sv-router** (modo *code-based*) | Ruteo SPA del lado cliente | Única dependencia de runtime: rutas declaradas en un objeto, explícitas y auditables |
| **JavaScript vanilla (ESM)** | Todo el código | Sin TypeScript a propósito: menos capas entre el código y lo que corre |
| **`fetch` nativo** | Comunicación HTTP | Sin axios ni SDKs; headers, errores y abortos se manejan a mano |
| **`FormData` / `URLSearchParams`** | Adjuntos y filtros | APIs estándar del navegador, sin dependencias |
| **CSS con custom properties** | Estilos | `<style>` scoped por componente + tokens globales; sin framework de estilos |

**Conteo del proyecto**: 14 páginas · 45 componentes · 8 hooks · 9 módulos de API · 1 sola dependencia de runtime.

---

## 🤔 ¿Por qué Svelte y no SvelteKit?

El proyecto **es una SPA clásica** y eso decide el stack:

1. **Todo ocurre en el cliente.** El ruteo, el estado y la sesión viven en el navegador; la comunicación con el servidor es por token portador en cada pedido. SvelteKit está pensado para lo contrario: renderizado en servidor (SSR), prerendering, hidratación y adaptadores de despliegue — capas que este proyecto no usa y que, si entraran, obligarían a pelear contra el modelo de SSR para manejar una sesión por token.
2. **Ruteo plano y explícito.** SvelteKit impone routing por archivos (`+page.svelte`, `load`, form actions). Acá el ruteo es una tabla declarada en `router.js` con `createRouter`: se lee de un vistazo, cada entrada es una página y no hay convenciones implícitas que defender.
3. **Despliegue trivial.** `npm run build` genera un `dist/` estático: HTML + JS + CSS sin proceso de servidor propio. Con SvelteKit el despliegue tendría runtime de servidor o adaptador específico.
4. **Superficie mínima de conceptos.** Con Svelte 5 puro, el manejo de estado completo se resuelve con las tres runas y archivos `.svelte.js` para estado compartido: no hace falta ni `svelte/store` ni librerías externas. Cada concepto del código es directamente explicable.
5. **Guard de sesión simple.** En una SPA, proteger rutas es verificar la sesión al montar y redirigir; con SSR habría que coordinar la sesión entre servidor y cliente. Menos movimientos, menos chances de equivocarse.

En resumen: SvelteKit es la herramienta correcta cuando el servidor participa del render; este panel deliberadamente no lo necesita.

---

## 🏛 Arquitectura

### Separación en capas

Cada archivo tiene un único trabajo y las capas no se mezclan:

| Capa | Carpeta | Responsabilidad | Regla |
|---|---|---|---|
| Páginas | `src/paginas/` | Componen hooks + componentes de presentación; son lo único que registra el router | No contienen lógica de negocio repetible |
| Hooks | `src/hooks/` | Estado (`$state`) + lógica: cargar, filtrar, guardar, transicionar | Traducen respuestas a estados de UI |
| API | `src/api/` | `fetch`, headers, normalización de respuestas y errores de validación | No importa Svelte ni toca el DOM |
| Presentación | `src/componentes/` | Render puro | **Nunca** llama a `fetch`; solo recibe props y dispara callbacks |

### Flujo de datos y composición

La comunicación entre componentes sigue siempre las mismas tres direcciones:

```
        usuario interactúa
               │
               ▼
      paginas/*.svelte  ──── compone ───►  componentes/*.svelte
               │                            ▲   props (datos) ↓
               │ usa                        │   callback props (eventos) ↑
               ▼                            │   snippets / children (contenido)
      hooks/useX.svelte.js                  │
               │ llama                      │
               ▼                            │
         api/x.api.js  ── fetch ──►  respuesta
               │
               ▼
      estado ($state) ──► re-render declarativo
```

- **Datos hacia abajo** por props; **eventos hacia arriba** por callback props (`onGuardar`, `onEliminar`, `onCambiar`…); **contenido** por snippets y `children`.
- Los formularios son **duales**: el mismo componente sirve para crear y editar (recibe `inicial` opcional y callbacks `onGuardar` / `onCancelar`).
- El estado realmente global se resuelve con `$state` exportado desde archivos `.svelte.js` (sesión, navegación activa, notificaciones), sin stores.

### Patrones transversales

- **Los 4 estados de todo listado**: cargando / error con botón *Reintentar* / vacío (un resultado vacío **no** es error) / datos. Aplicado de forma idéntica en los 14 módulos.
- **Errores con su propio lugar**: cada origen de error tiene su estado — el error de carga del listado no es el mismo que el del detalle, ni el de validación por campo (422) que el de permisos (403). Los errores que ocurren dentro de un diálogo se muestran bajo el campo correspondiente y el diálogo queda abierto para corregir.
- **Guardias anti-carrera**: los pedidos llevan un contador (`pedido++; const mio = pedido`); si llegan respuestas desordenadas, la vieja se descarta y no pisa el estado nuevo — imprescindible cuando los filtros pueden cambiarse rápido.
- **Feedback durante operaciones**: los botones se deshabilitan (`disabled={cargando}`) mientras hay una operación en vuelo; en las filas, el menú de acciones completo se deshabilita con el `id` del registro en proceso.
- **Traducción de errores técnicos a UX**: una función central (`errores.js`) convierte fallos de red, 403, 404 y 500 en mensajes accionables; el error de sesión inválida se trata aparte (ver [Seguridad](#-seguridad-en-el-cliente)).
- **Listados con clave estable**: `{#each items as item (item.id)}` — nunca por índice, para que el DOM no se recicle de forma incorrecta al filtrar o paginar.

### Sesión en un vistazo

```
login  ──► iniciarSesion() ──► estado compartido + persistencia local
abrir la app ──► validar el token UNA vez antes de renderizar
cualquier 401 ──► cerrarSesion() + navigate('/login')   (centralizado en los hooks)
```

---

## 🗂 Estructura de archivos

```
editorial-admin/
├── index.html                  Punto de montaje de la SPA (único HTML)
├── package.json                Scripts y dependencias (1 dependencia de runtime)
├── vite.config.js              Build: plugin de Svelte (y lugar del proxy dev, si hace falta)
├── jsconfig.json               Editor: resolución de módulos y mapeo de errores
└── src/
    ├── main.js                 mount(App) — entry point
    ├── App.svelte              Layout: sidebar + topbar + campana + <Router />
    ├── router.js               createRouter({...}) — tabla de rutas completa
    ├── app.css                 Design system: tokens, reset y maquetación compartida
    ├── config.js               Constante BASE_URL (ÚNICO lugar a configurar)
    ├── errores.js              Errores técnicos → mensajes de usuario
    ├── sesion.svelte.js        Sesión global: usuario, token, permisos y roles
    ├── navegacion.svelte.js    Sección activa (enlace destacado en la sidebar)
    │
    ├── api/                    Capa de acceso a datos (fetch + normalización)
    │   ├── sesion.api.js         login · registro · recuperación · sesión actual · logout
    │   ├── canales.api.js        CRUD de canales + tipos
    │   ├── dispositivos.api.js   alta · listado paginado · baja
    │   ├── medios.api.js         consulta con filtros + tipos
    │   ├── asignaciones.api.js   relaciones N:M (medios/canales/usuarios)
    │   ├── usuarios.api.js       listado filtrable · estados · roles · historial
    │   ├── publicaciones.api.js  listado · detalle · crear/editar · transiciones · baja
    │   ├── moderacion.api.js     cola de revisión · aprobar · rechazar · detener
    │   └── notificaciones.api.js listado · conteo · leída · todas · eliminar
    │
    ├── hooks/                  Capa de estado y lógica (un hook por dominio)
    │   ├── useCanales.svelte.js      useDispositivos.svelte.js
    │   ├── useMedios.svelte.js       useAsignaciones.svelte.js
    │   ├── useUsuarios.svelte.js     usePublicaciones.svelte.js
    │   ├── useModeracion.svelte.js   useNotificaciones.svelte.js
    │
    ├── componentes/            Presentación pura (45 componentes)
    │   ├── comunes/              Boton · Campo · AreaTexto · Seleccion · Casilla ·
    │   │                         GrupoCasillas · Confirmar · EstadoBadge · Paginador ·
    │   │                         TransferList · MenuAcciones · FiltroTexto · FiltroFecha ·
    │   │                         PanelFiltros · MensajeError · Vacio · Spinner · Icono ·
    │   │                         CampanaNotificaciones · AvisoVerificacionEmail
    │   ├── navegacion/           NavegacionBarra (enlaces por permiso/rol)
    │   ├── canales/              Listado · Fila · Form
    │   ├── dispositivos/         Listado · Fila · Form
    │   ├── medios/               Listado · Fila · Filtros
    │   ├── usuarios/             Listado · Filtros · Fila · Roles · Historial
    │   ├── publicaciones/        Listado · Fila · Filtros · Form · Detalle · Dialogo
    │   ├── moderacion/           Listado · Fila
    │   └── notificaciones/       Listado · Fila
    │
    └── paginas/                14 páginas (lo único que registra router.js)
        ├── LoginPagina · RegisterPagina · ResetPasswordPagina · InicioPagina
        ├── CanalesPagina · DispositivosPagina · MediosPagina
        ├── AsignarMediosPagina · AsignarCanalesPagina · PublicadoresPagina
        ├── NotificacionesPagina · UsuariosPagina
        └── PublicacionesPagina · ModeracionPagina
```

Los componentes que sirven a más de un módulo viven en `componentes/comunes/`: el `Paginador` se usa en todo listado paginado, `Confirmar` en toda acción destructiva, `TransferList` en las tres pantallas de asignación, y así.

---

## 🔐 Seguridad en el cliente

El frontend es la capa de *experiencia* del control de acceso, no su autoridad final — el servidor revalida todo. Aun así, la aplicación aplica medidas concretas del lado cliente:

- **Token portador (Bearer)** en el header `Authorization` de cada pedido protegido. Nunca viaja en URLs ni query strings.
- **Validación de sesión al arrancar**: si hay un token guardado, se valida **una vez** antes de renderizar cualquier pantalla (estado *Verificando sesión…*), para no operar con credenciales vencidas.
- **Cierre reactivo ante expiración**: los tokens no se renuevan; cualquier respuesta 401 en cualquier módulo dispara el mismo camino centralizado — limpiar sesión y redirigir al login. No hay pantallas que queden pidiendo datos con un token muerto.
- **UI guiada por permisos y roles**: `tienePermiso()` y `tieneRol()` ocultan enlaces de la sidebar y bloquean el acceso a páginas **antes** de emitir un pedido que sería rechazado. Las páginas protegidas muestran un panel explicativo con botón de vuelta al inicio en lugar de un error crudo. (Honestidad de diseño: ocultar UI no es seguridad — es conveniencia; la autorización real la aplica el servidor.)
- **Sin HTML crudo del usuario**: Svelte escapa toda interpolación por defecto y el proyecto **no usa `{@html}` en ningún componente** — no hay vector de inyección de markup por contenido.
- **Validación en el cliente antes de gastar un pedido**: adjuntos (máximo 10 archivos × 10 MB, tipos permitidos, con tolerancia si el navegador no reporta el MIME), fecha programada futura, campos obligatorios y motivo requerido en las acciones críticas. El servidor revalida igual — defensa en profundidad, no sustituto.
- **Confirmaciones para acciones destructivas**: eliminar, deshabilitar, rechazar, detener y archivar pasan por un diálogo de confirmación que en los casos que corresponde **exige un motivo escrito** (y muestra los errores de la operación debajo de ese mismo campo). Las confirmaciones simples sin motivo usan el diálogo nativo del navegador.
- **Sin dobles envíos**: todo botón se deshabilita durante su operación; las filas bloquean su menú mientras una transición está en vuelo.
- **Mensajes sin detalles internos**: los fallos técnicos (conexión, 403, 404, 500) se traducen a frases neutras y accionables — la UI no expone detalles del servidor al usuario final.
- **Sin fugas de recursos**: el intervalo de polling de notificaciones se limpia al desmontar y al cerrar sesión (teardown del `$effect`); verificado que no quedan intervalos activos tras el logout.
- **Estado consistente bajo concurrencia**: las guardias anti-carrera evitan que una respuesta antigua pise datos nuevos al cambiar filtros o abrir detalles a toda velocidad.

**Trade-off declarado**: la persistencia de la sesión usa `localStorage` por decisión de alcance del proyecto. Para un despliegue productivo se evaluaría una estrategia de cookie de sesión no accesible por JS o rotación de tokens.

---

## 🎨 Design system

El sistema visual está **re-implementado a mano** (sin frameworks de UI) sobre dos pilares:

- **Tokens globales en `app.css`** — colores semánticos (primario, peligro, éxito), escala de grises para superficies y texto, radios por tipo de elemento, anillo + sombra de paneles y transiciones estándar. Todo el color y el movimiento pasan por custom properties: cambiar el tema es tocar un solo archivo (el modo oscuro está planificado justamente por eso).
- **`<style>` scoped por componente** — cada componente define su gramática local con esos mismos tokens; nada de estilos globales sorpresivos.

Escala tipográfica propia (Albert Sans con *fallback* al stack del sistema: si no hay internet, la app sigue viéndose bien), badges de estado semánticos (éxito, revisión, programado, deshabilitado…) y el patrón **tabla → tarjetas**: en pantallas menores a 640 px las tablas se re-arman como fichas apiladas sin duplicar componentes — cada celda lleva su etiqueta y el mismo CSS compartido sirve a los tres listados principales.

---

## ♿ Accesibilidad y responsive

- **Skip-link** *Saltar al contenido* (invisible hasta recibir foco por teclado).
- Menú de acciones y sidebar con atributos ARIA (`aria-haspopup`, `aria-expanded`, `aria-label`), cierre por `Escape` y foco gestionado.
- `:focus-visible` con anillo del color primario en todos los controles interactivos.
- Sidebar fija en escritorio (≥1024 px) y **off-canvas con velo** en tablet/mobile, cerrándose sola al navegar.
- Layout *topbar + contenido* pegajoso (sticky) y tablas que se convierten en tarjetas bajo 640 px.
- La tipografía carga con `display=swap` y tiene *fallback* completo al sistema.

---

## 🚀 Puesta en marcha

### Requisitos

- **Node.js** (con npm) — cualquier versión soportada por Vite.

### Instalación y ejecución

```bash
npm install        # instalar dependencias
npm run dev        # servidor de desarrollo (http://localhost:5173)
```

Otros scripts:

```bash
npm run build      # build de producción → carpeta dist/
npm run preview    # servir el build localmente para verificarlo
```

### Configuración

- **`src/config.js`** exporta la constante `BASE_URL`: es el **único** lugar donde se apunta al servidor que provee la API. Cambiá ese valor para conectar el panel a tu instancia; el resto del código lo importa y no repite URLs.
- **CORS en desarrollo**: la SPA corre en un origen propio (puerto de Vite). Si el navegador bloquea los pedidos al backend por CORS, hay dos caminos:
  1. habilitar el origen de la SPA en la política de la API, o
  2. activar un **proxy de desarrollo** en `vite.config.js` (`server.proxy`) que reenvíe las rutas de la API, y cambiar `BASE_URL` a una ruta relativa (p. ej. `'/api'`). Así el navegador ve un mismo origen y desaparece el problema sin tocar la API.

### Cuentas de usuario

Las credenciales de prueba las crea y gestiona el backend (no hay usuarios sembrados por el frontend). Para probar los alcances por rol conviene contar con al menos: un usuario con rol admin, uno moderador y uno publicador — cada uno verá distintos enlaces en la sidebar y distintas acciones por fila.

---

## 🗺 Trabajo futuro

- **Modo oscuro** — el color ya pasa íntegramente por custom properties; el tema es un nuevo set de tokens.
- **Filtrar todos los enlaces de la sidebar por permiso** (los grupos de contenido y moderación ya lo hacen; queda unificar el resto).
- **Historial de publicaciones** con comparación de versiones y exportación.
- **Pruebas automatizadas** end-to-end complementarias a la verificación manual.
- **Paginación configurable por el usuario** en los listados que hoy la traen fija.

---

*Proyecto FrontEnd — construido con Svelte 5, Vite y sv-router, sin librerías de UI ni de estado.*
