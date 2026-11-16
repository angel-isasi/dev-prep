// "Más": lo que no entra en la barra de abajo.
import { Link } from "react-router";
import { CabeceraPagina } from "../components/CabeceraPagina.jsx";
import { IconoAjustes, IconoChuleta, IconoReferencia } from "../components/Iconos.jsx";
import estilos from "./MasMovil.module.css";

const OPCIONES = [
  { a: "/chuletas", titulo: "Chuletas", texto: "Lo esencial de cada tema en una pantalla", Icono: IconoChuleta },
  { a: "/referencia", titulo: "Referencia", texto: "Tu MDN sin internet: métodos, ejemplos y errores típicos", Icono: IconoReferencia },
  { a: "/ajustes", titulo: "Ajustes", texto: "Tu nombre, tema claro u oscuro y respaldo del progreso", Icono: IconoAjustes },
];

export function MasMovil() {
  return (
    <section className={estilos.pagina}>
      <CabeceraPagina titulo="Más" />
      <div className={estilos.lista}>
        {OPCIONES.map(({ a, titulo, texto, Icono }) => (
          <Link key={a} to={a} className={estilos.opcion}>
            <span className={estilos.icono}>
              <Icono />
            </span>
            <span className={estilos.texto}>
              <strong>{titulo}</strong>
              <small>{texto}</small>
            </span>
            <i aria-hidden>→</i>
          </Link>
        ))}
      </div>
    </section>
  );
}
