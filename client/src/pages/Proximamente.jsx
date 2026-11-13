import estilos from "./Proximamente.module.css";

/** Pantalla provisional para las secciones que llegan en las próximas fases. */
export function Proximamente({ titulo, texto }) {
  return (
    <section className={estilos.contenedor}>
      <h1>{titulo}</h1>
      <p>{texto}</p>
      <span className={estilos.etiqueta}>Próximamente</span>
    </section>
  );
}
