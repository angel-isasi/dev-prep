// Spotlight (Aceternity UI, versión "spotlight-new"): dos focos de luz que bajan en diagonal
// desde las esquinas superiores y se mecen despacio. Va dentro de un padre con position: relative.
// Adaptado: luz lavanda en lugar de azul, y quieta con "reducir movimiento".
import { motion, useReducedMotion } from "motion/react";

const LUZ = "179, 168, 255"; // el lavanda de --acento en modo oscuro

export function Spotlight({
  gradientFirst = `radial-gradient(68.54% 68.72% at 55.02% 31.46%, rgba(${LUZ}, .10) 0, rgba(${LUZ}, .03) 50%, rgba(${LUZ}, 0) 80%)`,
  gradientSecond = `radial-gradient(50% 50% at 50% 50%, rgba(${LUZ}, .07) 0, rgba(${LUZ}, .02) 80%, transparent 100%)`,
  gradientThird = `radial-gradient(50% 50% at 50% 50%, rgba(${LUZ}, .05) 0, rgba(${LUZ}, .02) 80%, transparent 100%)`,
  translateY = -350,
  width = 560,
  height = 1380,
  smallWidth = 240,
  duration = 7,
  xOffset = 100,
}) {
  const reducido = useReducedMotion();
  const vaiven = (x) =>
    reducido ? {} : { animate: { x: [0, x, 0] }, transition: { duration, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" } };

  const lado = (izquierdo) => {
    const giro = izquierdo ? -45 : 45;
    const esquina = izquierdo ? "left-0" : "right-0";
    const origen = izquierdo ? "origin-top-left" : "origin-top-right";
    const signo = izquierdo ? 1 : -1;
    return (
      <motion.div {...vaiven(signo * xOffset)} className={`pointer-events-none absolute top-0 ${esquina} h-full w-full`}>
        <div
          className={`absolute top-0 ${esquina}`}
          style={{ transform: `translateY(${translateY}px) rotate(${giro}deg)`, background: gradientFirst, width, height }}
        />
        <div
          className={`absolute top-0 ${esquina} ${origen}`}
          style={{ transform: `rotate(${giro}deg) translate(${signo * 5}%, -50%)`, background: gradientSecond, width: smallWidth, height }}
        />
        <div
          className={`absolute top-0 ${esquina} ${origen}`}
          style={{ transform: `rotate(${giro}deg) translate(${signo * -180}%, -70%)`, background: gradientThird, width: smallWidth, height }}
        />
      </motion.div>
    );
  };

  return (
    <motion.div
      aria-hidden
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5 }}
      className="tw pointer-events-none absolute inset-0 overflow-hidden"
    >
      {lado(true)}
      {lado(false)}
    </motion.div>
  );
}
