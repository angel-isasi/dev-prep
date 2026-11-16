// TerminalAnimada (inspirada en Terminal Animation de Cult UI, cult-ui.com/docs/components/terminal-animation):
// una terminal que escribe sus comandos letra por letra y muestra la salida, como si alguien los tipeara.
// Empieza cuando entra en pantalla y corre UNA sola vez (sin bucles). Con "reducir movimiento" aparece completa.
//   <TerminalAnimada lineas={[{ cmd: "git status" }, { out: "On branch main" }]} />
import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import estilos from "./terminal-animada.module.css";

/**
 * @param {{ lineas: ({ cmd: string } | { out: string })[], titulo?: string, velocidad?: number }} props
 *   velocidad: milisegundos por letra al escribir un comando
 */
export function TerminalAnimada({ lineas, titulo = "terminal", velocidad = 32 }) {
  const reducido = useReducedMotion();
  const ref = useRef(null);
  const [visibles, setVisibles] = useState(reducido ? lineas.length : 0); // líneas completas
  const [letras, setLetras] = useState(0); // letras de la línea que se está escribiendo
  const [empezo, setEmpezo] = useState(reducido);

  useEffect(() => {
    if (empezo || !ref.current) return;
    const o = new IntersectionObserver(([e]) => e.isIntersecting && setEmpezo(true), { threshold: 0.4 });
    o.observe(ref.current);
    return () => o.disconnect();
  }, [empezo]);

  useEffect(() => {
    if (!empezo || visibles >= lineas.length) return;
    const actual = lineas[visibles];
    if (actual.out != null) {
      const t = setTimeout(() => setVisibles((v) => v + 1), 260);
      return () => clearTimeout(t);
    }
    if (letras < actual.cmd.length) {
      const t = setTimeout(() => setLetras((n) => n + 1), velocidad + (Math.random() * velocidad) / 2);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => {
      setVisibles((v) => v + 1);
      setLetras(0);
    }, 380);
    return () => clearTimeout(t);
  }, [empezo, visibles, letras, lineas, velocidad]);

  const escribiendo = visibles < lineas.length && lineas[visibles].cmd != null ? lineas[visibles] : null;
  return (
    <div ref={ref} className={estilos.terminal} aria-label={lineas.map((l) => l.cmd ?? l.out).join(". ")}>
      <div className={estilos.barra} aria-hidden>
        <i />
        <i />
        <i />
        <span>{titulo}</span>
      </div>
      <pre className={estilos.cuerpo} aria-hidden>
        {lineas.slice(0, visibles).map((l, i) =>
          l.cmd != null ? (
            <div key={i}>
              <span className={estilos.prompt}>$</span> {l.cmd}
            </div>
          ) : (
            <div key={i} className={estilos.salida}>
              {l.out}
            </div>
          ),
        )}
        {escribiendo && (
          <div>
            <span className={estilos.prompt}>$</span> {escribiendo.cmd.slice(0, letras)}
            <span className={estilos.cursor} />
          </div>
        )}
        {visibles >= lineas.length && (
          <div>
            <span className={estilos.prompt}>$</span> <span className={estilos.cursor} data-final />
          </div>
        )}
      </pre>
    </div>
  );
}
