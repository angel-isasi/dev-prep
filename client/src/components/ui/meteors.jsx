// Meteors (Magic UI): meteoros que cruzan en diagonal. Van dentro de un padre con
// position: relative y overflow: hidden. La animación "meteor" está en tailwind.css.
// Adaptado: posición según el ancho del padre (no de la ventana) y sin meteoros con "reducir movimiento".
import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { cn } from "../../lib/cn.js";

export function Meteors({ number = 10, minDelay = 0.2, maxDelay = 4, minDuration = 3, maxDuration = 9, angle = 215, className }) {
  const ref = useRef(null);
  const reducido = useReducedMotion();
  const [estilos, setEstilos] = useState([]);

  useEffect(() => {
    if (reducido) return;
    const ancho = ref.current?.parentElement?.offsetWidth ?? 300;
    setEstilos(
      Array.from({ length: number }, () => ({
        "--angle": `${-angle}deg`,
        top: "-5%",
        left: `${Math.floor(Math.random() * ancho * 1.4)}px`,
        animationDelay: `${Math.random() * (maxDelay - minDelay) + minDelay}s`,
        animationDuration: `${Math.floor(Math.random() * (maxDuration - minDuration) + minDuration)}s`,
      })),
    );
  }, [number, minDelay, maxDelay, minDuration, maxDuration, angle, reducido]);

  return (
    <span ref={ref} className="tw contents" aria-hidden>
      {estilos.map((estilo, i) => (
        <span
          key={i}
          style={estilo}
          className={cn(
            "pointer-events-none absolute size-0.5 rotate-(--angle) animate-meteor rounded-full bg-primary shadow-[0_0_0_1px_#ffffff10]",
            className,
          )}
        >
          {/* La cola del meteoro */}
          <span className="pointer-events-none absolute top-1/2 -z-10 h-px w-12 -translate-y-1/2 bg-linear-to-r from-primary to-transparent" />
        </span>
      ))}
    </span>
  );
}
