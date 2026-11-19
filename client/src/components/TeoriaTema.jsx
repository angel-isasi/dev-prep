// Teoría de un tema de Aprender, organizada para leer sin bajar tanto:
// - Arriba, "En una frase" a todo el ancho.
// - Al medio, tres columnas: el índice de conceptos (vas en el orden que quieras y marca los que leíste),
//   un concepto a la vez (o todos seguidos, si lo prefieres) y la chuleta (plegada en el celular).
// - Abajo, plegados, los errores típicos en tarjetas y las preguntas de entrevista: se abren al tocarlos
//   o desde los botones del índice.
// Si un tema no tiene las secciones de siempre, se muestra el texto completo como antes.
import { useEffect, useMemo, useRef, useState } from "react";
import { Markdown } from "./Markdown.jsx";
import { EnLinea } from "./EnLinea.jsx";
import { PreguntasEntrevista } from "./PreguntasEntrevista.jsx";
import { IconoFlechaDer, IconoFlechaIzq } from "./Iconos.jsx";
import { partesTeoria } from "../lib/teoria.js";
import { irA } from "../hooks/useScrollSuave.js";
import { almacen } from "../lib/visita.js";
import estilos from "./TeoriaTema.module.css";

const CLAVE_MODO = "devprep.teoriaModo";
const CLAVE_LEIDOS = "devprep.teoriaLeidos";

function leer(clave, defecto) {
  try {
    return JSON.parse(almacen.getItem(clave)) ?? defecto;
  } catch {
    return defecto;
  }
}

function guardar(clave, valor) {
  try {
    almacen.setItem(clave, JSON.stringify(valor));
  } catch {
    // sin espacio o en modo privado: no pasa nada, solo no se recuerda
  }
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
  const lectura = useRef(null);
  const tarjetas = useRef([]);
  const erroresRef = useRef(null);
  const entrevistaRef = useRef(null);
  const n = conceptos.length;
  // La chuleta es un <details>: abierta en pantallas anchas, plegada en el celular. Solo es el valor
  // inicial; después manda el usuario al tocar el título.
  const [chuletaAbierta] = useState(() => !window.matchMedia?.("(max-width: 600px)").matches);

  // Errores y entrevista están plegados: para saltar a ellos primero se abren y luego se baja
  function saltarA(ref) {
    if (!ref.current) return;
    ref.current.open = true;
    irA(ref.current);
  }

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
              <button type="button" onClick={() => saltarA(erroresRef)}>
                Errores típicos
              </button>
            )}
            {hayEntrevista && (
              <button type="button" onClick={() => saltarA(entrevistaRef)}>
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
                    <button type="button" className="boton boton-primario" onClick={() => saltarA(erroresRef)}>
                      Ahora: errores típicos <IconoFlechaDer />
                    </button>
                  )
                )}
              </div>
            </div>
          ) : (
            conceptos.map(concepto)
          )}
        </div>

        {chuleta && (
          <details className={estilos.chuleta} open={chuletaAbierta}>
            <summary className={estilos.etiqueta}>Chuleta</summary>
            <Markdown>{chuleta}</Markdown>
          </details>
        )}
      </div>

      {hayErrores && (
        <details ref={erroresRef} className={estilos.plegable}>
          <summary title="Lo que más falla con este tema y cómo evitarlo">
            <h2>Errores típicos</h2>
            {errores.length > 0 && <span>· {errores.length}</span>}
          </summary>
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
        </details>
      )}

      {hayEntrevista && (
        <details ref={entrevistaRef} className={estilos.plegable}>
          <summary>
            <h2>En la entrevista</h2>
            {entrevista.length > 0 && <span>· {entrevista.length}</span>}
          </summary>
          {entrevista.length ? <PreguntasEntrevista preguntas={entrevista} /> : <Markdown>{entrevistaTexto}</Markdown>}
        </details>
      )}
    </div>
  );
}
