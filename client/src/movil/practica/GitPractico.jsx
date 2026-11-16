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
import estilos from "./GitPractico.module.css";

const NIVEL = { 1: "básico", 2: "intermedio", 3: "difícil" };

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
    <CabeceraPagina
      etiqueta={escenarios ? `${Object.keys(resueltos).length} de ${escenarios.length} resueltos` : "Git"}
      titulo="Git práctico"
    >
      Situaciones que te van a pasar en tu primer trabajo, con un repositorio de verdad. Lo resuelves en la terminal y la app revisa si
      quedó bien.
    </CabeceraPagina>
  );

  if (!api.escenariosGit) {
    return (
      <section className={estilos.pagina}>
        {cabecera}
        <p className={estilos.ayuda}>
          Esto crea repositorios en tu laptop y los abre en VS Code, así que funciona con dev-prep abierto en tu laptop. Ábrela ahí (la web
          se conecta sola) o ve a <Link to="/ajustes">Ajustes</Link> → "Conectar con dev-prep de esta laptop".
        </p>
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

  return (
    <section className={estilos.pagina}>
      {cabecera}
      <ol className={estilos.lista}>
        {escenarios.map((e, i) => (
          <li key={e.id}>
            <button type="button" className={estilos.ficha} data-resuelto={!!resueltos[e.id]} onClick={() => setAbierto(e.id)}>
              <span className={estilos.numero}>{resueltos[e.id] ? "✓" : String(i + 1).padStart(2, "0")}</span>
              <span className={estilos.fichaTexto}>
                <strong>{e.titulo}</strong>
                <small>
                  {NIVEL[e.nivel]} · {e.comandos.slice(0, 3).join(" · ")}
                </small>
              </span>
            </button>
          </li>
        ))}
      </ol>
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
