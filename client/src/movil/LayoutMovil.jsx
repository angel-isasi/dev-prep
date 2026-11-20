// Armazón de la app en pantallas chicas (celular). En pantalla grande se usa Layout (barra lateral).
// Arriba: la marca, el buscador y los ajustes. Abajo, al alcance del pulgar: las 6 secciones,
// las mismas de la barra lateral (ver lib/navegacion.js).
// Sin efectos de canvas de pantalla completa (en el celular gastan batería y traban).
import { Suspense, useEffect } from "react";
import { Jarvis } from "../jarvis/Jarvis.jsx";
import { Link, NavLink, Outlet, useLocation } from "react-router";
import { motion, useReducedMotion } from "motion/react";
import { Esqueleto } from "../components/Esqueleto.jsx";
import { Paleta } from "../components/Paleta.jsx";
import { IconoAjustes, IconoReferencia } from "../components/Iconos.jsx";
import { SECCIONES, ubicar } from "../lib/navegacion.js";
import { abrirPaleta } from "../lib/paleta.js";
import estilos from "./LayoutMovil.module.css";

export function LayoutMovil() {
  const { pathname } = useLocation();
  const reducido = useReducedMotion();
  const actual = ubicar(pathname).seccion;

  // Al cambiar de pantalla, vuelve arriba (en el celular se usa el scroll de la página).
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className={estilos.layout}>
      <header className={estilos.arriba}>
        <Link to="/" className={estilos.marca}>
          <span className={estilos.logo} aria-hidden>
            {"</>"}
          </span>
          dev-prep
        </Link>
        <button type="button" className={estilos.accion} onClick={abrirPaleta} aria-label="Buscar">
          <IconoReferencia />
        </button>
        <Link to="/ajustes" className={estilos.accion} aria-label="Ajustes" data-activa={pathname === "/ajustes"}>
          <IconoAjustes />
        </Link>
      </header>

      <main className={estilos.principal}>
        <motion.div
          key={pathname}
          initial={reducido ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
        >
          <Suspense fallback={<Esqueleto variante="tarjetas" />}>
            <Outlet />
          </Suspense>
        </motion.div>
      </main>

      <Jarvis />

      <nav className={estilos.nav} aria-label="Secciones" style={{ "--secciones": SECCIONES.length }}>
        {SECCIONES.map(({ id, a, texto, corto, Icono, exacto }) => {
          const activa = actual?.id === id;
          return (
            <NavLink key={id} to={a} end={exacto} className={`${estilos.enlace} ${activa ? estilos.activo : ""}`}>
              {activa && (
                <motion.span
                  layoutId="indicador-movil"
                  className={estilos.indicador}
                  transition={{ type: "spring", stiffness: 480, damping: 36 }}
                  aria-hidden
                />
              )}
              <span className={estilos.icono}>
                <Icono />
              </span>
              <span className={estilos.texto}>{corto ?? texto}</span>
            </NavLink>
          );
        })}
      </nav>

      <Paleta />
    </div>
  );
}
