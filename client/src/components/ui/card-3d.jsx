// 3D Card (Aceternity UI): la tarjeta se inclina siguiendo al mouse y sus partes "flotan"
// a distintas alturas (translateZ), así parece que tiene capas.
//   <CardContainer><CardBody><CardItem translateZ={40}>...</CardItem></CardBody></CardContainer>
// Adaptado: sin los tamaños fijos del ejemplo, inclinación más suave y nada con "reducir movimiento".
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { cn } from "../../lib/cn.js";

const ContextoMouse = createContext([false, () => {}]);

export function CardContainer({ children, className, containerClassName, intensidad = 35 }) {
  const ref = useRef(null);
  const reducido = useReducedMotion();
  const [dentro, setDentro] = useState(false);

  const mover = (e) => {
    if (!ref.current || reducido) return;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const x = (e.clientX - left - width / 2) / intensidad;
    const y = (e.clientY - top - height / 2) / intensidad;
    ref.current.style.transform = `rotateY(${x}deg) rotateX(${-y}deg)`;
  };

  const salir = () => {
    setDentro(false);
    if (ref.current) ref.current.style.transform = "rotateY(0deg) rotateX(0deg)";
  };

  return (
    <ContextoMouse.Provider value={[dentro && !reducido, setDentro]}>
      <div className={cn("tw", containerClassName)} style={{ perspective: "1000px" }}>
        <div
          ref={ref}
          onMouseEnter={() => setDentro(true)}
          onMouseMove={mover}
          onMouseLeave={salir}
          className={cn("relative transition-all duration-200 ease-linear", className)}
          style={{ transformStyle: "preserve-3d" }}
        >
          {children}
        </div>
      </div>
    </ContextoMouse.Provider>
  );
}

export function CardBody({ children, className }) {
  return <div className={cn("[transform-style:preserve-3d] *:[transform-style:preserve-3d]", className)}>{children}</div>;
}

export function CardItem({ as: Etiqueta = "div", children, className, translateX = 0, translateY = 0, translateZ = 0, rotateZ = 0, ...resto }) {
  const ref = useRef(null);
  const [dentro] = useContext(ContextoMouse);

  useEffect(() => {
    if (!ref.current) return;
    ref.current.style.transform = dentro
      ? `translateX(${translateX}px) translateY(${translateY}px) translateZ(${translateZ}px) rotateZ(${rotateZ}deg)`
      : "translateX(0px) translateY(0px) translateZ(0px) rotateZ(0deg)";
  }, [dentro, translateX, translateY, translateZ, rotateZ]);

  return (
    <Etiqueta ref={ref} className={cn("transition duration-200 ease-linear", className)} {...resto}>
      {children}
    </Etiqueta>
  );
}
