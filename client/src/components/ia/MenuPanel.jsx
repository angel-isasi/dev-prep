// Una pantalla de herramientas que se entiende de un vistazo, de arriba abajo:
// 1) una fila de fichas chicas (icono, nombre y duración) para elegir la herramienta;
// 2) la herramienta a todo el ancho;
// 3) el recorrido en 3 fichas numeradas (cada paso con su ejemplo dibujado, ver guias.js).
// Lo usan Entrevistas > Simular, Inglés > Con IA y Practicar > Entrena con IA.
import { Link } from "react-router";
import { IconoFlechaDer } from "../Iconos.jsx";
import { MAS } from "./guias.js";
import estilos from "./MenuPanel.module.css";

/**
 * Un ejemplo dibujado: en vez de explicar con texto qué hace la herramienta, se muestra cómo se ve.
 * @param {{ lineas: { tipo: "ia"|"tu"|"cambio"|"bien"|"nota"|"codigo"|"puntaje", texto?: string, mal?: string, bien?: string }[] }} props
 */
function Ejemplo({ lineas, titulo = "Así se ve", numero }) {
  return (
    <aside className={estilos.ejemplo} aria-label={titulo}>
      {numero ? (
        <h3 className={estilos.paso}>
          <b>{numero}</b>
          {titulo}
        </h3>
      ) : (
        <span className="etiqueta">{titulo}</span>
      )}
      {lineas.map((l, i) => {
        if (l.tipo === "dato") {
          return (
            <p key={i} className={estilos.dato}>
              <b>{l.clave}</b>
              <span>{l.texto}</span>
            </p>
          );
        }
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
 * Las fichas con ejemplos que van debajo de una herramienta (ver guias.js). `columna`: una debajo de otra.
 * @param {{ id: string, columna?: boolean }} props
 */
export function Bloques({ id, columna = false, numerado = false }) {
  const bloques = MAS[id];
  if (!bloques) return null;
  return (
    <div className={estilos.bloques} data-columna={columna} data-numerado={numerado}>
      {bloques.map((b, i) => (
        <Ejemplo key={b.titulo} titulo={b.titulo} lineas={b.lineas} numero={numerado ? i + 1 : undefined} />
      ))}
    </div>
  );
}

/** La tira de pasos numerados. */
export function TiraPasos({ pasos }) {
  return (
    <ol className={estilos.pasos} aria-label="Cómo funciona">
      {pasos.map((p) => (
        <li key={p}>{p}</li>
      ))}
    </ol>
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

      <div className={estilos.principal} key={actual.id}>
        {children}
      </div>

      {/* El recorrido en 3 fichas numeradas: cada una es un paso con su ejemplo */}
      <Bloques key={`m-${actual.id}`} id={actual.id} numerado />
    </div>
  );
}
