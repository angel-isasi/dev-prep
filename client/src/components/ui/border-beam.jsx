// BorderBeam (Magic UI): un haz de luz que recorre el borde del elemento padre.
// El padre necesita position: relative y un border-radius.
import { motion, useReducedMotion } from "motion/react";
import { cn } from "../../lib/cn.js";

export function BorderBeam({
  className,
  size = 80,
  delay = 0,
  duration = 6,
  colorFrom = "var(--acento)",
  colorTo = "var(--exito)",
  reverse = false,
  initialOffset = 0,
  borderWidth = 1.5,
}) {
  const reducido = useReducedMotion();
  if (reducido) return null;

  // La capa de afuera recorta: el cuadrado de luz se dibuja medio afuera del borde, y aunque la máscara
  // lo oculta, sin este recorte igual ocupa espacio y hace aparecer barras de scroll en el contenedor.
  return (
    <div aria-hidden style={{ position: "absolute", inset: 0, overflow: "hidden", borderRadius: "inherit", pointerEvents: "none" }}>
    <div
      className="tw pointer-events-none absolute inset-0 rounded-[inherit] border-(length:--border-beam-width) border-transparent mask-[linear-gradient(transparent,transparent),linear-gradient(#000,#000)] mask-intersect [mask-clip:padding-box,border-box]"
      style={{ "--border-beam-width": `${borderWidth}px` }}
    >
      <motion.div
        className={cn(
          "absolute aspect-square bg-linear-to-l from-(--color-from) via-(--color-to) to-transparent",
          className,
        )}
        style={{
          width: size,
          offsetPath: `rect(0 auto auto 0 round ${size}px)`,
          "--color-from": colorFrom,
          "--color-to": colorTo,
        }}
        initial={{ offsetDistance: `${initialOffset}%` }}
        animate={{
          offsetDistance: reverse
            ? [`${100 - initialOffset}%`, `${-initialOffset}%`]
            : [`${initialOffset}%`, `${100 + initialOffset}%`],
        }}
        transition={{ repeat: Infinity, ease: "linear", duration, delay: -delay }}
      />
    </div>
    </div>
  );
}
