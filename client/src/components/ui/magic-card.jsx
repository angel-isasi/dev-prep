// MagicCard (Magic UI): una luz sigue al mouse dentro de la tarjeta y colorea su borde.
// Adaptado: solo el modo "gradient", fondo translúcido de la app y colores lavanda y verde.
import { useCallback, useEffect } from "react";
import { motion, useMotionTemplate, useMotionValue } from "motion/react";
import { cn } from "../../lib/cn.js";

export function MagicCard({
  children,
  className,
  gradientSize = 220,
  gradientColor = "var(--acento-suave)",
  gradientFrom = "var(--acento)",
  gradientTo = "var(--exito)",
  ...props
}) {
  const mouseX = useMotionValue(-gradientSize);
  const mouseY = useMotionValue(-gradientSize);

  // Saca la luz fuera de la tarjeta (cuando el mouse se va o cambias de ventana).
  const apagar = useCallback(() => {
    mouseX.set(-gradientSize);
    mouseY.set(-gradientSize);
  }, [mouseX, mouseY, gradientSize]);

  const mover = useCallback(
    (e) => {
      const rect = e.currentTarget.getBoundingClientRect();
      mouseX.set(e.clientX - rect.left);
      mouseY.set(e.clientY - rect.top);
    },
    [mouseX, mouseY],
  );

  useEffect(() => {
    const alSalir = (e) => {
      if (!e.relatedTarget) apagar();
    };
    window.addEventListener("pointerout", alSalir);
    window.addEventListener("blur", apagar);
    return () => {
      window.removeEventListener("pointerout", alSalir);
      window.removeEventListener("blur", apagar);
    };
  }, [apagar]);

  // El borde es un degradado radial que solo se ve en la franja del borde (border-box).
  const fondo = useMotionTemplate`
    linear-gradient(var(--fondo-solido) 0 0) padding-box,
    radial-gradient(${gradientSize}px circle at ${mouseX}px ${mouseY}px, ${gradientFrom}, ${gradientTo}, var(--borde) 100%) border-box
  `;
  const brillo = useMotionTemplate`radial-gradient(${gradientSize}px circle at ${mouseX}px ${mouseY}px, ${gradientColor}, transparent 100%)`;

  return (
    <motion.div
      className={cn("tw group relative isolate overflow-hidden border border-transparent", className)}
      onPointerMove={mover}
      onPointerLeave={apagar}
      style={{ background: fondo }}
      {...props}
    >
      {/* Capa de superficie de la app, para que se vea igual que las demás tarjetas */}
      <div className="absolute inset-px z-0 rounded-[inherit] bg-card" />
      <motion.div
        className="pointer-events-none absolute inset-px z-10 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: brillo }}
      />
      <div className="relative z-20 h-full">{children}</div>
    </motion.div>
  );
}
