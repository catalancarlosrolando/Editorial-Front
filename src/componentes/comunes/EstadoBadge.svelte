<script>
  // Pinta el estado de un usuario O de una publicación como badge del design
  // system: fondo 50 + borde 200 + texto 700, elegido con class: según el
  // valor del estado. La etiqueta la manda el backend (status_label de
  // usuario) o el mapa de etiquetas de publicaciones; si no vino, el valor.
  //
  // Mapa de colores compartido por los dos módulos:
  //   usuarios                                publicaciones
  //   approved        → verde (si)            published       → verde (si)
  //   deleted         → rojo (no)             archived        → rojo (no)
  //   registered/draft→ gris (neutra)         draft           → gris (neutra)
  //   verified        → azul (verificado)     approved_by_moderator → azul
  //   disabled        → ámbar                 pending_review  → ámbar (revision)
  //                                           scheduled       → índigo (programado)
  let { estado, etiqueta = '' } = $props()
</script>

<span
  class="badge"
  class:si={estado === 'approved' || estado === 'published'}
  class:no={estado === 'deleted' || estado === 'archived'}
  class:neutra={estado === 'registered' || estado === 'draft' || !estado}
  class:verificado={estado === 'verified' || estado === 'approved_by_moderator'}
  class:deshabilitado={estado === 'disabled'}
  class:revision={estado === 'pending_review'}
  class:programado={estado === 'scheduled'}
>
  {etiqueta || estado}
</span>

<style>
  /* Estados sin color propio en app.css: mismos valores que la gramática de
     los badges globales (fondo 50 · borde 200 · texto 700) */
  .verificado {
    background: #eff6ff; /* blue-50 */
    border-color: #bfdbfe; /* blue-200 */
    color: #1d4ed8; /* blue-700 */
  }

  /* Mismo ámbar para el usuario deshabilitado y el post a la espera de
     revisión: en ambos casos es un estado de "esperando una acción". */
  .deshabilitado,
  .revision {
    background: #fffbeb; /* amber-50 */
    border-color: #fde68a; /* amber-200 */
    color: #b45309; /* amber-700 */
  }

  .programado {
    background: #eef2ff; /* indigo-50 */
    border-color: #c7d2fe; /* indigo-200 */
    color: #4338ca; /* indigo-700 */
  }
</style>
