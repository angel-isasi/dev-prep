// Particles (Magic UI): partículas en un <canvas> que flotan y se acercan un poco al mouse.
// Adaptado: con "reducir movimiento" se dibujan quietas, y el color acepta #rgb, #rrggbb o rgb().
import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";
import { cn } from "../../lib/cn.js";

function aRgb(color) {
  const rgb = color.match(/rgba?\(([^)]+)\)/);
  if (rgb) return rgb[1].split(/[ ,/]+/).slice(0, 3).map(Number);
  let hex = color.replace("#", "").trim();
  if (hex.length === 3) hex = [...hex].map((c) => c + c).join("");
  const n = parseInt(hex, 16) || 0xffffff;
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function Particles({
  className,
  quantity = 60,
  staticity = 50,
  ease = 50,
  size = 0.4,
  color = "#ffffff",
  vx = 0,
  vy = 0,
}) {
  const canvasRef = useRef(null);
  const contenedorRef = useRef(null);
  const reducido = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    const contenedor = contenedorRef.current;
    if (!canvas || !contenedor) return;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const rgb = aRgb(color).join(", ");
    const tam = { w: 0, h: 0 };
    const mouse = { x: 0, y: 0 };
    let circulos = [];
    let raf = null;
    let espera = null;

    const nuevo = () => ({
      x: Math.random() * tam.w,
      y: Math.random() * tam.h,
      tx: 0,
      ty: 0,
      size: Math.floor(Math.random() * 2) + size,
      alpha: reducido ? 0.5 : 0,
      objetivo: Number((Math.random() * 0.6 + 0.1).toFixed(1)),
      dx: (Math.random() - 0.5) * 0.1,
      dy: (Math.random() - 0.5) * 0.1,
      magnetismo: 0.1 + Math.random() * 4,
    });

    const dibujar = (c) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.translate(c.tx, c.ty);
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.size, 0, 2 * Math.PI);
      ctx.fillStyle = `rgba(${rgb}, ${c.alpha})`;
      ctx.fill();
    };

    const iniciar = () => {
      tam.w = contenedor.offsetWidth;
      tam.h = contenedor.offsetHeight;
      canvas.width = tam.w * dpr;
      canvas.height = tam.h * dpr;
      canvas.style.width = `${tam.w}px`;
      canvas.style.height = `${tam.h}px`;
      circulos = Array.from({ length: quantity }, nuevo);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      circulos.forEach(dibujar);
    };

    const animar = () => {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      circulos.forEach((c, i) => {
        // Se apagan cerca de los bordes y se encienden poco a poco al nacer
        const borde = Math.min(c.x + c.tx - c.size, tam.w - c.x - c.tx - c.size, c.y + c.ty - c.size, tam.h - c.y - c.ty - c.size);
        const cerca = Math.max(0, Math.min(borde / 20, 1));
        c.alpha = cerca >= 1 ? Math.min(c.alpha + 0.02, c.objetivo) : c.objetivo * cerca;
        c.x += c.dx + vx;
        c.y += c.dy + vy;
        c.tx += (mouse.x / (staticity / c.magnetismo) - c.tx) / ease;
        c.ty += (mouse.y / (staticity / c.magnetismo) - c.ty) / ease;
        dibujar(c);
        if (c.x < -c.size || c.x > tam.w + c.size || c.y < -c.size || c.y > tam.h + c.size) {
          circulos[i] = nuevo();
          // Las que suben (vy < 0) renacen abajo, como chispas
          if (vy < 0) circulos[i].y = tam.h;
          if (vy > 0) circulos[i].y = 0;
        }
      });
      raf = requestAnimationFrame(animar);
    };

    const alMover = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left - tam.w / 2;
      const y = e.clientY - rect.top - tam.h / 2;
      if (Math.abs(x) < tam.w / 2 && Math.abs(y) < tam.h / 2) {
        mouse.x = x;
        mouse.y = y;
      }
    };
    const alRedimensionar = () => {
      clearTimeout(espera);
      espera = setTimeout(iniciar, 200);
    };

    iniciar();
    if (!reducido) {
      animar();
      window.addEventListener("mousemove", alMover);
    }
    window.addEventListener("resize", alRedimensionar);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(espera);
      window.removeEventListener("mousemove", alMover);
      window.removeEventListener("resize", alRedimensionar);
    };
  }, [color, quantity, staticity, ease, size, vx, vy, reducido]);

  return (
    <div ref={contenedorRef} className={cn("tw pointer-events-none", className)} aria-hidden>
      <canvas ref={canvasRef} className="size-full" />
    </div>
  );
}
