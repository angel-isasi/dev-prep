// Una pantalla de herramientas que se entiende de un vistazo, de arriba abajo:
// 1) una fila de fichas chicas (icono, nombre y duración) para elegir la herramienta;
// 2) los 3 pasos en una tira, con pocas palabras;
// 3) la herramienta a la izquierda y, a la derecha, un ejemplo de lo que vas a recibir.
// Lo usan Entrevistas > Simular, Inglés > Con IA y Practicar > Entrena con IA.
import { Link } from "react-router";
import { IconoFlechaDer } from "../Iconos.jsx";
import estilos from "./MenuPanel.module.css";

/**
 * Un ejemplo dibujado: en vez de explicar con texto qué hace la herramienta, se muestra cómo se ve.
 * @param {{ lineas: { tipo: "ia"|"tu"|"cambio"|"bien"|"nota"|"codigo"|"puntaje", texto?: string, mal?: string, bien?: string }[] }} props
 */
function Ejemplo({ lineas }) {
  return (
    <aside className={estilos.ejemplo} aria-label="Ejemplo">
      <span className="etiqueta">Así se ve</span>
      {lineas.map((l, i) => {
        if (l.tipo === "cambio") {
          return (
            <p key={i} className={estilos.cambio}>
              <del>{l.mal}</del>
              <span aria-hidden>→</span>
              <ins>{l.bien}</ins>
            </p>
          );
        }
        if (l.tipo === "codigo") return <pre key={i} className={estilos.codigo}>{l.texto}</pre>;
        return (
          <p key={i} className={estilos.linea} data-tipo={l.tipo}>
            {l.texto}
          </p>
        );
      })}
    </aside>
  );
}

/**
 * @param {object} p
 * @param {{ id: string, titulo: string, detalle: string, minutos: string, ia?: boolean, Icono: Function, pasos: string[], ejemplo?: object[] }[]} p.items
 * @param {string} p.elegida            id del item abierto
 * @param {(id: string) => void} p.alElegir
 * @param {string} p.etiqueta           nombre accesible del menú
 * @param {{ a: string, titulo: string, detalle: string, Icono: Function }[]} [p.enlaces]  fichas que llevan a otra pantalla
 * @param {import("react").ReactNode} p.children     la herramienta elegida
 */
export function MenuPanel({ items, elegida, alElegir, etiqueta, enlaces = [], children }) {
  const actual = items.find((i) => i.id === elegida) ?? items[0];
  return (
    <div className={estilos.marco}>
      <nav className={estilos.menu} aria-label={etiqueta}>
        {items.map(({ id, titulo, detalle, minutos, ia, Icono }) => (
          <button key={id} type="button" className={estilos.item} title={detalle} data-activo={id === actual.id} aria-current={id === actual.id} onClick={() => alElegir(id)}>
            <span className={estilos.icono} aria-hidden>
              <Icono />
            </span>
            <strong>{titulo}</strong>
            <small>
              {minutos}
              {ia && " · IA"}
            </small>
          </button>
        ))}
        {enlaces.map(({ a, titulo, detalle, Icono }) => (
          <Link key={a} to={a} className={estilos.item} title={detalle} data-enlace>
            <span className={estilos.icono} aria-hidden>
              <Icono />
            </span>
            <strong>{titulo}</strong>
            <small>
              Abrir <IconoFlechaDer tamano={12} />
            </small>
          </Link>
        ))}
      </nav>

      <ol className={estilos.pasos} aria-label="Cómo funciona">
        {actual.pasos.map((p) => (
          <li key={p}>{p}</li>
        ))}
      </ol>

      <div className={estilos.panel} data-con-ejemplo={!!actual.ejemplo}>
        <div className={estilos.principal} key={actual.id}>
          {children}
        </div>
        {actual.ejemplo && <Ejemplo key={`e-${actual.id}`} lineas={actual.ejemplo} />}
      </div>
    </div>
  );
}
