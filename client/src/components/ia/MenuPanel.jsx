// Una pantalla de herramientas que se lee de arriba abajo, como un tablero:
// 1) arriba, una fila de fichas a todo el ancho para elegir la herramienta;
// 2) debajo, la herramienta elegida y, a su lado, "Cómo funciona" en 3 pasos.
// Lo usan Entrevistas > Simular, Inglés > Con IA y Practicar > Entrena con IA.
import { Link } from "react-router";
import { IconoFlechaDer } from "../Iconos.jsx";
import estilos from "./MenuPanel.module.css";

/**
 * @param {object} p
 * @param {{ id: string, grupo: string, titulo: string, detalle: string, minutos: string, ia?: boolean, Icono: Function, pasos: string[], consejos: string[] }[]} p.items
 * @param {string} p.elegida            id del item abierto
 * @param {(id: string) => void} p.alElegir
 * @param {string} p.etiqueta           nombre accesible del menú
 * @param {{ a: string, titulo: string, detalle: string, Icono: Function, grupo?: string }[]} [p.enlaces]  fichas que llevan a otra pantalla
 * @param {import("react").ReactNode} p.children     la herramienta elegida
 */
export function MenuPanel({ items, elegida, alElegir, etiqueta, enlaces = [], children }) {
  const actual = items.find((i) => i.id === elegida) ?? items[0];
  return (
    <div className={estilos.marco}>
      <nav className={estilos.menu} aria-label={etiqueta}>
        {items.map(({ id, grupo, titulo, detalle, minutos, ia, Icono }) => (
          <button key={id} type="button" className={estilos.item} data-activo={id === actual.id} aria-current={id === actual.id} onClick={() => alElegir(id)}>
            <span className={estilos.arriba}>
              <span className={estilos.icono} aria-hidden>
                <Icono />
              </span>
              <span className={estilos.meta}>
                {minutos}
                {ia && <em>IA</em>}
              </span>
            </span>
            <span className={estilos.grupo}>{grupo}</span>
            <strong>{titulo}</strong>
            <small>{detalle}</small>
          </button>
        ))}
        {enlaces.map(({ a, titulo, detalle, Icono, grupo = "Otra pantalla" }) => (
          <Link key={a} to={a} className={estilos.item} data-enlace>
            <span className={estilos.arriba}>
              <span className={estilos.icono} aria-hidden>
                <Icono />
              </span>
              <span className={estilos.meta}>
                <IconoFlechaDer />
              </span>
            </span>
            <span className={estilos.grupo}>{grupo}</span>
            <strong>{titulo}</strong>
            <small>{detalle}</small>
          </Link>
        ))}
      </nav>

      <div className={estilos.panel}>
        <div className={estilos.principal} key={actual.id}>
          {children}
        </div>
        <aside className={estilos.guia}>
          <h3>Cómo funciona</h3>
          <ol className={estilos.pasos}>
            {actual.pasos.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ol>
          <ul className={estilos.consejos}>
            {actual.consejos.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  );
}
