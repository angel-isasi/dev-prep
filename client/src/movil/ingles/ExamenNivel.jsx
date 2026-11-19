// Examen de nivel de inglés: adaptativo de A1 a C2 (la lógica está en examen.js).
// No muestra si acertaste durante el examen (así no aprendes a mitad de camino y el nivel sale limpio);
// al final ves tu nivel, lo que dominas por etapa y lo que fallaste con su explicación.
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import { AnimatePresence, motion } from "motion/react";
import { api } from "../../lib/api.js";
import { celebrar } from "../../lib/celebrar.js";
import { Markdown } from "../../components/Markdown.jsx";
import { Bit } from "../../components/Bit.jsx";
import { Esqueleto } from "../../components/Esqueleto.jsx";
import { ItemOpcion } from "../leccion/Items.jsx";
import { bancoExamen, certeza, crearExamen, EXAMEN, examenTerminado, resultadoExamen, responderExamen, siguientePregunta } from "./examen.js";
import leccion from "../leccion/LeccionMovil.module.css";
import estilos from "./ExamenNivel.module.css";

const NIVELES = ["A1", "A2", "B1", "B2", "C1", "C2"];
const DESCRIPCION = {
  Principiante: "Empiezas desde cero: perfecto, el camino arranca contigo.",
  A1: "Entiendes y armas frases muy simples sobre ti y tu día.",
  A2: "Te defiendes en situaciones cotidianas con frases cortas.",
  B1: "Cuentas experiencias y entiendes lo esencial en el trabajo.",
  B2: "Te manejas con soltura en reuniones y entrevistas técnicas.",
  C1: "Usas el inglés con matices, registro y precisión.",
  C2: "Dominas el idioma con naturalidad casi nativa.",
};

export function ExamenNivel() {
  const navegar = useNavigate();
  const [datos, setDatos] = useState(null);
  const [fase, setFase] = useState("inicio"); // inicio | examen | fin
  const [examen, setExamen] = useState(null);
  const [actual, setActual] = useState(null); // { indice, pregunta }
  const [elegida, setElegida] = useState(null);
  const [resultado, setResultado] = useState(null);
  const inicio = useRef(0);

  useEffect(() => {
    api.lecciones("ingles").then(setDatos);
  }, []);

  const banco = useMemo(() => (datos ? bancoExamen(datos.items, datos.unidades) : null), [datos]);

  if (!datos || !banco) return <Esqueleto variante="lista" />;
  const { unidades } = datos;

  function empezar() {
    const nuevo = crearExamen(unidades.length);
    inicio.current = Date.now();
    setExamen(nuevo);
    setActual(siguientePregunta(nuevo, banco));
    setElegida(null);
    setFase("examen");
  }

  async function responder(res) {
    const sig = responderExamen(examen, actual.indice, actual.pregunta, res);
    setExamen(sig);
    setElegida(null);
    if (examenTerminado(sig, banco)) {
      const r = resultadoExamen(sig, unidades);
      setResultado(r);
      setFase("fin");
      await api.guardarExamenIngles(r, (Date.now() - inicio.current) / 1000);
      if (r.dominadas > 0) celebrar("logro");
    } else {
      setActual(siguientePregunta(sig, banco));
    }
  }

  if (fase === "inicio") {
    return (
      <div className={leccion.final}>
        <Bit animo="pensando" tamano={72} />
        <h1 className={leccion.finalTitulo}>Examen de nivel</h1>
        <div className={estilos.reglas}>
          <p>
            <strong>
              {EXAMEN.minimo} a {EXAMEN.maximo} preguntas
            </strong>
            , de A1 a C2. Se adapta a ti.
          </p>
          <p>
            Si no sabes, toca <strong>No lo sé</strong>.
          </p>
          <p>Lo que ya dominas queda como hecho.</p>
        </div>
        <div className={leccion.acciones}>
          <button type="button" className="boton boton-primario" onClick={empezar}>
            Empezar
          </button>
          <Link to="/ingles" className="boton">
            Ahora no
          </Link>
        </div>
      </div>
    );
  }

  if (fase === "fin" && resultado) return <Resultado resultado={resultado} examen={examen} banco={banco} unidades={unidades} alRepetir={empezar} alSeguir={() => navegar("/ingles")} />;

  const hechas = examen.respuestas.length;
  const avance = Math.min(1, Math.max(hechas / EXAMEN.maximo, hechas >= EXAMEN.minimo ? certeza(examen.prob) : (hechas / EXAMEN.minimo) * 0.85));
  const p = actual.pregunta;

  return (
    <div className={leccion.leccion}>
      <header className={leccion.barra}>
        <button type="button" className={leccion.cerrar} onClick={() => navegar("/ingles")} aria-label="Salir del examen">
          ✕
        </button>
        <div className={leccion.avance}>
          <motion.div animate={{ width: `${Math.max(4, avance * 100)}%` }} transition={{ type: "spring", stiffness: 140, damping: 22 }} />
        </div>
        <span className={estilos.contador}>{hechas + 1}</span>
      </header>

      <AnimatePresence mode="wait">
        <motion.main key={p.clave} className={leccion.contenido} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}>
          <h1 className={leccion.titulo}>
            <span className={estilos.etiqueta}>{p.tipo === "palabra" ? "Vocabulario" : p.tipo === "natural" ? "¿Qué suena natural?" : "Gramática"}</span>
            Elige la respuesta
          </h1>
          <ItemOpcion item={p} elegida={elegida} alElegir={setElegida} bloqueado={false} />
        </motion.main>
      </AnimatePresence>

      <footer className={`${leccion.pie} ${estilos.pie}`}>
        <button type="button" className={`boton ${estilos.nose}`} onClick={() => responder("nose")}>
          No lo sé
        </button>
        <button
          type="button"
          className={`boton boton-primario ${leccion.grande}`}
          disabled={elegida === null}
          onClick={() => responder(elegida === p.correcta ? "bien" : "mal")}
        >
          Siguiente
        </button>
      </footer>
    </div>
  );
}

function Resultado({ resultado, examen, banco, unidades, alRepetir, alSeguir }) {
  const { nivel, dominadas, todas, porNivel, aciertos, total } = resultado;
  const empieza = unidades.find((u) => u.id === resultado.hasta);
  const preguntas = new Map(banco.flat().map((p) => [p.clave, p]));
  const fallos = examen.respuestas.filter((r) => r.resultado !== "bien").map((r) => preguntas.get(r.clave)).filter(Boolean);
  return (
    <div className={`${leccion.final} ${estilos.fin}`}>
      <Bit animo="feliz" tamano={64} />
      <span className={estilos.etiqueta}>Tu nivel</span>
      <div className={estilos.nivel}>{nivel}</div>
      <p className={estilos.descripcion}>{DESCRIPCION[nivel]}</p>

      <div className={estilos.escala} aria-label="Escala de niveles">
        {NIVELES.map((n) => (
          <span key={n} data-activo={n === nivel} data-pasado={NIVELES.indexOf(n) < NIVELES.indexOf(nivel)}>
            {n}
          </span>
        ))}
      </div>

      <p className={estilos.resumen}>
        {dominadas > 0 ? (
          <>
            Dominas <strong>{todas ? "todas" : dominadas}</strong> de {unidades.length} unidades: ya están marcadas como hechas.
            {!todas && empieza && (
              <>
                {" "}
                Empiezas en <strong>{empieza.titulo}</strong> ({empieza.nivel}).
              </>
            )}
          </>
        ) : (
          <>Empiezas en la primera unidad, desde la base.</>
        )}
        <br />
        <small>
          {aciertos} de {total} respuestas bien
        </small>
      </p>

      <div className={estilos.porNivel}>
        {NIVELES.filter((n) => porNivel[n]).map((n) => (
          <div key={n}>
            <span>{n}</span>
            <div className={estilos.barra}>
              <i style={{ width: `${(porNivel[n].bien / porNivel[n].total) * 100}%` }} />
            </div>
            <small>
              {porNivel[n].bien}/{porNivel[n].total}
            </small>
          </div>
        ))}
      </div>

      <div className={leccion.acciones}>
        <button type="button" className="boton boton-primario" onClick={alSeguir}>
          Ir a mi camino
        </button>
        <button type="button" className="boton" onClick={alRepetir}>
          Repetir el examen
        </button>
      </div>

      {fallos.length > 0 && (
        <details className={estilos.fallos}>
          <summary>Lo que fallaste o no sabías ({fallos.length})</summary>
          {fallos.map((p) => (
            <div key={p.clave} className={estilos.fallo}>
              <Markdown>{p.pregunta}</Markdown>
              <p>
                Respuesta: <strong>{p.opciones[p.correcta]}</strong>
              </p>
              {p.explicacion && <Markdown>{p.explicacion}</Markdown>}
            </div>
          ))}
        </details>
      )}
    </div>
  );
}
