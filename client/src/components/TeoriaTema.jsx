// Teoría de un tema de Aprender, organizada para leer sin bajar tanto:
// - Arriba, "En una frase" a todo el ancho.
// - Al medio, tres columnas: el índice de conceptos (vas en el orden que quieras y marca los que leíste),
//   un concepto a la vez (o todos seguidos, si lo prefieres) y la chuleta siempre a la vista.
// - Abajo, los errores típicos en tarjetas y las preguntas de entrevista para pensar antes de ver la respuesta.
// Si un tema no tiene las secciones de siempre, se muestra el texto completo como antes.
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { Markdown } from "./Markdown.jsx";
import { IconoFlechaDer, IconoFlechaIzq } from "./Iconos.jsx";
import { partesTeoria } from "../lib/teoria.js";
import { irA } from "../hooks/useScrollSuave.js";
import estilos from "./TeoriaTema.module.css";

const CLAVE_MODO = "devprep.teoriaModo";
const CLAVE_LEIDOS = "devprep.teoriaLeidos";

function leer(clave, defecto) {
  try {
    return JSON.parse(localStorage.getItem(clave)) ?? defecto;
  } catch {
    return defecto;
  }
}

function guardar(clave, valor) {
  try {
    localStorage.setItem(clave, JSON.stringify(valor));
  } catch {
    // sin espacio o en modo privado: no pasa nada, solo no se recuerda
  }
}

/** Títulos con `código` y **negritas** en una sola línea. */
function EnLinea({ texto }) {
  return texto.split(/(`[^`]+`)/).map((t, i) =>
    t.length > 1 && t.startsWith("`") && t.endsWith("`") ? (
      <code key={i}>{t.slice(1, -1)}</code>
    ) : (
      <Fragment key={i}>{t.replace(/\*\*/g, "")}</Fragment>
    ),
  );
}

export function TeoriaTema({ id, markdown }) {
  const partes = useMemo(() => partesTeoria(markdown), [markdown]);
  if (!partes)
    return (
      <div className={`tarjeta ${estilos.simple}`}>
        <Markdown>{markdown}</Markdown>
      </div>
    );
  return <TeoriaOrganizada key={id} id={id} {...partes} />;
}

function TeoriaOrganizada({ id, frase, introduccion, conceptos, errores, erroresTexto, chuleta, entrevista, entrevistaTexto }) {
  const [modo, setModo] = useState(() => leer(CLAVE_MODO, "uno"));
  const [actual, setActual] = useState(0);
  const [leidos, setLeidos] = useState(() => new Set(leer(CLAVE_LEIDOS, {})[id] ?? []));
  const [abiertas, setAbiertas] = useState(() => new Set());
  const lectura = useRef(null);
  const tarjetas = useRef([]);
  const erroresRef = useRef(null);
  const entrevistaRef = useRef(null);
  const n = conceptos.length;

  // Lo que ves cuenta como leído (se recuerda en este dispositivo)
  useEffect(() => {
    setLeidos((previo) => {
      if (previo.has(actual)) return previo;
      const nuevo = new Set(previo).add(actual);
      guardar(CLAVE_LEIDOS, { ...leer(CLAVE_LEIDOS, {}), [id]: [...nuevo] });
      return nuevo;
    });
  }, [actual, id]);

  // Todo seguido: el índice marca el concepto que tienes a la vista
  useEffect(() => {
    if (modo !== "seguido") return;
    const observador = new IntersectionObserver(
      (entradas) => {
        const visible = entradas.find((e) => e.isIntersecting);
        if (visible) setActual(Number(visible.target.dataset.indice));
      },
      { rootMargin: "-25% 0px -65% 0px" },
    );
    tarjetas.current.forEach((t) => t && observador.observe(t));
    return () => observador.disconnect();
  }, [modo]);

  // Uno a la vez: las flechas del teclado cambian de concepto
  useEffect(() => {
    if (modo !== "uno") return;
    function alTeclear(e) {
      if (e.target.closest?.("input, textarea, select, [contenteditable]")) return;
      if (e.key === "ArrowRight") setActual((a) => Math.min(a + 1, n - 1));
      if (e.key === "ArrowLeft") setActual((a) => Math.max(a - 1, 0));
    }
    window.addEventListener("keydown", alTeclear);
    return () => window.removeEventListener("keydown", alTeclear);
  }, [modo, n]);

  function ir(i) {
    if (modo === "seguido") {
      irA(tarjetas.current[i]);
      return;
    }
    setActual(i);
    // Si bajaste leyendo, vuelve al inicio del concepto nuevo
    if (lectura.current && lectura.current.getBoundingClientRect().top < 0) irA(lectura.current);
  }

  function cambiarModo(nuevo) {
    setModo(nuevo);
    guardar(CLAVE_MODO, nuevo);
    if (nuevo === "seguido") requestAnimationFrame(() => irA(tarjetas.current[actual]));
  }

  function alternar(i) {
    setAbiertas((previo) => {
      const nuevo = new Set(previo);
      nuevo.has(i) ? nuevo.delete(i) : nuevo.add(i);
      return nuevo;
    });
  }

  const concepto = (c, i) => (
    <article
      key={i}
      ref={(el) => (tarjetas.current[i] = el)}
      data-indice={i}
      className={estilos.concepto}
    >
      <span className={estilos.paso}>
        Concepto {i + 1} de {n}
      </span>
      <h2>
        <EnLinea texto={c.titulo} />
      </h2>
      <Markdown>{c.cuerpo}</Markdown>
    </article>
  );

  const hayErrores = errores.length > 0 || erroresTexto;
  const hayEntrevista = entrevista.length > 0 || entrevistaTexto;

  return (
    <div className={estilos.teoria}>
      <section className={estilos.frase}>
        <span className={estilos.etiqueta}>En una frase</span>
        <Markdown>{frase}</Markdown>
        {introduccion && (
          <div className={estilos.introduccion}>
            <Markdown>{introduccion}</Markdown>
          </div>
        )}
      </section>

      <div ref={lectura} className={estilos.lectura} data-modo={modo} data-chuleta={!!chuleta}>
        <nav className={estilos.indice} aria-label="Conceptos del tema">
          <div className={estilos.indiceCabecera}>
            <span className={estilos.etiqueta}>Lo esencial</span>
            <span className={estilos.cuenta}>
              {leidos.size} de {n} leídos
            </span>
          </div>
          <div className={estilos.barra} aria-hidden>
            <i style={{ width: `${(leidos.size / n) * 100}%` }} />
          </div>
          <ol>
            {conceptos.map((c, i) => (
              <li key={i}>
                <button
                  type="button"
                  data-activo={i === actual}
                  data-leido={leidos.has(i)}
                  aria-current={i === actual ? "step" : undefined}
                  onClick={() => ir(i)}
                >
                  <span className={estilos.marca}>{leidos.has(i) && i !== actual ? "✓" : i + 1}</span>
                  <span>
                    <EnLinea texto={c.titulo} />
                  </span>
                </button>
              </li>
            ))}
          </ol>
          <div className={estilos.modo} role="group" aria-label="Cómo leer">
            <button type="button" aria-pressed={modo === "uno"} onClick={() => cambiarModo("uno")}>
              Uno a la vez
            </button>
            <button type="button" aria-pressed={modo === "seguido"} onClick={() => cambiarModo("seguido")}>
              Todo seguido
            </button>
          </div>
          <div className={estilos.saltos}>
            {hayErrores && (
              <button type="button" onClick={() => irA(erroresRef.current)}>
                Errores típicos
              </button>
            )}
            {hayEntrevista && (
              <button type="button" onClick={() => irA(entrevistaRef.current)}>
                En la entrevista
              </button>
            )}
          </div>
        </nav>

        <div className={estilos.centro}>
          {modo === "uno" ? (
            <div key={actual} className={estilos.unoALaVez}>
              {concepto(conceptos[actual], actual)}
              <div className={estilos.navegar}>
                <button type="button" className="boton" disabled={actual === 0} onClick={() => ir(actual - 1)}>
                  <IconoFlechaIzq /> Anterior
                </button>
                {actual < n - 1 ? (
                  <button type="button" className="boton boton-primario" onClick={() => ir(actual + 1)}>
                    <span className={estilos.siguiente}>
                      Siguiente: <EnLinea texto={conceptos[actual + 1].titulo} />
                    </span>
                    <IconoFlechaDer />
                  </button>
                ) : (
                  hayErrores && (
                    <button type="button" className="boton boton-primario" onClick={() => irA(erroresRef.current)}>
                      Ahora: errores típicos <IconoFlechaDer />
                    </button>
                  )
                )}
              </div>
              <p className={estilos.atajo}>También puedes usar las flechas ← → del teclado.</p>
            </div>
          ) : (
            conceptos.map(concepto)
          )}
        </div>

        {chuleta && (
          <aside className={estilos.chuleta} aria-label="Chuleta">
            <span className={estilos.etiqueta}>Chuleta</span>
            <p className={estilos.chuletaNota}>Lo mínimo para recordar, siempre a la vista.</p>
            <Markdown>{chuleta}</Markdown>
          </aside>
        )}
      </div>

      {hayErrores && (
        <section ref={erroresRef} className={estilos.seccion}>
          <div className={estilos.seccionCabecera}>
            <h2>Errores típicos</h2>
            <span>Lo que más falla con este tema y cómo evitarlo</span>
          </div>
          {errores.length ? (
            <div className={estilos.errores}>
              {errores.map((e, i) => (
                <div key={i} className={estilos.error}>
                  <div className={estilos.errorTitulo}>
                    <span className={estilos.numero}>{i + 1}</span>
                    <strong>
                      <EnLinea texto={e.titulo} />
                    </strong>
                  </div>
                  <Markdown>{e.cuerpo}</Markdown>
                </div>
              ))}
            </div>
          ) : (
            <Markdown>{erroresTexto}</Markdown>
          )}
        </section>
      )}

      {hayEntrevista && (
        <section ref={entrevistaRef} className={estilos.seccion}>
          <div className={estilos.seccionCabecera}>
            <h2>En la entrevista</h2>
            {entrevista.length > 0 && (
              <button
                type="button"
                className={estilos.verTodas}
                onClick={() =>
                  setAbiertas(abiertas.size === entrevista.length ? new Set() : new Set(entrevista.map((_, i) => i)))
                }
              >
                {abiertas.size === entrevista.length ? "Ocultar respuestas" : "Ver todas las respuestas"}
              </button>
            )}
          </div>
          {entrevista.length ? (
            <>
              <p className={estilos.seccionNota}>Responde en voz alta como si te lo preguntaran, y luego compara.</p>
              <div className={estilos.preguntas}>
                {entrevista.map((p, i) => (
                  <div key={i} className={estilos.pregunta} data-abierta={abiertas.has(i)}>
                    <strong>
                      <EnLinea texto={p.titulo} />
                    </strong>
                    {abiertas.has(i) ? (
                      <Markdown>{p.cuerpo}</Markdown>
                    ) : (
                      <button type="button" className={estilos.revelar} onClick={() => alternar(i)}>
                        Ver respuesta
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <Markdown>{entrevistaTexto}</Markdown>
          )}
        </section>
      )}
    </div>
  );
}
