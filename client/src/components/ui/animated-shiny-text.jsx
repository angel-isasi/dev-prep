// AnimatedShinyText (Magic UI): un reflejo de luz que cruza el texto cada pocos segundos.
// La animación "shiny-text" está en tailwind.css.
import { cn } from "../../lib/cn.js";

export function AnimatedShinyText({ children, className, shimmerWidth = 120 }) {
  return (
    <span
      style={{ "--shiny-width": `${shimmerWidth}px` }}
      className={cn(
        "tw text-muted-foreground",
        // El reflejo: un degradado claro del ancho de --shiny-width que se desliza sobre el texto
        "animate-shiny-text bg-size-[var(--shiny-width)_100%] bg-clip-text bg-position-[0_0] bg-no-repeat [transition:background-position_1s_cubic-bezier(.6,.6,0,1)_infinite] motion-reduce:animate-none",
        "bg-linear-to-r from-transparent via-black/80 via-50% to-transparent dark:via-white/90",
        className,
      )}
    >
      {children}
    </span>
  );
}
