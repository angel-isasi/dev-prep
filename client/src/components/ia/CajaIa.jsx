// La caja común de las funciones de IA: título, una línea de qué hace y el contenido.
// Pasa por PuertaIa: si la IA está apagada o falta tu código de acceso, eso es lo que se ve.
import { PuertaIa } from "../EvaluadorIa.jsx";
import base from "../EvaluadorIa.module.css";
import estilos from "./Ia.module.css";

const VEREDICTO = {
  bien: "sabia",
  acerto: "sabia",
  resuelto: "sabia",
  casi: "dude",
  mal: "no",
  no: "no",
};

/**
 * @param {{ titulo: string, detalle?: string, children: (olvidarClave: () => void) => import("react").ReactNode, vacio?: import("react").ReactNode }} props
 */
export function CajaIa({ titulo, detalle, children, vacio }) {
  return (
    <PuertaIa vacio={vacio}>
      {(olvidarClave) => (
        <section className={`${base.caja} ${estilos.caja}`} data-caja-ia>
          <div className={base.cabecera} data-caja-titulo>
            <span className={base.etiqueta}>{titulo}</span>
          </div>
          {detalle && (
            <p className={base.suave} data-caja-titulo>
              {detalle}
            </p>
          )}
          {children(olvidarClave)}
        </section>
      )}
    </PuertaIa>
  );
}

/** Puntaje o veredicto grande, con color. */
export function Veredicto({ valor, texto, puntaje }) {
  const color = puntaje != null ? (puntaje >= 8 ? "sabia" : puntaje >= 5 ? "dude" : "no") : (VEREDICTO[valor] ?? "dude");
  return (
    <div className={base.puntaje} data-veredicto={color}>
      {puntaje != null && <strong>{puntaje}/10</strong>}
      <span>{texto}</span>
    </div>
  );
}

/** Una lista con subtítulo (bien, falta, etc.). Si está vacía no dibuja nada. */
export function ListaIa({ titulo, items, tipo }) {
  if (!items?.length) return null;
  return (
    <div>
      <span className={base.subtitulo} data-tipo={tipo}>
        {titulo}
      </span>
      <ul>
        {items.map((x, i) => (
          <li key={i}>{x}</li>
        ))}
      </ul>
    </div>
  );
}

/** Un bloque de código de solo lectura, con números de línea. */
export function CodigoIa({ codigo }) {
  return (
    <pre className={estilos.codigo}>
      {String(codigo ?? "")
        .split("\n")
        .map((linea, i) => (
          <span key={i} className={estilos.linea}>
            <span className={estilos.numero} aria-hidden>
              {i + 1}
            </span>
            {linea || " "}
          </span>
        ))}
    </pre>
  );
}

export { base as estilosIa };
