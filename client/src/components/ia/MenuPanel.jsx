// Una pantalla de herramientas que se entiende de un vistazo, de arriba abajo:
// 1) una fila de fichas chicas (icono, nombre y duración) para elegir la herramienta;
// 2) la herramienta a todo el ancho;
// 3) el recorrido en 3 fichas numeradas (cada paso con su ejemplo dibujado, ver guias.js).
// Lo usan Entrevistas > Simular, Inglés > Con IA y Practicar > Entrena con IA.
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { abrirHerramientaIa, usoHerramienta } from "../../lib/ia.js";
import { IconoFlechaDer } from "../Iconos.jsx";
import { MAS } from "./guias.js";
import estilos from "./MenuPanel.module.css";

/**
 * Un ejemplo dibujado: en vez de explicar con texto qué hace la herramienta, se muestra cómo se ve.
 * @param {{ lineas: { tipo: "ia"|"tu"|"cambio"|"bien"|"nota"|"codigo"|"puntaje", texto?: string, mal?: string, bien?: string }[] }} props
 */
function Ejemplo({ lineas, titulo = "Así se ve", numero, plano = false }) {
  return (
    <aside className={plano ? estilos.plano : estilos.ejemplo} aria-label={titulo || undefined}>
      {numero ? (
        <h3 className={estilos.paso}>
          <b>{numero}</b>
          {titulo}
        </h3>
      ) : (
        titulo && <span className="etiqueta">{titulo}</span>
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

/** Las líneas dibujadas de un bloque, sin su caja (para juntar varios en una misma ficha). */
function Lineas({ lineas }) {
  return <Ejemplo lineas={lineas} titulo="" plano />;
}

/**
 * Una herramienta como tablero (mismo lenguaje que Entrevistas > Tu preparación):
 * arriba, a la izquierda la herramienta con su duración en grande y, a la derecha, un ejemplo de punta
 * a punta; abajo, tus cifras en columna, lo que conviene saber antes y a dónde más ir.
 */
function Tablero({ actual, relacionados, children }) {
  const [antes, durante, despues] = MAS[actual.id] ?? [];
  const [uso, setUso] = useState(() => usoHerramienta(actual.id));
  useEffect(() => {
    abrirHerramientaIa(actual.id);
    // Tras cada pedido las cifras se ponen al día al volver a mirar la pantalla
    const t = setInterval(() => setUso(usoHerramienta(actual.id)), 4000);
    return () => {
      clearInterval(t);
      abrirHerramientaIa(null);
    };
  }, [actual.id]);
  const [numero, ...unidad] = actual.minutos.split(" ");
  return (
    <div className={estilos.tablero}>
      <section className={`tarjeta-protagonista ${estilos.entera}`}>
        <header className={estilos.enteraCabeza}>
          <strong className={estilos.minutos}>
            {unidad.length > 1 ? actual.minutos.replace(" min", "") : numero}
            <small>min</small>
          </strong>
          <div>
            <h2>{actual.titulo}</h2>
            <p>{actual.detalle}</p>
          </div>
        </header>
        <div className={estilos.herramienta}>{children}</div>
      </section>

      {durante && despues && (
        <section className={`tarjeta ${estilos.asi}`}>
          <span className="etiqueta">Así se ve</span>
          <Lineas lineas={durante.lineas} />
          <span className={estilos.separador}>{despues.titulo}</span>
          <Lineas lineas={despues.lineas} />
        </section>
      )}

      <div className={estilos.abajo}>
        <dl className={estilos.cifras}>
          <div className="tarjeta">
            <dt>Días que la usaste</dt>
            <dd>{uso.dias}</dd>
          </div>
          <div className="tarjeta">
            <dt>Última vez</dt>
            <dd>{uso.ultima ?? "–"}</dd>
          </div>
          <div className="tarjeta">
            <dt>Pedidos a la IA</dt>
            <dd>{uso.pedidos}</dd>
          </div>
        </dl>
        {antes && (
          <section className={`tarjeta ${estilos.bloqueAbajo}`}>
            <span className="etiqueta">{antes.titulo}</span>
            <Lineas lineas={antes.lineas} />
          </section>
        )}
        {relacionados.length > 0 && (
          <section className={`tarjeta ${estilos.bloqueAbajo}`}>
            <span className="etiqueta">También te sirve</span>
            <div className={estilos.relacionados}>
              {relacionados.map((r) => (
                <Link key={r.a} to={r.a}>
                  {r.texto}
                  <IconoFlechaDer tamano={14} />
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

/**
 * @param {object} p
 * @param {{ id: string, titulo: string, detalle: string, minutos: string, ia?: boolean, Icono: Function, pasos: string[], ejemplo?: object[] }[]} p.items
 * @param {string} p.elegida            id del item abierto
 * @param {(id: string) => void} p.alElegir
 * @param {string} p.etiqueta           nombre accesible del menú
 * @param {{ a: string, titulo: string, detalle: string, Icono: Function }[]} [p.enlaces]  fichas que llevan a otra pantalla
 * @param {{ a: string, texto: string }[]} [p.relacionados]  "También te sirve": enlaces a pantallas afines
 * @param {import("react").ReactNode} p.children     la herramienta elegida
 */
export function MenuPanel({ items, elegida, alElegir, etiqueta, enlaces = [], relacionados = [], children }) {
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

      {actual.sinRecorrido ? (
        <div className={estilos.principal} key={actual.id}>
          {children}
        </div>
      ) : (
        <Tablero key={actual.id} actual={actual} relacionados={relacionados}>
          {children}
        </Tablero>
      )}
    </div>
  );
}
