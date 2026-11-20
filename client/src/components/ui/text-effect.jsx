// TextEffect (Motion Primitives): el texto aparece por palabras, letras o líneas con un efecto.
//   <TextEffect preset="fade-in-blur" per="word">Hola mundo</TextEffect>
// Adaptado a JavaScript; con "reducir movimiento" el texto se muestra de una vez.
import { memo } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { cn } from "../../lib/cn.js";
import { useTraducido } from "../../lib/inmersion.js";

const ESCALONADO = { char: 0.03, word: 0.05, line: 0.1 };

const contenedorBase = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
  exit: { transition: { staggerChildren: 0.05, staggerDirection: -1 } },
};

const PRESETS = {
  blur: {
    hidden: { opacity: 0, filter: "blur(12px)" },
    visible: { opacity: 1, filter: "blur(0px)" },
    exit: { opacity: 0, filter: "blur(12px)" },
  },
  "fade-in-blur": {
    hidden: { opacity: 0, y: 20, filter: "blur(12px)" },
    visible: { opacity: 1, y: 0, filter: "blur(0px)" },
    exit: { opacity: 0, y: 20, filter: "blur(12px)" },
  },
  scale: {
    hidden: { opacity: 0, scale: 0 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0 },
  },
  fade: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  },
  slide: {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
  },
};

// Agrega una transición a los estados visible y exit de unas variantes
function conTransicion(variantes, transicion) {
  return {
    ...variantes,
    visible: { ...variantes.visible, transition: { ...variantes.visible?.transition, ...transicion } },
    exit: { ...variantes.exit, transition: { ...variantes.exit?.transition, ...transicion, staggerDirection: -1 } },
  };
}

const Segmento = memo(function Segmento({ segmento, variantes, per }) {
  if (per === "line") {
    return (
      <motion.span variants={variantes} className="block">
        {segmento}
      </motion.span>
    );
  }
  if (per === "word") {
    return (
      <motion.span aria-hidden variants={variantes} className="inline-block whitespace-pre">
        {segmento}
      </motion.span>
    );
  }
  return (
    <span className="inline-block whitespace-pre">
      {[...segmento].map((letra, i) => (
        <motion.span key={i} aria-hidden variants={variantes} className="inline-block whitespace-pre">
          {letra}
        </motion.span>
      ))}
    </span>
  );
});

export function TextEffect({
  children: original,
  per = "word",
  as = "p",
  className,
  preset = "fade",
  delay = 0,
  speedReveal = 1,
  speedSegment = 1,
  trigger = true,
  style,
}) {
  const reducido = useReducedMotion();
  // Modo inmersión: el texto se parte en palabras, así que se traduce entero antes de partirlo
  // (y data-sin-inmersion evita que lib/inmersion.js traduzca palabra por palabra).
  const children = useTraducido(original);
  const Etiqueta = motion[as] ?? motion.p;

  if (reducido) {
    return (
      <Etiqueta className={cn("tw", className)} style={style} data-sin-inmersion>
        {children}
      </Etiqueta>
    );
  }

  const segmentos = per === "line" ? children.split("\n") : children.split(/(\s+)/);
  const contenedor = conTransicion(contenedorBase, {
    staggerChildren: ESCALONADO[per] / speedReveal,
    delayChildren: delay,
  });
  const item = conTransicion(PRESETS[preset], { duration: 0.3 / speedSegment });

  return (
    <AnimatePresence mode="popLayout">
      {trigger && (
        <Etiqueta initial="hidden" animate="visible" exit="exit" variants={contenedor} className={cn("tw", className)} style={style} data-sin-inmersion>
          {per !== "line" && <span className="sr-only">{children}</span>}
          {segmentos.map((segmento, i) => (
            <Segmento key={`${per}-${i}-${segmento}`} segmento={segmento} variantes={item} per={per} />
          ))}
        </Etiqueta>
      )}
    </AnimatePresence>
  );
}
