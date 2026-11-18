// Marco de la versión publicada en pantallas chicas (celular). En pantalla grande se usa el
// mismo Layout de la laptop (ver AppMovil.jsx).
// el contenido arriba y la navegación fija abajo, al alcance del pulgar.
// Sin efectos de canvas de pantalla completa (en el celular gastan batería y traban).
import { NavLink, Outlet, useLocation } from "react-router";
import { motion, useReducedMotion } from "motion/react";
import { Suspense, useEffect } from "react";
import { Esqueleto } from "../components/Esqueleto.jsx";
import { IconoAprender, IconoIngles, IconoInicio, IconoMas, IconoPracticar } from "../components/Iconos.jsx";
import estilos from "./LayoutMovil.module.css";

const SECCIONES = [
  { a: "/", texto: "Hoy", Icono: IconoInicio, exacto: true },
  { a: "/aprender", texto: "Aprender", Icono: IconoAprender },
  { a: "/practicar", texto: "Practicar", Icono: IconoPracticar },
  { a: "/ingles", texto: "Inglés", Icono: IconoIngles },
  // "Más" agrupa Entrevistas, Lecciones, Referencia, Chuletas y Ajustes
  { a: "/mas", texto: "Más", Icono: IconoMas, tambien: ["/entrevistas", "/camino", "/referencia", "/chuletas", "/ajustes", "/trabajo", "/logros", "/diario", "/glosario"] },
];

export function LayoutMovil() {
  const { pathname } = useLocation();
  const reducido = useReducedMotion();

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
          <Suspense fallback={<Esqueleto variante="tarjetas" />}>
            <Outlet />
          </Suspense>
        </motion.div>
      </main>

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
