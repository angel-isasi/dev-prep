// El camino de unidades (como el de Duolingo): una unidad por tema de Aprender, agrupadas por área.
// Cada nodo muestra cuánto dominas; al tocarlo eliges qué hacer. Nada se bloquea: solo se sugiere el orden.
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { AnimatePresence, motion } from "motion/react";
import { api } from "../../lib/api.js";
import { AnilloProgreso } from "../../components/AnilloProgreso.jsx";
import { CabeceraPagina } from "../../components/CabeceraPagina.jsx";
import { Esqueleto } from "../../components/Esqueleto.jsx";
import { avanceUnidad } from "./motor.js";
import { avanceConceptos } from "./variantes.js";
import { celebrar } from "../../lib/celebrar.js";
import estilos from "./CaminoMovil.module.css";

const AREAS = { javascript: "JavaScript", algoritmos: "Algoritmos", react: "React", typescript: "TypeScript", node: "Node.js y SQL" };
const ETAPAS = { basico: "Base (A1 a A2)", intermedio: "Intermedio (B1)", trabajo: "Inglés de trabajo (B1 a B2)" };

/**
 * @param {{ ambito?: "programacion"|"ingles", sinCabecera?: boolean }} props
 * En inglés las unidades se agrupan por etapa y la teoría está en /ingles/unidad/:id.
 */
export function CaminoMovil({ ambito = "programacion", sinCabecera = false }) {
  const [datos, setDatos] = useState(null);
  const [abierta, setAbierta] = useState(null);
  const [cofre, setCofre] = useState(null); // premio del cofre recién abierto
  const ingles = ambito === "ingles";

  const cargar = () => api.lecciones(ambito).then(setDatos);
  useEffect(() => {
    cargar();
  }, [ambito]);

  if (!datos) return <Esqueleto variante="lista" />;

  const grupos = ingles
    ? Object.entries(ETAPAS).map(([etapa, titulo]) => ({ clave: etapa, area: "ingles", titulo, unidades: datos.unidades.filter((u) => u.etapa === etapa) }))
    : Object.entries(AREAS).map(([area, titulo]) => ({ clave: area, area, titulo, unidades: datos.unidades.filter((u) => u.area === area) }));
  const conUnidades = grupos.filter((g) => g.unidades.length);
  const leccion = (id, extra = "") => `/leccion?unidad=${encodeURIComponent(id)}${ingles ? "&ambito=ingles" : ""}${extra}`;
  const elegir = (id) => (ingles ? api.elegirUnidadIngles(id) : api.elegirUnidad(id));

  async function abrirCofre(id) {
    const premio = await api.abrirCofreUnidad(id);
    celebrar("logro");
    setCofre({ ...premio, unidad: id });
    await cargar();
  }

  async function hacerActual(id) {
    await elegir(id);
    await cargar();
  }

  return (
    <section className={sinCabecera ? estilos.incrustado : estilos.pagina}>
      {!sinCabecera && (
        <CabeceraPagina etiqueta={`${datos.lecciones?.xp ?? 0} XP · ${datos.lecciones?.completadas ?? 0} lecciones`} titulo="Tu camino">
          Avanza unidad por unidad. Toca una para leer su teoría, hacer una lección o un quiz relámpago.
        </CabeceraPagina>
      )}

      {conUnidades.map(({ clave, area, titulo, unidades }) => (
        <div key={clave} className={estilos.area} data-area={area}>
          <h2 className={estilos.areaTitulo}>
            <span aria-hidden className={estilos.punto} />
            {titulo}
          </h2>
          <ol className={estilos.nodos}>
            {unidades.map((u, i) => {
              const av = ingles ? avanceConceptos(datos.items, datos.registros, u.id) : avanceUnidad(datos.items, datos.registros, u.id);
              const legendaria = ingles && !!datos.extra?.legendarias?.[u.id];
              const cofreAbierto = ingles && !!datos.extra?.cofres?.[u.id];
              const actual = u.id === datos.unidadActual;
              return (
                <li key={u.id} className={estilos.fila} data-lado={i % 2 ? "der" : "izq"}>
                  <button
                    type="button"
                    className={estilos.nodo}
                    data-actual={actual}
                    data-dominada={av.dominada}
                    data-legendaria={legendaria}
                    onClick={() => setAbierta(abierta === u.id ? null : u.id)}
                    aria-expanded={abierta === u.id}
                  >
                    <AnilloProgreso valor={av.porcentaje} tamano={78} grosor={6} completo={ingles ? av.completa : av.dominada}>
                      <span className={estilos.numero}>{legendaria ? "★" : av.dominada ? "✓" : String(u.orden ?? i + 1).padStart(2, "0")}</span>
                    </AnilloProgreso>
                    <span className={estilos.nombre}>{u.titulo}</span>
                    {ingles && (
                      <span className={estilos.niveles} aria-label={`Nivel ${av.nivel} de 5`}>
                        {[0, 1, 2, 3, 4].map((n) => (
                          <i key={n} data-lleno={n < av.nivel} />
                        ))}
                      </span>
                    )}
                    {actual && <span className={estilos.actual}>Aquí vas</span>}
                  </button>

                  <AnimatePresence>
                    {abierta === u.id && (
                      <motion.div
                        className={estilos.panel}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        {ingles ? (
                          <div className={estilos.barras}>
                            <div>
                              <span>
                                Aprendidos <strong>{av.aprendidos}</strong> de {av.total}
                              </span>
                              <div className={estilos.barra}>
                                <i style={{ width: `${av.porcentaje * 100}%` }} />
                              </div>
                            </div>
                            <div>
                              <span>
                                Fijados <strong>{av.fijados}</strong> <small>(los recordaste días después)</small>
                              </span>
                              <div className={estilos.barra} data-tipo="fijados">
                                <i style={{ width: `${av.porcentajeFijados * 100}%` }} />
                              </div>
                            </div>
                            <small className={estilos.nota}>
                              Nivel {av.nivel} de 5{av.leccionesFaltan > 0 ? ` · unas ${av.leccionesFaltan} lecciones para verla completa` : " · ya la viste completa"}
                              {legendaria ? " · legendaria ★" : ""}
                            </small>
                          </div>
                        ) : (
                          <p>
                            {av.dominados} de {av.total} ítems dominados · {av.vistos} vistos
                          </p>
                        )}
                        {cofre?.unidad === u.id && (
                          <div className={estilos.premio}>
                            <strong>🎁 +{cofre.xp} XP{cofre.yaAbierto ? " (ya lo habías abierto)" : ""}</strong>
                            {cofre.frase && (
                              <p>
                                Frase para el trabajo: <em lang="en">{cofre.frase.en}</em>
                                <br />
                                <small>{cofre.frase.es}</small>
                              </p>
                            )}
                          </div>
                        )}
                        <div className={estilos.acciones}>
                          {u.conTeoria && (
                            <Link to={ingles ? `/ingles/unidad/${u.id}` : `/aprender/${u.id}`} className="boton">
                              {ingles ? "Teoría y palabras" : "Leer la teoría"}
                            </Link>
                          )}
                          <Link to={leccion(u.id)} className="boton boton-primario" onClick={() => elegir(u.id)}>
                            Lección
                          </Link>
                          {u.conTeoria && !ingles && (
                            <Link to={leccion(u.id, "&modo=quiz")} className="boton">
                              Quiz relámpago
                            </Link>
                          )}
                          {ingles && av.completa && !cofreAbierto && (
                            <button type="button" className="boton boton-primario" onClick={() => abrirCofre(u.id)}>
                              🎁 Abrir cofre
                            </button>
                          )}
                          {ingles && av.completa && (
                            <Link to={leccion(u.id, "&modo=legendario")} className="boton">
                              {legendaria ? "★ Repetir legendario" : "★ Nivel legendario"}
                            </Link>
                          )}
                          {!actual && (
                            <button type="button" className="boton boton-fantasma" onClick={() => hacerActual(u.id)}>
                              Marcar como actual
                            </button>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </li>
              );
            })}
          </ol>
        </div>
      ))}
    </section>
  );
}
