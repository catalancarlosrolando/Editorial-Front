<script>
  // Pinta el estado de un usuario (y más adelante el de una publicación) como
  // badge del design system: fondo 50 + borde 200 + texto 700, elegido con
  // class: según el valor del estado. La etiqueta la manda el backend
  // (status_label); si no vino, se muestra el valor tal cual.
  let { estado, etiqueta = '' } = $props()
</script>

<span
  class="badge"
  class:si={estado === 'approved'}
  class:no={estado === 'deleted'}
  class:neutra={estado === 'registered' || !estado}
  class:verificado={estado === 'verified'}
  class:deshabilitado={estado === 'disabled'}
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

  .deshabilitado {
    background: #fffbeb; /* amber-50 */
    border-color: #fde68a; /* amber-200 */
    color: #b45309; /* amber-700 */
  }
</style>
