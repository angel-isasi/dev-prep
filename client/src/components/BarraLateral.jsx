import { NavLink } from "react-router";
import { useTema } from "../hooks/useTema.js";
import {
  IconoAprender,
  IconoEntrevistas,
  IconoLuna,
  IconoPracticar,
  IconoProgreso,
  IconoSol,
} from "./Iconos.jsx";
import estilos from "./BarraLateral.module.css";

const SECCIONES = [
  { a: "/aprender", texto: "Aprender", Icono: IconoAprender },
  { a: "/practicar", texto: "Practicar", Icono: IconoPracticar },
  { a: "/entrevistas", texto: "Entrevistas", Icono: IconoEntrevistas },
  { a: "/progreso", texto: "Progreso", Icono: IconoProgreso },
];

export function BarraLateral() {
  const { tema, alternar } = useTema();

  return (
    <aside className={estilos.barra}>
      <div className={estilos.marca}>
        <span className={estilos.logo} aria-hidden>
          {"</>"}
        </span>
        dev-prep
      </div>

      <nav className={estilos.nav} aria-label="Secciones">
        {SECCIONES.map(({ a, texto, Icono }) => (
          <NavLink
            key={a}
            to={a}
            className={({ isActive }) => `${estilos.enlace} ${isActive ? estilos.activo : ""}`}
          >
            <Icono />
            {texto}
          </NavLink>
        ))}
      </nav>

      <div className={estilos.pie}>
        <button type="button" className={estilos.tema} onClick={alternar}>
          {tema === "oscuro" ? <IconoSol /> : <IconoLuna />}
          {tema === "oscuro" ? "Modo claro" : "Modo oscuro"}
        </button>
      </div>
    </aside>
  );
}
