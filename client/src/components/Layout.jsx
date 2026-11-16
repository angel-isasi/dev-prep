import { useRef } from "react";
import { Outlet, useLocation } from "react-router";
import { motion, useReducedMotion } from "motion/react";
import { BarraLateral } from "./BarraLateral.jsx";
import ClickSpark from "./reactbits/ClickSpark.jsx";
import Noise from "./reactbits/Noise.jsx";
import { useColorTema, usePorTema } from "../hooks/useColorTema.js";
import { useScrollSuave } from "../hooks/useScrollSuave.js";
import estilos from "./Layout.module.css";

export function Layout() {
  const { pathname } = useLocation();
  const reducido = useReducedMotion();
  const acento = useColorTema("--acento");
  const grano = usePorTema({ oscuro: 0.05, claro: 0.03 });
  const principal = useRef(null);
  useScrollSuave(principal);

  return (
    // Chispas en cada clic, en toda la app (React Bits)
    <ClickSpark sparkColor={acento} sparkCount={9} sparkSize={11} sparkRadius={24} duration={450} glow={0.35}>
      <div className={estilos.layout}>
        <BarraLateral />
        <main className={estilos.principal} ref={principal}>
          {/* Contenedor fijo: Lenis mide su alto para saber hasta dónde se puede bajar */}
          <div>
            {/* Cada página entra con un pequeño fundido hacia arriba */}
            <motion.div
              key={pathname}
              initial={reducido ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: [0.2, 0.8, 0.2, 1] }}
            >
              <Outlet />
            </motion.div>
          </div>
        </main>
      </div>
      {/* Grano de película muy suave (React Bits). Va DETRÁS del contenido (z-index -1):
          da textura al fondo sin ensuciar los textos ni las tarjetas. Es estático (fps 0):
          animado obligaba a repintar toda la pantalla 18 veces por segundo y trababa la app. */}
      <Noise fixed opacity={grano} size={1} fps={0} contrast={0.5} zIndex={-1} />
    </ClickSpark>
  );
}
