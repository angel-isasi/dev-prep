// Practicar > Entrena con IA: retos que la IA crea cada vez, distintos en cada vuelta.
import { Link } from "react-router";
import { CabeceraPagina } from "../components/CabeceraPagina.jsx";
import { IconoFlechaIzq } from "../components/Iconos.jsx";
import { QueImprime, ReviewAlReves } from "../components/ia/RetosIa.jsx";
import estilos from "../components/ia/Ia.module.css";
import pagina from "./Entrevistas.module.css";

export function EntrenaIa() {
  return (
    <section className={pagina.pagina} style={{ display: "grid", gap: "var(--espacio-4)" }}>
      <Link to="/practicar" className="boton boton-fantasma" style={{ justifySelf: "start" }}>
        <IconoFlechaIzq /> Practicar
      </Link>
      <CabeceraPagina etiqueta="Distinto cada vez" titulo="Entrena con IA" />
      <div className={estilos.rejilla}>
        <QueImprime />
        <ReviewAlReves />
      </div>
    </section>
  );
}
