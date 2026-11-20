// Menú de herramientas agrupadas a la izquierda, la elegida al centro y su guía ("Cómo funciona" y
// consejos) a la derecha. Lo usan Entrevistas > Simular e Inglés > Con IA, para que se vean iguales.
import { useMemo } from "react";
import estilos from "./MenuPanel.module.css";

/**
 * @param {object} p
 * @param {{ id: string, grupo: string, titulo: string, detalle: string, minutos: string, ia?: boolean, Icono: Function, pasos: string[], consejos: string[] }[]} p.items
 * @param {string} p.elegida            id del item abierto
 * @param {(id: string) => void} p.alElegir
 * @param {string} p.etiqueta           nombre accesible del menú
 * @param {import("react").ReactNode} [p.extraMenu]  algo más al final del menú (por ejemplo un enlace)
 * @param {import("react").ReactNode} p.children     la herramienta elegida
 */
export function MenuPanel({ items, elegida, alElegir, etiqueta, extraMenu, children }) {
  const actual = items.find((i) => i.id === elegida) ?? items[0];
  const grupos = useMemo(() => [...new Set(items.map((i) => i.grupo))], [items]);
  return (
    <div className={estilos.marco}>
      <nav className={estilos.menu} aria-label={etiqueta}>
        {grupos.map((g) => (
          <div key={g} className={estilos.grupo}>
            <span className="etiqueta">{g}</span>
            {items
              .filter((i) => i.grupo === g)
              .map(({ id, titulo, detalle, minutos, ia, Icono }) => (
                <button key={id} type="button" className={estilos.item} data-activo={id === actual.id} aria-current={id === actual.id} onClick={() => alElegir(id)}>
                  <span className={estilos.icono} aria-hidden>
                    <Icono />
                  </span>
                  <span className={estilos.texto}>
                    <strong>{titulo}</strong>
                    <small>{detalle}</small>
                  </span>
                  <span className={estilos.meta}>
                    {minutos}
                    {ia && <em>IA</em>}
                  </span>
                </button>
              ))}
          </div>
        ))}
        {extraMenu}
      </nav>

      <div className={estilos.panel}>
        <div className={estilos.principal} key={actual.id}>
          {children}
        </div>
        <aside className={estilos.guia}>
          <div>
            <h3>Cómo funciona</h3>
            <ol className={estilos.pasos}>
              {actual.pasos.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ol>
          </div>
          <div className={estilos.consejos}>
            <h3>Para sacarle provecho</h3>
            <ul>
              {actual.consejos.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </div>
          <div className={estilos.pie}>
            <span>Dura {actual.minutos}</span>
            {actual.ia ? <em>Usa IA</em> : <span>· sin IA, salvo el informe</span>}
          </div>
        </aside>
      </div>
    </div>
  );
}

/** Las clases del menú, para dibujar un enlace con la misma forma en `extraMenu`. */
export { estilos as estilosMenu };
