// Git práctico: situaciones reales (primer commit, ramas, conflictos, pull, push, revert, stash)
// con un repositorio de verdad que el motor crea en Documentos/dev-prep-git y abre en VS Code.
// Lo resuelves en la terminal y la app revisa el repositorio. Necesita la laptop.
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { motion } from "motion/react";
import { api } from "../../lib/api.js";
import { celebrar } from "../../lib/celebrar.js";
import { Markdown } from "../../components/Markdown.jsx";
import { CabeceraPagina } from "../../components/CabeceraPagina.jsx";
import { Esqueleto } from "../../components/Esqueleto.jsx";
import { AnilloProgreso } from "../../components/AnilloProgreso.jsx";
import { IconoFlechaDer, IconoGit } from "../../components/Iconos.jsx";
import estilos from "./GitPractico.module.css";

const NIVEL = { 1: "básico", 2: "intermedio", 3: "difícil" };

/** Los tres niveles, en el orden en que se muestran, y lo que se practica en cada uno. */
const NIVELES = [
  { nivel: 1, titulo: "Básico", temas: ["Primer commit", "Ramas", "Deshacer cambios", ".gitignore"] },
  { nivel: 2, titulo: "Intermedio", temas: ["Corregir un commit", "Conflictos", "Pull", "Push"] },
  { nivel: 3, titulo: "Difícil", temas: ["Revert", "Stash"] },
];

/** Cómo se trabaja cada escenario (se muestra cuando todavía no hay laptop conectada). */
const PASOS = [
  { titulo: "Preparas", detalle: "Se crea el repositorio y se abre en VS Code" },
  { titulo: "Resuelves", detalle: "En la terminal, con Git de verdad" },
  { titulo: "Verificas", detalle: "La app revisa cómo quedó" },
];

const porciento = (parte, total) => (total ? Math.round((parte / total) * 100) : 0);

export function GitPractico() {
  const [escenarios, setEscenarios] = useState(null);
  const [resueltos, setResueltos] = useState({});
  const [abierto, setAbierto] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.escenariosGit?.().then(setEscenarios, (e) => setError(e.message));
    api.gitResueltos?.().then(setResueltos);
  }, []);

  const cabecera = (
    <CabeceraPagina etiqueta="Repositorios de verdad" titulo="Git práctico">
      Situaciones que te van a pasar en tu primer trabajo, con un repositorio de verdad. Lo resuelves en la terminal y la app revisa si
      quedó bien.
    </CabeceraPagina>
  );

  // Sin la laptop no hay escenarios que abrir: se explica cómo funciona y qué se practica
  if (!api.escenariosGit) {
    return (
      <section className={estilos.pagina}>
        {cabecera}
        <div className={estilos.tablero}>
          <section className={`tarjeta ${estilos.aviso}`}>
            <span className={estilos.iconoGrande} aria-hidden>
              <IconoGit />
            </span>
            <div>
              <h2>Funciona en tu laptop</h2>
              <p>Abre dev-prep en tu laptop y la web se conecta sola.</p>
            </div>
            <Link to="/ajustes" className="boton boton-primario" title='En Ajustes: "Conectar con dev-prep de esta laptop"'>
              Conectar en Ajustes
            </Link>
          </section>

          <section className={`tarjeta ${estilos.como}`}>
            <span className="etiqueta">Cómo funciona</span>
            <ol className={estilos.pasos}>
              {PASOS.map((p, i) => (
                <li key={p.titulo}>
                  <span className={estilos.numero}>{i + 1}</span>
                  <strong>{p.titulo}</strong>
                  <small>{p.detalle}</small>
                </li>
              ))}
            </ol>
          </section>

          {NIVELES.map((n) => (
            <section key={n.nivel} className={`tarjeta ${estilos.temario}`}>
              <header className={estilos.grupoCabeza}>
                <h2>{n.titulo}</h2>
                <span className="chip">{n.temas.length} temas</span>
              </header>
              <ul className={estilos.temas}>
                {n.temas.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </section>
    );
  }
  if (error) return <p className={estilos.ayuda}>{error}</p>;
  if (!escenarios) return <Esqueleto variante="tarjetas" />;

  const actual = escenarios.find((e) => e.id === abierto);
  if (actual) {
    return (
      <section className={estilos.pagina}>
        <Escenario
          key={actual.id}
          escenario={actual}
          resuelto={!!resueltos[actual.id]}
          alVolver={() => setAbierto(null)}
          alResolver={async () => {
            await api.marcarGit?.(actual.id);
            setResueltos((await api.gitResueltos?.()) ?? {});
          }}
        />
      </section>
    );
  }

  // El número de cada escenario es su lugar en la lista completa, no dentro de su nivel
  const numerados = escenarios.map((e, i) => ({ ...e, numero: String(i + 1).padStart(2, "0"), resuelto: !!resueltos[e.id] }));
  const hechos = numerados.filter((e) => e.resuelto).length;
  const siguiente = numerados.find((e) => !e.resuelto);
  const grupos = NIVELES.map((n) => {
    const lista = numerados.filter((e) => e.nivel === n.nivel);
    return { ...n, lista, hechos: lista.filter((e) => e.resuelto).length };
  }).filter((g) => g.lista.length);

  return (
    <section className={estilos.pagina}>
      {cabecera}

      {/* Resumen: cuánto llevas en total, por nivel, y el que te toca */}
      <section className={`tarjeta ${estilos.resumen}`}>
        <div className={estilos.total}>
          <AnilloProgreso valor={numerados.length ? hechos / numerados.length : 0} tamano={84} grosor={8} completo={hechos > 0 && hechos === numerados.length}>
            <strong>{porciento(hechos, numerados.length)}%</strong>
          </AnilloProgreso>
          <span>
            <strong>
              {hechos} de {numerados.length}
            </strong>
            <small>resueltos</small>
          </span>
        </div>
        <ol className={estilos.niveles}>
          {grupos.map((g) => (
            <li key={g.nivel}>
              <span>
                <strong>{g.titulo}</strong>
                <small>
                  {g.hechos}/{g.lista.length}
                </small>
              </span>
              <span className={estilos.barra} aria-hidden>
                <span style={{ width: `${porciento(g.hechos, g.lista.length)}%` }} />
              </span>
            </li>
          ))}
        </ol>
        {siguiente ? (
          <button type="button" className={estilos.siguiente} onClick={() => setAbierto(siguiente.id)}>
            <span className={estilos.numero}>{siguiente.numero}</span>
            <span>
              <small>Te toca</small>
              <strong>{siguiente.titulo}</strong>
            </span>
            <IconoFlechaDer />
          </button>
        ) : (
          <span className="chip" data-tono="exito">
            Todo resuelto
          </span>
        )}
      </section>

      {/* Un bloque por nivel; las fichas de cada nivel llenan su fila */}
      {grupos.map((g) => (
        <section key={g.nivel} className={estilos.grupo}>
          <header className={estilos.grupoCabeza}>
            <h2>{g.titulo}</h2>
            <span className="chip" data-tono={g.hechos === g.lista.length ? "exito" : undefined}>
              {g.hechos} de {g.lista.length}
            </span>
          </header>
          <ol className={estilos.lista}>
            {g.lista.map((e) => (
              <li key={e.id}>
                <button type="button" className={`brillo ${estilos.ficha}`} data-resuelto={e.resuelto} onClick={() => setAbierto(e.id)}>
                  <span className={estilos.numero}>{e.resuelto ? "✓" : e.numero}</span>
                  <span className={estilos.fichaTexto}>
                    <strong>{e.titulo}</strong>
                    <small>
                      {e.comandos.length} comandos · {e.resuelto ? "resuelto" : "pendiente"}
                    </small>
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </section>
      ))}
    </section>
  );
}

function Escenario({ escenario: e, resuelto, alVolver, alResolver }) {
  const [estado, setEstado] = useState(null); // resultado de verificar
  const [ocupado, setOcupado] = useState(false);
  const [aviso, setAviso] = useState(null);
  const [pistas, setPistas] = useState(0);
  const [verExplicacion, setVerExplicacion] = useState(resuelto);

  async function hacer(accion) {
    setOcupado(true);
    setAviso(null);
    try {
      return await accion();
    } catch (err) {
      setAviso(err.message);
    } finally {
      setOcupado(false);
    }
  }

  async function verificar() {
    const r = await hacer(() => api.verificarGit(e.id));
    if (!r) return;
    setEstado(r);
    if (!r.existe) setAviso('Todavía no preparaste el repositorio de este escenario. Toca "Preparar repositorio".');
    if (r.listo) {
      setVerExplicacion(true);
      if (!resuelto) {
        celebrar();
        await alResolver();
      }
    }
  }

  return (
    <>
      <button type="button" className={`boton boton-fantasma ${estilos.volver}`} onClick={alVolver}>
        ← Todos los escenarios
      </button>
      <span className={estilos.etiqueta}>
        Git práctico · {NIVEL[e.nivel]}
        {resuelto && " · resuelto"}
      </span>
      <h1 className={estilos.titulo}>{e.titulo}</h1>

      <div className={estilos.columnas}>
        <div className={estilos.panel}>
          <h2>La situación</h2>
          <Markdown>{e.situacion}</Markdown>
          <h2>Tu tarea</h2>
          <Markdown>{e.tarea}</Markdown>
          <div className={estilos.comandos}>
            {e.comandos.map((c) => (
              <code key={c}>{c}</code>
            ))}
          </div>
          <div className={estilos.acciones}>
            <button
              type="button"
              className="boton boton-primario"
              disabled={ocupado}
              onClick={() =>
                hacer(async () => {
                  await api.prepararGit(e.id);
                  setEstado(null);
                  setAviso("Listo: se abrió en VS Code. Abre la terminal (Ctrl + ñ) y resuélvelo ahí. La tarea está en TAREA.md.");
                })
              }
            >
              {estado?.existe ? "Reiniciar el repositorio" : "Preparar repositorio y abrir VS Code"}
            </button>
            <button type="button" className="boton" disabled={ocupado} onClick={verificar}>
              Verificar
            </button>
            <button type="button" className="boton boton-fantasma" disabled={ocupado} onClick={() => hacer(() => api.abrirGit(e.id))}>
              Abrir en VS Code
            </button>
          </div>
          {aviso && <p className={estilos.ayuda}>{aviso}</p>}
        </div>

        <div className={estilos.panel}>
          <h2>Lo que se revisa</h2>
          <ul className={estilos.condiciones}>
            {e.condiciones.map((texto, i) => {
              const ok = estado?.condiciones?.[i]?.ok;
              return (
                <li key={texto} data-ok={estado?.existe ? String(!!ok) : undefined}>
                  <span aria-hidden>{!estado?.existe ? "○" : ok ? "✓" : "✗"}</span>
                  {texto}
                </li>
              );
            })}
          </ul>
          {estado?.listo && <p className={estilos.exito}>¡Resuelto! Así se hace en el trabajo.</p>}

          <h2>Pistas</h2>
          {e.pistas.slice(0, pistas).map((p, i) => (
            <motion.div key={i} className={estilos.pista} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
              <Markdown>{p}</Markdown>
            </motion.div>
          ))}
          {pistas < e.pistas.length && (
            <button type="button" className="boton boton-fantasma" onClick={() => setPistas((n) => n + 1)}>
              {["Ver una pista pequeña", "Ver otra pista", "Ver la pista casi de la respuesta"][pistas]}
            </button>
          )}
        </div>
      </div>

      <div className={estilos.panel}>
        {verExplicacion ? (
          <>
            <h2>Por qué funciona</h2>
            <Markdown>{e.explicacion}</Markdown>
          </>
        ) : (
          <button type="button" className="boton boton-fantasma" onClick={() => setVerExplicacion(true)}>
            Ver la explicación (mejor después de intentarlo)
          </button>
        )}
      </div>
    </>
  );
}
