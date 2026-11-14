// AnimatedGroup (Motion Primitives): los hijos entran uno tras otro con un efecto.
//   <AnimatedGroup preset="blur-slide" className="grid">...</AnimatedGroup>
// Cada hijo queda envuelto en un elemento animado; className del grupo va en el contenedor.
import { Children, useMemo } from "react";
import { motion, useReducedMotion } from "motion/react";

const PRESETS = {
  fade: {},
  slide: { hidden: { y: 20 }, visible: { y: 0 } },
  scale: { hidden: { scale: 0.8 }, visible: { scale: 1 } },
  blur: { hidden: { filter: "blur(4px)" }, visible: { filter: "blur(0px)" } },
  "blur-slide": { hidden: { filter: "blur(4px)", y: 20 }, visible: { filter: "blur(0px)", y: 0 } },
  zoom: { hidden: { scale: 0.5 }, visible: { scale: 1, transition: { type: "spring", stiffness: 300, damping: 20 } } },
  bounce: { hidden: { y: -50 }, visible: { y: 0, transition: { type: "spring", stiffness: 400, damping: 10 } } },
};

export function AnimatedGroup({ children, className, itemClassName, preset = "fade", stagger = 0.1, as = "div", asChild = "div" }) {
  const reducido = useReducedMotion();
  const Contenedor = useMemo(() => motion.create(as), [as]);
  const Hijo = useMemo(() => motion.create(asChild), [asChild]);

  const elegido = PRESETS[preset] ?? {};
  const item = {
    hidden: { opacity: 0, ...elegido.hidden },
    visible: { opacity: 1, ...elegido.visible },
  };
  const contenedor = { hidden: {}, visible: { transition: { staggerChildren: stagger } } };

  return (
    <Contenedor initial={reducido ? false : "hidden"} animate="visible" variants={contenedor} className={className}>
      {Children.map(children, (hijo, i) =>
        hijo ? (
          <Hijo key={i} variants={item} className={itemClassName}>
            {hijo}
          </Hijo>
        ) : null,
      )}
    </Contenedor>
  );
}
