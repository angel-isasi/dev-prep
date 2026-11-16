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
import estilos from "./CaminoMovil.module.css";

const AREAS = { javascript: "JavaScript", algoritmos: "Algoritmos", react: "React", typescript: "TypeScript", node: "Node.js y SQL" };

export function CaminoMovil() {
  const [datos, setDatos] = useState(null);
  const [abierta, setAbierta] = useState(null);

  const cargar = () => api.lecciones().then(setDatos);
  useEffect(() => {
    cargar();
  }, []);

  if (!datos) return <Esqueleto variante="lista" />;

  const porArea = Object.keys(AREAS)
    .map((area) => ({ area, unidades: datos.unidades.filter((u) => u.area === area) }))
    .filter((g) => g.unidades.length);

  async function hacerActual(id) {
    await api.elegirUnidad(id);
    await cargar();
  }

  return (
    <section className={estilos.pagina}>
      <CabeceraPagina etiqueta={`${datos.lecciones?.xp ?? 0} XP · ${datos.lecciones?.completadas ?? 0} lecciones`} titulo="Tu camino">
        Avanza unidad por unidad. Toca una para leer su teoría, hacer una lección o un quiz relámpago.
      </CabeceraPagina>

      {porArea.map(({ area, unidades }) => (
        <div key={area} className={estilos.area} data-area={area}>
          <h2 className={estilos.areaTitulo}>
            <span aria-hidden className={estilos.punto} />
            {AREAS[area]}
          </h2>
          <ol className={estilos.nodos}>
            {unidades.map((u, i) => {
              const av = avanceUnidad(datos.items, datos.registros, u.id);
              const actual = u.id === datos.unidadActual;
              return (
                <li key={u.id} className={estilos.fila} data-lado={i % 2 ? "der" : "izq"}>
                  <button
                    type="button"
                    className={estilos.nodo}
                    data-actual={actual}
                    data-dominada={av.dominada}
                    onClick={() => setAbierta(abierta === u.id ? null : u.id)}
                    aria-expanded={abierta === u.id}
                  >
                    <AnilloProgreso valor={av.porcentaje} tamano={78} grosor={6} completo={av.dominada}>
                      <span className={estilos.numero}>{av.dominada ? "✓" : String(u.orden ?? i + 1).padStart(2, "0")}</span>
                    </AnilloProgreso>
                    <span className={estilos.nombre}>{u.titulo}</span>
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
                        <p>
                          {av.dominados} de {av.total} ítems dominados · {av.vistos} vistos
                        </p>
                        <div className={estilos.acciones}>
                          {u.conTeoria && (
                            <Link to={`/aprender/${u.id}`} className="boton">
                              Leer la teoría
                            </Link>
                          )}
                          <Link to={`/leccion?unidad=${encodeURIComponent(u.id)}`} className="boton boton-primario" onClick={() => api.elegirUnidad(u.id)}>
                            Lección
                          </Link>
                          {u.conTeoria && (
                            <Link to={`/leccion?unidad=${encodeURIComponent(u.id)}&modo=quiz`} className="boton">
                              Quiz relámpago
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
