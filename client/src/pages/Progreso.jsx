import { useEffect, useState } from "react";
import { api } from "../lib/api.js";
import { nombreTema } from "../lib/etiquetas.js";
import { Esqueleto } from "../components/Esqueleto.jsx";
import { CabeceraPagina } from "../components/CabeceraPagina.jsx";
import { AnilloProgreso } from "../components/AnilloProgreso.jsx";
import { NumeroAnimado } from "../components/NumeroAnimado.jsx";
import { Llama } from "../components/Llama.jsx";
import { AnimatedGroup } from "../components/ui/animated-group.jsx";
import { MagicCard } from "../components/ui/magic-card.jsx";
import { SlidingNumber } from "../components/ui/sliding-number.jsx";
import { EntrenamientoHoy, MapaDominio, useMapaDominio } from "../components/MapaDominio.jsx";
import { EstudioJuego } from "../components/EstudioJuego.jsx";
import { SemaforoPostular, TarjetaNivel } from "../components/Logros.jsx";
import { RetoMes, ResumenMes } from "../components/Rutina.jsx";
import { CuantoAvance, DiaEnNumeros, PlanSemana } from "../components/Avance.jsx";
import { Ruta, useRuta } from "../components/Ruta.jsx";
import { ContenidoPestanas, Pestanas } from "../components/Pestanas.jsx";
import { usePestanaUrl } from "../hooks/usePestanaUrl.js";
import { PlanHoy, usePlan } from "../components/plan/Plan.jsx";
import { TutorHoy } from "../components/ia/TutorHoy.jsx";
import estilos from "./Progreso.module.css";

const DIAS = ["L", "", "M", "", "V", "", "D"];

// La página se parte en tres pestañas para no mostrar todo de golpe. La activa vive en la
// dirección (?pestana=ruta), así se puede enlazar directo desde Hoy.
const PESTANAS = [
  { id: "resumen", texto: "Resumen" },
  { id: "ruta", texto: "Ruta" },
  { id: "plan", texto: "Plan" },
];
const ORDEN = PESTANAS.map((p) => p.id);

function textoCelda(c) {
  const [a, m, d] = c.fecha.split("-").map(Number);
  const fecha = new Date(a, m - 1, d).toLocaleDateString("es-PE", {
    day: "numeric",
    month: "short",
  });
  if (!c.hecho && !c.minutos) return `${fecha}: sin actividad`;
  return `${fecha}: ${c.hecho} puntos, ${c.minutos} min`;
}

/** Agrupa las celdas en columnas de 7 días (una columna por semana). */
function porSemanas(celdas) {
  const semanas = [];
  for (let i = 0; i < celdas.length; i += 7)
    semanas.push(celdas.slice(i, i + 7));
  return semanas;
}

export function Progreso() {
  const [datos, setDatos] = useState(api.progreso.guardado);
  const [error, setError] = useState(null);
  const { mapa, errores } = useMapaDominio();
  const ruta = useRuta();
  const [pestana, setPestana] = usePestanaUrl(ORDEN);
  const [plan, recargarPlan] = usePlan();

  useEffect(() => {
    api.progreso().then(setDatos, (e) => setError(e.message));
  }, []);

  if (error)
    return <p className={estilos.mensaje}>No se pudo cargar: {error}</p>;
  if (!datos) return <Esqueleto variante="tarjetas" />;

  const { preparacion, racha, semana, totales, calendario } = datos;
  // Un solo "cuánto dominas": el promedio del mapa (ejercicios, lecciones y quiz). Sin mapa
  // (app local), queda la preparación de siempre, que solo mira los ejercicios.
  const dominio = ruta ? ruta.dominio : preparacion.total;
  const activos = calendario.filter((c) => c.nivel > 0).length;

  return (
    <section className={estilos.pagina}>
      <CabeceraPagina
        etiqueta={`${totales.resueltos} de ${totales.total} ejercicios dominados`}
        titulo="Progreso"
      >
        Lo que dominas de verdad, no solo lo que viste.
      </CabeceraPagina>

      <Pestanas pestanas={PESTANAS} activa={pestana} alCambiar={setPestana} />

      <ContenidoPestanas activa={pestana} orden={ORDEN} className={estilos.contenido}>
        {/* Resumen: solo cifras, el calendario y la semana */}
        {pestana === "resumen" && (
          <>
            <div className={estilos.resumen}>
              {/* Preparación: anillo grande */}
              <div className={estilos.preparacion}>
                <AnilloProgreso
                  valor={dominio / 100}
                  tamano={168}
                  grosor={12}
                >
                  <strong className={estilos.porcentaje}>
                    <NumeroAnimado
                      valor={dominio}
                      decimales={dominio % 1 ? 1 : 0}
                    />
                    <small>%</small>
                  </strong>
                </AnilloProgreso>
                <div className={estilos.preparacionTexto}>
                  <span className={estilos.etiqueta}>Cuánto dominas</span>
                  {/* La explicación queda plegada: el anillo ya dice lo importante */}
                  <details className={estilos.como}>
                    <summary>Cómo se calcula</summary>
                    <p>
                      Es el promedio de tu mapa: en cada unidad cuentan los ejercicios resueltos sin ver la solución (la mitad), las preguntas de lección fijadas y
                      el quiz. Un repaso vencido le resta.
                    </p>
                  </details>
                </div>
              </div>

              <AnimatedGroup
                preset="slide"
                stagger={0.06}
                className={estilos.datos}
                itemClassName={estilos.celdaDato}
              >
                <MagicCard
                  className={estilos.dato}
                  gradientFrom="var(--aviso)"
                  gradientTo="var(--error)"
                  gradientColor="var(--aviso-suave)"
                >
                  <div className={estilos.datoInterior}>
                    <span className={estilos.etiqueta}>
                      <Llama encendida={racha > 0} tamano={16} /> Racha
                    </span>
                    <strong className={estilos.numero} data-tipo="aviso">
                      <SlidingNumber number={racha} />
                    </strong>
                    <span className={estilos.detalle}>
                      {racha === 1 ? "día seguido" : "días seguidos"}
                    </span>
                  </div>
                </MagicCard>
                <MagicCard className={estilos.dato}>
                  <div className={estilos.datoInterior}>
                    <span className={estilos.etiqueta}>Resueltos</span>
                    <strong className={estilos.numero}>
                      <SlidingNumber number={totales.resueltos} />
                      <small>/{totales.total}</small>
                    </strong>
                    <span className={estilos.detalle}>sin ver la solución</span>
                  </div>
                </MagicCard>
                <MagicCard className={estilos.dato}>
                  <div className={estilos.datoInterior}>
                    <span className={estilos.etiqueta}>Esta semana</span>
                    <strong className={estilos.numero}>
                      <SlidingNumber number={semana.puntos ?? 0} />
                    </strong>
                    <span className={estilos.detalle}>
                      puntos · {semana.minutos} min
                    </span>
                  </div>
                </MagicCard>
                <MagicCard className={estilos.dato}>
                  <div className={estilos.datoInterior}>
                    <span className={estilos.etiqueta}>Unidades listas</span>
                    <strong className={estilos.numero}>
                      <SlidingNumber number={ruta ? ruta.listas : totales.resueltos} />
                      <small>/{ruta ? ruta.total : totales.total}</small>
                    </strong>
                    <span className={estilos.detalle}>
                      {ruta ? `${ruta.dominadas} en verde` : "ejercicios resueltos"}
                    </span>
                  </div>
                </MagicCard>
              </AnimatedGroup>
            </div>

            <div className={estilos.cuerpo}>
              {api.diaEnNumeros && (
                <div className={estilos.hueco}>
                  <DiaEnNumeros />
                </div>
              )}
              <div className={estilos.fila}>
                <div className={estilos.hueco}>
                  <div className={estilos.bloque}>
                    <div className={estilos.bloqueCabecera}>
                      <h2>Actividad</h2>
                      <span>{activos} días activos en las últimas 20 semanas</span>
                    </div>
                    <div className={estilos.calendario}>
                      <div className={estilos.diasSemana}>
                        {DIAS.map((d, i) => (
                          <span key={i}>{d}</span>
                        ))}
                      </div>
                      {porSemanas(calendario).map((sem, i) => (
                        <div key={i} className={estilos.columna}>
                          {sem.map((c) => (
                            <span
                              key={c.fecha}
                              className={estilos.celda}
                              data-nivel={c.nivel}
                              title={textoCelda(c)}
                            />
                          ))}
                        </div>
                      ))}
                    </div>
                    <div className={estilos.leyenda}>
                      Menos
                      {[0, 1, 2, 3, 4].map((n) => (
                        <span key={n} className={estilos.celda} data-nivel={n} />
                      ))}
                      Más
                    </div>
                  </div>
                </div>
                <div className={estilos.hueco}>
                  <EstudioJuego dias={datos.estudioJuego} proyeccion={datos.proyeccion} fechaMeta={datos.config?.fechaMeta} />
                </div>
              </div>
            </div>
          </>
        )}

        {/* Ruta: las semanas hasta tu fecha meta y cómo va cada unidad */}
        {pestana === "ruta" && (
          <div className={estilos.cuerpo}>
            <Ruta ruta={ruta} />
            {/* En la versión web, el mapa de dominio reemplaza las barras por tema */}
            {api.mapa ? (
              <div className={estilos.hueco}>
                <MapaDominio mapa={mapa} />
              </div>
            ) : (
              <div className={estilos.bloque}>
                <div className={estilos.bloqueCabecera}>
                  <h2>Por tema</h2>
                  <span>Dominio de cada tema</span>
                </div>
                <ul className={estilos.temas}>
                  {preparacion.porTema.map((t) => (
                    <li
                      key={t.tema}
                      data-completo={t.total > 0 && t.resueltos === t.total}
                    >
                      <span className={estilos.tema}>{nombreTema(t.tema)}</span>
                      <div className={estilos.barra}>
                        <div style={{ width: `${t.porcentaje}%` }} />
                      </div>
                      <span className={estilos.cifra}>
                        {t.resueltos}/{t.total}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Plan: qué hacer esta semana, el mes, tu nivel y si ya conviene postular */}
        {pestana === "plan" && (
          <div className={estilos.cuerpo}>
            {/* Tu plan junior de 15 días y el tutor de la semana (antes estaban en Hoy) */}
            <PlanHoy plan={plan} recargar={recargarPlan} />
            {!plan?.activo && <TutorHoy hoy={new Date().toLocaleDateString("sv")} semana={semana} />}
            <div className={estilos.fila}>
              {api.planSemana && (
                <div className={estilos.hueco}>
                  <PlanSemana />
                </div>
              )}
              <div className={estilos.pila}>
                <EntrenamientoHoy mapa={mapa} errores={errores} />
                {api.retoMes && <RetoMes />}
              </div>
            </div>

            {/* A todo el ancho: sus 7 cifras van en una rejilla de 4 + 3 */}
            {api.retoMes && (
              <div className={estilos.hueco}>
                <ResumenMes siempre />
              </div>
            )}

            <div className={estilos.fila}>
              {api.logros && (
                <div className={estilos.hueco}>
                  <TarjetaNivel />
                </div>
              )}
              {api.semaforo && (
                <div className={estilos.hueco}>
                  <SemaforoPostular />
                </div>
              )}
            </div>

            {api.planSemana && (
              <div className={estilos.hueco}>
                <CuantoAvance />
              </div>
            )}
          </div>
        )}
      </ContenidoPestanas>
    </section>
  );
}
