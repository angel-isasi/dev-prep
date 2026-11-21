// AuroraText (Magic UI): texto con un degradado de colores que se mueve como una aurora.
// La animación "aurora" está definida en styles/tailwind.css.
import { memo } from "react";
import { cn } from "../../lib/cn.js";

export const AuroraText = memo(function AuroraText({
  children,
  className,
  colors = ["var(--acento)", "#cbcbcb", "var(--exito)", "#bdbdbd"],
  speed = 1,
}) {
  const estilo = {
    backgroundImage: `linear-gradient(135deg, ${colors.join(", ")}, ${colors[0]})`,
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    animationDuration: `${10 / speed}s`,
  };

  return (
    <span className={cn("tw relative inline-block", className)}>
      {/* Los lectores de pantalla leen el texto normal; el degradado es solo visual */}
      <span className="sr-only">{children}</span>
      <span
        className="relative animate-aurora bg-size-[200%_auto] bg-clip-text text-transparent motion-reduce:animate-none"
        style={estilo}
        aria-hidden
      >
        {children}
      </span>
    </span>
  );
});
