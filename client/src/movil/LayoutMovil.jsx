// Marco de la versión celular: el contenido arriba y la navegación fija abajo, al alcance del pulgar.
// Sin efectos de canvas de pantalla completa (en el celular gastan batería y traban).
import { NavLink, Outlet, useLocation } from "react-router";
import { motion, useReducedMotion } from "motion/react";
import { useEffect } from "react";
import { IconoAprender, IconoEntrevistas, IconoInicio, IconoMas, IconoPracticar } from "../components/Iconos.jsx";
import { AvisoPWA } from "./AvisoPWA.jsx";
import { iniciarSincronizacion } from "../lib/sync-movil.js";
import estilos from "./LayoutMovil.module.css";

const SECCIONES = [
  { a: "/", texto: "Hoy", Icono: IconoInicio, exacto: true },
  { a: "/aprender", texto: "Aprender", Icono: IconoAprender },
  { a: "/practicar", texto: "Practicar", Icono: IconoPracticar },
  { a: "/entrevistas", texto: "Entrevistas", Icono: IconoEntrevistas },
  // "Más" agrupa Referencia, Chuletas y Ajustes
  { a: "/mas", texto: "Más", Icono: IconoMas, tambien: ["/referencia", "/chuletas", "/ajustes"] },
];

export function LayoutMovil() {
  const { pathname } = useLocation();
  const reducido = useReducedMotion();

  // Une el progreso con la laptop cuando hay internet (si el celular está vinculado).
  useEffect(() => iniciarSincronizacion(), []);

  // Al cambiar de pantalla, vuelve arriba (en el celular se usa el scroll de la página).
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className={estilos.layout}>
      <main className={estilos.principal}>
        <motion.div
          key={pathname}
          initial={reducido ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
        >
          <Outlet />
        </motion.div>
      </main>

      <AvisoPWA />

      <nav className={estilos.nav} aria-label="Secciones">
        {SECCIONES.map(({ a, texto, Icono, exacto, tambien }) => {
          const extra = tambien?.some((r) => pathname.startsWith(r));
          return (
            <NavLink
              key={a}
              to={a}
              end={exacto}
              className={({ isActive }) => `${estilos.enlace} ${isActive || extra ? estilos.activo : ""}`}
            >
              {({ isActive }) => (
                <>
                  {(isActive || extra) && (
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
                  <span className={estilos.texto}>{texto}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
