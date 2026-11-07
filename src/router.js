// Ruteo del lado cliente con sv-router en su modo code-based:
// un objeto que asocia cada ruta con la página que la renderiza.
// Las páginas son las ÚNICAS componentes que se registran acá.
import { createRouter } from 'sv-router'
import InicioPagina from './paginas/InicioPagina.svelte'
import LoginPagina from './paginas/LoginPagina.svelte'
import CanalesPagina from './paginas/CanalesPagina.svelte'
import DispositivosPagina from './paginas/DispositivosPagina.svelte'
import MediosPagina from './paginas/MediosPagina.svelte'
import AsignarMediosPagina from './paginas/AsignarMediosPagina.svelte'
import AsignarCanalesPagina from './paginas/AsignarCanalesPagina.svelte'
import NotificacionesPagina from './paginas/NotificacionesPagina.svelte'
import UsuariosPagina from './paginas/UsuariosPagina.svelte'
import PublicadoresPagina from './paginas/PublicadoresPagina.svelte'
import PublicacionesPagina from './paginas/PublicacionesPagina.svelte'

// navigate se usa para redirigir por código (tras el login, ante un 401, etc.).
// '/' y '/inicio' muestran la misma bienvenida: /inicio es la ruta del
// enunciado (es a donde redirige el login) y '/' es lo que se escribe al abrir.
export const { navigate } = createRouter({
  '/': InicioPagina,
  '/inicio': InicioPagina,
  '/login': LoginPagina,
  '/canales': CanalesPagina,
  '/dispositivos': DispositivosPagina,
  '/medios': MediosPagina,
  '/asignar-medios': AsignarMediosPagina,
  '/asignar-canales': AsignarCanalesPagina,
  '/notificaciones': NotificacionesPagina,
  '/usuarios': UsuariosPagina,
  '/publicadores': PublicadoresPagina,
  '/publicaciones': PublicacionesPagina
})
