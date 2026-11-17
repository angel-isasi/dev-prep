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
import { SemaforoPostular } from "../components/Logros.jsx";
import { RetoMes, ResumenMes } from "../components/Rutina.jsx";
import { CuantoAvance, PlanSemana } from "../components/Avance.jsx";
import estilos from "./Progreso.module.css";

const DIAS = ["L", "", "M", "", "V", "", "D"];

function textoCelda(c) {
  const [a, m, d] = c.fecha.split("-").map(Number);
  const fecha = new Date(a, m - 1, d).toLocaleDateString("es-PE", {
    day: "numeric",
    month: "short",
  });
  if (!c.hecho && !c.minutos) return `${fecha}: sin actividad`;
  return `${fecha}: ${c.hecho} hecho(s), ${c.minutos} min`;
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

  useEffect(() => {
    api.progreso().then(setDatos, (e) => setError(e.message));
  }, []);

  if (error)
    return <p className={estilos.mensaje}>No se pudo cargar: {error}</p>;
  if (!datos) return <Esqueleto variante="tarjetas" />;

  const { preparacion, racha, semana, ritmo, totales, calendario } = datos;
  const activos = calendario.filter((c) => c.nivel > 0).length;

  return (
    <section className={estilos.pagina}>
      <CabeceraPagina
        etiqueta={`${totales.resueltos} de ${totales.total} ejercicios dominados`}
        titulo="Progreso"
      >
        Lo que dominas de verdad, no solo lo que viste.
      </CabeceraPagina>

      <div className={estilos.resumen}>
        {/* Preparación: anillo grande */}
        <div className={estilos.preparacion}>
          <AnilloProgreso
            valor={preparacion.total / 100}
            tamano={168}
            grosor={12}
          >
            <strong className={estilos.porcentaje}>
              <NumeroAnimado
                valor={preparacion.total}
                decimales={preparacion.total % 1 ? 1 : 0}
              />
              <small>%</small>
            </strong>
          </AnilloProgreso>
          <div>
            <span className={estilos.etiqueta}>
              Preparación para entrevista
            </span>
            <p className={estilos.nota}>
              Cuenta solo lo resuelto sin ver la solución. Usar las 3 pistas
              vale menos, y un repaso vencido le resta. Los temas que más
              preguntan en entrevistas pesan más.
            </p>
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
                <SlidingNumber number={semana.resueltos + semana.repasos} />
              </strong>
              <span className={estilos.detalle}>
                hechos · {semana.minutos} min
              </span>
            </div>
          </MagicCard>
          <MagicCard className={estilos.dato}>
            <div className={estilos.datoInterior}>
              <span className={estilos.etiqueta}>Ritmo</span>
              <strong
                className={estilos.numero}
                data-tipo={
                  ritmo.promedioSemana >= ritmo.necesarioPorDia
                    ? "exito"
                    : "error"
                }
              >
                {ritmo.promedioSemana}
                <small>/día</small>
              </strong>
              <span className={estilos.detalle}>
                necesitas {ritmo.necesarioPorDia} al día
              </span>
            </div>
          </MagicCard>
        </AnimatedGroup>
      </div>

      {/* Por filas: qué hacer ahora, lo que dominas, tu constancia y si ya puedes postular.
          Cada fila pone sus tarjetas lado a lado (misma altura) y pasa a una columna si no caben. */}
      <div className={estilos.cuerpo}>
        <div className={estilos.fila}>
          {api.planSemana && (
            <div className={estilos.hueco}>
              <PlanSemana />
            </div>
          )}
          <div className={estilos.pila}>
            <EntrenamientoHoy mapa={mapa} errores={errores} />
            {api.retoMes && <RetoMes />}
            {api.retoMes && <ResumenMes siempre />}
          </div>
        </div>

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

        <div className={estilos.fila}>
          {api.planSemana && (
            <div className={estilos.hueco}>
              <CuantoAvance />
            </div>
          )}
          {api.semaforo && (
            <div className={estilos.hueco}>
              <SemaforoPostular />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
