// ShineBorder (Magic UI): un brillo de color que da vueltas por el borde del elemento padre.
// El padre necesita position: relative y un border-radius. La animación "shine" está en tailwind.css.
import { cn } from "../../lib/cn.js";

export function ShineBorder({ borderWidth = 1, duration = 14, shineColor = "var(--acento)", className, style }) {
  const colores = Array.isArray(shineColor) ? shineColor.join(",") : shineColor;
  return (
    <div
      aria-hidden
      style={{
        "--border-width": `${borderWidth}px`,
        "--duration": `${duration}s`,
        backgroundImage: `radial-gradient(transparent,transparent, ${colores},transparent,transparent)`,
        backgroundSize: "300% 300%",
        mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
        WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
        WebkitMaskComposite: "xor",
        maskComposite: "exclude",
        padding: "var(--border-width)",
        ...style,
      }}
      className={cn(
        "tw pointer-events-none absolute inset-0 size-full rounded-[inherit] will-change-[background-position] motion-safe:animate-shine",
        className,
      )}
    />
  );
}
