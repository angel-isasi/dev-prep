// "Más": lo que no entra en la barra de abajo.
import { Link } from "react-router";
import { CabeceraPagina } from "../components/CabeceraPagina.jsx";
import { IconoAjustes, IconoChuleta, IconoEntrevistas, IconoProgreso, IconoReferencia } from "../components/Iconos.jsx";
import estilos from "./MasMovil.module.css";

const OPCIONES = [
  { a: "/entrevistas", titulo: "Entrevistas", texto: "Tarjetas, simulacro, tu pitch y tus historias STAR", Icono: IconoEntrevistas },
  { a: "/camino", titulo: "Lecciones", texto: "Tu camino de unidades de programación", Icono: IconoProgreso },
  { a: "/logros", titulo: "Insignias", texto: "Tu nivel y lo que ya ganaste", Icono: IconoProgreso },
  { a: "/diario", titulo: "Diario", texto: "Una línea al día: qué aprendiste y qué te trabó", Icono: IconoChuleta },
  { a: "/glosario", titulo: "Glosario", texto: "Los términos de entrevista con una frase lista", Icono: IconoReferencia },
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
