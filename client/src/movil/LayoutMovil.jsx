// Marco de la versión celular: el contenido arriba y la navegación fija abajo, al alcance del pulgar.
// Sin efectos de canvas de pantalla completa (en el celular gastan batería y traban).
import { NavLink, Outlet, useLocation } from "react-router";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import {
  IconoAjustes,
  IconoAprender,
  IconoChuleta,
  IconoEntrevistas,
  IconoInicio,
  IconoMas,
  IconoPracticar,
  IconoProgreso,
  IconoReferencia,
} from "../components/Iconos.jsx";
import { AvisoPWA } from "./AvisoPWA.jsx";
import { iniciarSincronizacion } from "../lib/sync-movil.js";
import estilos from "./LayoutMovil.module.css";

const SECCIONES = [
  { a: "/", texto: "Hoy", Icono: IconoInicio, exacto: true },
  { a: "/aprender", texto: "Aprender", Icono: IconoAprender },
  { a: "/practicar", texto: "Practicar", Icono: IconoPracticar },
  { a: "/entrevistas", texto: "Entrevistas", Icono: IconoEntrevistas },
  // En el celular, "Más" agrupa Referencia, Chuletas y Ajustes. En pantalla grande hay espacio
  // para mostrarlas directamente en la barra lateral (y "Más" se oculta).
  { a: "/mas", texto: "Más", Icono: IconoMas, tambien: ["/referencia", "/chuletas", "/ajustes"], solo: "celular" },
  { a: "/camino", texto: "Camino", Icono: IconoProgreso, solo: "grande" },
  { a: "/chuletas", texto: "Chuletas", Icono: IconoChuleta, solo: "grande" },
  { a: "/referencia", texto: "Referencia", Icono: IconoReferencia, solo: "grande" },
  { a: "/ajustes", texto: "Ajustes", Icono: IconoAjustes, solo: "grande" },
];

/** ¿Pantalla grande (laptop)? Cambia en vivo si giras el celular o achicas la ventana. */
const GRANDE = "(min-width: 900px)";
function usePantallaGrande() {
  const [grande, setGrande] = useState(() => window.matchMedia(GRANDE).matches);
  useEffect(() => {
    const consulta = window.matchMedia(GRANDE);
    const alCambiar = () => setGrande(consulta.matches);
    consulta.addEventListener("change", alCambiar);
    return () => consulta.removeEventListener("change", alCambiar);
  }, []);
  return grande;
}

export function LayoutMovil() {
  const grande = usePantallaGrande();
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
        <div className={estilos.marca}>
          <span className={estilos.logo} aria-hidden>
            {"</>"}
          </span>
          dev-prep
        </div>
        {SECCIONES.filter(({ solo }) => !solo || solo === (grande ? "grande" : "celular")).map(({ a, texto, Icono, exacto, tambien }) => {
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
