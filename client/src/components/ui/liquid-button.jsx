// LiquidButton (RareUI): botón con gotas que cuelgan y caen al pasar el mouse (efecto "gooey").
// El efecto sale de un filtro SVG: desenfoca el botón y las gotas juntos y vuelve a endurecer
// el borde, así parecen un solo líquido.
// Adaptado: id del filtro único (puede haber varios botones), colores lavanda de la app,
// caída más corta para que no tape lo de abajo, onClick y sin gotas con "reducir movimiento".
import { useId, useRef } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";
import { cn } from "../../lib/cn.js";

const GOTAS = [
  { left: "10%", size: "size-3", delay: 0.1, duration: 2.1 },
  { left: "20%", size: "size-4", delay: 0, duration: 2 },
  { left: "30%", size: "size-2", delay: 0.6, duration: 2.5 },
  { left: "40%", size: "size-5", delay: 0.8, duration: 2.4 },
  { left: "50%", size: "size-3", delay: 0.4, duration: 1.8 },
  { left: "58%", size: "size-2", delay: 1.5, duration: 2.7 },
  { left: "66%", size: "size-5", delay: 1.2, duration: 2.6 },
  { left: "75%", size: "size-3", delay: 0.9, duration: 2.3 },
  { left: "82%", size: "size-4", delay: 0.2, duration: 2.2 },
  { left: "90%", size: "size-3", delay: 0.5, duration: 2.8 },
];

export function LiquidButton({
  children,
  onClick,
  className,
  backgroundColor = "bg-primary",
  textColor = "text-primary-foreground",
  caida = 70,
  ...props
}) {
  const ref = useRef(null);
  const filtro = `goo-${useId().replace(/:/g, "")}`;
  const reducido = useReducedMotion();
  const mouseX = useMotionValue(0);
  const resorteX = useSpring(mouseX, { stiffness: 300, damping: 30 });

  const mover = (e) => {
    const rect = ref.current?.getBoundingClientRect();
    if (rect) mouseX.set(e.clientX - rect.left - rect.width / 2);
  };

  return (
    <div ref={ref} className={cn("tw relative inline-block", className)} onMouseMove={mover} onMouseLeave={() => mouseX.set(0)}>
      <svg className="absolute size-0" aria-hidden>
        <defs>
          <filter id={filtro}>
            <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="goo" />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>

      <motion.div className="relative z-10 inline-block" style={{ filter: `url(#${filtro})` }} whileHover="hover" initial="initial">
        <motion.button
          type="button"
          onClick={onClick}
          className={cn(
            "relative z-20 cursor-pointer overflow-hidden rounded-lg px-6 py-2.5 text-[15px] font-semibold tracking-wide outline-none focus-visible:ring-2 focus-visible:ring-ring",
            backgroundColor,
            textColor,
          )}
          variants={{ hover: { scale: 1.02 }, initial: { scale: 1 } }}
          transition={{ type: "spring", stiffness: 300, damping: 15 }}
          {...props}
        >
          <span className="relative z-10">{children}</span>
        </motion.button>

        {!reducido && GOTAS.map((g) => <Gota key={g.left} {...g} mouseX={resorteX} backgroundColor={backgroundColor} caida={caida} />)}
      </motion.div>
    </div>
  );
}

function Gota({ left, size, delay, duration, mouseX, backgroundColor, caida }) {
  // Las gotas lentas se mueven más con el mouse: da sensación de profundidad
  const factor = duration * 10;
  const x = useTransform(mouseX, [-200, 200], [-factor, factor]);

  return (
    <motion.div
      aria-hidden
      className={cn("absolute bottom-0 -z-10 rounded-full will-change-transform", size, backgroundColor)}
      style={{ left, x }}
      variants={{
        initial: { y: 0, scale: 1, opacity: 1 },
        hover: {
          y: [0, 14, caida],
          scale: [1, 1.1, 0],
          opacity: 1,
          transition: { duration, repeat: Infinity, ease: ["easeIn", "easeIn"], times: [0, 0.3, 1], delay },
        },
      }}
    />
  );
}
