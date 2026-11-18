import { NavLink, useLocation } from "react-router";
import { esPortada, estaEnDestino, ubicar } from "../lib/navegacion.js";
import estilos from "./SubNav.module.css";

/**
 * Pastillas con los destinos de la sección actual (por ejemplo, en Aprender: Temas, Lecciones,
 * Chuletas, Referencia y Glosario). Solo se ven en el celular: en la laptop esos mismos destinos
 * se abren bajo la sección en la barra lateral. Va dentro de CabeceraPagina, así queda alineada
 * con el contenido de cada pantalla.
 */
export function SubNav() {
  const { pathname } = useLocation();
  const { seccion } = ubicar(pathname);
  if (!seccion || seccion.sub.length < 2 || !esPortada(pathname)) return null;

  return (
    <nav className={estilos.subnav} aria-label={seccion.texto}>
      {seccion.sub.map((destino) => (
        <NavLink
          key={destino.a}
          to={destino.a}
          className={estilos.pastilla}
          data-activa={estaEnDestino(pathname, destino)}
          aria-current={estaEnDestino(pathname, destino) ? "page" : undefined}
        >
          {destino.texto}
        </NavLink>
      ))}
    </nav>
  );
}
