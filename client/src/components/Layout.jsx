import { Outlet, useLocation } from "react-router";
import { motion, useReducedMotion } from "motion/react";
import { BarraLateral } from "./BarraLateral.jsx";
import estilos from "./Layout.module.css";

export function Layout() {
  const { pathname } = useLocation();
  const reducido = useReducedMotion();

  return (
    <div className={estilos.layout}>
      <BarraLateral />
      <main className={estilos.principal}>
        {/* Cada página entra con un pequeño fundido hacia arriba */}
        <motion.div
          key={pathname}
          initial={reducido ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: [0.2, 0.8, 0.2, 1] }}
        >
          <Outlet />
        </motion.div>
      </main>
    </div>
  );
}
