import { useAutoAnimate } from "@formkit/auto-animate/react";

/**
 * Una lista cuyos elementos entran, salen y se reacomodan con una animación corta
 * (AutoAnimate, auto-animate.formkit.com) en vez de saltar de golpe al filtrar o agregar.
 * Respeta "reducir movimiento" del sistema.
 * @param {{ como?: "ul" | "ol" | "div", children: import("react").ReactNode } & object} props
 */
export function ListaAnimada({ como: Etiqueta = "ul", children, ...resto }) {
  const [ref] = useAutoAnimate({
    duration: 220,
    easing: "cubic-bezier(0.2, 0.8, 0.2, 1)",
  });
  return (
    <Etiqueta ref={ref} {...resto}>
      {children}
    </Etiqueta>
  );
}
