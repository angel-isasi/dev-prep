// Scroll suave en toda la página con Lenis (lenis.darkroom.engineering): la rueda del mouse
// desliza en vez de saltar de golpe. Solo en pantallas con mouse; en el celular el scroll
// táctil ya es suave y no se toca.
//
// Rendimiento: Lenis necesita que lo llamen en cada cuadro (requestAnimationFrame) mientras
// anima. En vez de dejar un bucle infinito (la app se trababa con eso, ver memoria de
// rendimiento), el bucle arranca cuando giras la rueda y se detiene solo al terminar.
import { useEffect } from "react";
import { useLocation } from "react-router";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

let lenis = null;
let contenedor = null;
let arrancarBucle = () => {};

/**
 * Lleva la pantalla arriba. Sin animación al cambiar de pantalla; con animación entre pasos
 * de una misma pantalla (por ejemplo, el siguiente paso del simulacro).
 */
export function subirArriba({ suave = false } = {}) {
  if (lenis) {
    lenis.scrollTo(0, { immediate: !suave, force: true });
    arrancarBucle();
  } else
    (contenedor ?? window).scrollTo({
      top: 0,
      behavior: suave ? "smooth" : "instant",
    });
}

/**
 * @param {import("react").RefObject<HTMLElement>} ref  el elemento que tiene el scroll (el <main> del Layout)
 */
export function useScrollSuave(ref) {
  const { pathname } = useLocation();

  useEffect(() => {
    contenedor = ref.current;
    const conMouse = window.matchMedia("(pointer: fine)").matches;
    const reducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!conMouse || reducido) return;

    lenis = new Lenis({
      wrapper: ref.current,
      content: ref.current.firstElementChild,
      autoRaf: false,
      lerp: 0.14, // qué tan rápido alcanza al destino: más alto, más directo
      wheelMultiplier: 1,
      allowNestedScroll: true, // los bloques de código y los diálogos con scroll propio siguen igual
      prevent: (nodo) => nodo.closest?.("[data-scroll-nativo], [role='dialog'], [data-radix-select-viewport]") != null,
    });

    let cuadro = null;
    let reanudar = false;
    const bucle = (t) => {
      // Lenis avanza según el tiempo desde su último cuadro. Si el bucle estuvo parado (no girabas la
      // rueda), ese tiempo serían segundos y saltaría de golpe al destino: se reinicia a un cuadro (~16 ms).
      if (reanudar) {
        lenis.time = t - 1000 / 60;
        reanudar = false;
      }
      lenis.raf(t);
      cuadro = lenis.isScrolling ? requestAnimationFrame(bucle) : null;
    };
    const arrancar = () => {
      if (cuadro == null) {
        reanudar = true;
        cuadro = requestAnimationFrame(bucle);
      }
    };
    arrancarBucle = arrancar;
    const quitar = lenis.on("virtual-scroll", arrancar);

    return () => {
      quitar?.();
      if (cuadro != null) cancelAnimationFrame(cuadro);
      lenis.destroy();
      lenis = null;
      contenedor = null;
      arrancarBucle = () => {};
    };
  }, [ref]);

  // Cada pantalla nueva empieza arriba
  useEffect(() => {
    subirArriba();
  }, [pathname]);
}
