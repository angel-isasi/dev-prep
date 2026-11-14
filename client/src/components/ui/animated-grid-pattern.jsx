// AnimatedGridPattern (Magic UI): una cuadrícula fina donde algunos cuadros se encienden y apagan al azar.
// Se coloca de fondo dentro de un padre con position: relative.
// Adaptado: color lavanda de la app y quieta con "reducir movimiento".
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "../../lib/cn.js";

export function AnimatedGridPattern({
  width = 44,
  height = 44,
  x = -1,
  y = -1,
  numSquares = 30,
  className,
  maxOpacity = 0.5,
  duration = 4,
  repeatDelay = 0.5,
  style,
}) {
  const id = useId();
  const ref = useRef(null);
  const reducido = useReducedMotion();
  const [tam, setTam] = useState({ ancho: 0, alto: 0 });
  const [cuadros, setCuadros] = useState([]);

  const posicion = useCallback(
    () => [Math.floor((Math.random() * tam.ancho) / width), Math.floor((Math.random() * tam.alto) / height)],
    [tam.ancho, tam.alto, width, height],
  );

  // Cuando un cuadro termina de encenderse y apagarse, salta a otro lugar
  const mover = useCallback(
    (cuadroId) =>
      setCuadros((actuales) => {
        const actual = actuales[cuadroId];
        if (!actual) return actuales;
        const nuevos = actuales.slice();
        nuevos[cuadroId] = { ...actual, pos: posicion(), vuelta: actual.vuelta + 1 };
        return nuevos;
      }),
    [posicion],
  );

  useEffect(() => {
    if (tam.ancho && tam.alto && !reducido) {
      setCuadros(Array.from({ length: numSquares }, (_, i) => ({ id: i, pos: posicion(), vuelta: 0 })));
    }
  }, [tam.ancho, tam.alto, numSquares, posicion, reducido]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observador = new ResizeObserver(([entrada]) => {
      const { width: ancho, height: alto } = entrada.contentRect;
      setTam((t) => (t.ancho === ancho && t.alto === alto ? t : { ancho, alto }));
    });
    observador.observe(el);
    return () => observador.disconnect();
  }, []);

  return (
    <svg
      ref={ref}
      aria-hidden
      className={cn("tw pointer-events-none absolute inset-0 h-full w-full fill-primary/30 stroke-primary/15", className)}
      style={style}
    >
      <defs>
        <pattern id={id} width={width} height={height} patternUnits="userSpaceOnUse" x={x} y={y}>
          <path d={`M.5 ${height}V.5H${width}`} fill="none" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} strokeWidth="0" />
      <svg x={x} y={y} className="overflow-visible">
        {cuadros.map(({ pos: [cx, cy], id: cuadroId, vuelta }, i) => (
          <motion.rect
            key={`${cuadroId}-${vuelta}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: maxOpacity }}
            transition={{ duration, repeat: 1, delay: i * 0.1, repeatType: "reverse", repeatDelay }}
            onAnimationComplete={() => mover(cuadroId)}
            width={width - 1}
            height={height - 1}
            x={cx * width + 1}
            y={cy * height + 1}
            fill="currentColor"
            strokeWidth="0"
          />
        ))}
      </svg>
    </svg>
  );
}
