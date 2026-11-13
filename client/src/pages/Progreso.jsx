import { useEffect, useState } from "react";
import { api } from "../lib/api.js";
import { nombreTema } from "../lib/etiquetas.js";
import estilos from "./Progreso.module.css";

const DIAS = ["L", "", "M", "", "V", "", "D"];

function textoCelda(c) {
  const [a, m, d] = c.fecha.split("-").map(Number);
  const fecha = new Date(a, m - 1, d).toLocaleDateString("es-PE", { day: "numeric", month: "short" });
  if (!c.hecho && !c.minutos) return `${fecha}: sin actividad`;
  return `${fecha}: ${c.hecho} hecho(s), ${c.minutos} min`;
}

/** Agrupa las celdas en columnas de 7 días (una columna por semana). */
function porSemanas(celdas) {
  const semanas = [];
  for (let i = 0; i < celdas.length; i += 7) semanas.push(celdas.slice(i, i + 7));
  return semanas;
}

export function Progreso() {
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.progreso().then(setDatos, (e) => setError(e.message));
  }, []);

  if (error) return <p className={estilos.mensaje}>No se pudo cargar: {error}</p>;
  if (!datos) return <p className={estilos.mensaje}>Cargando…</p>;

  const { preparacion, racha, semana, ritmo, totales, calendario } = datos;
  const activos = calendario.filter((c) => c.nivel > 0).length;

  return (
    <section className={estilos.pagina}>
      <header className={estilos.cabecera}>
        <h1>Progreso</h1>
        <p>Lo que dominas de verdad, no solo lo que viste.</p>
      </header>

      <div className={estilos.resumen}>
        <div className={estilos.preparacion}>
          <span className={estilos.etiqueta}>Preparación para entrevista</span>
          <strong>
            {preparacion.total}
            <small>%</small>
          </strong>
          <div className={estilos.barra}>
            <div style={{ width: `${preparacion.total}%` }} />
          </div>
          <p className={estilos.nota}>
            Cuenta solo lo resuelto sin ver la solución. Usar las 3 pistas vale menos, y un repaso vencido le resta.
            Los temas que más preguntan en entrevistas pesan más.
          </p>
        </div>
        <dl className={estilos.datos}>
          <div>
            <dt>Racha</dt>
            <dd>{racha} días</dd>
          </div>
          <div>
            <dt>Resueltos</dt>
            <dd>
              {totales.resueltos}/{totales.total}
            </dd>
          </div>
          <div>
            <dt>Esta semana</dt>
            <dd>
              {semana.resueltos + semana.repasos} hechos · {semana.minutos} min
            </dd>
          </div>
          <div>
            <dt>Ritmo</dt>
            <dd>
              {ritmo.promedioSemana}/día (necesitas {ritmo.necesarioPorDia})
            </dd>
          </div>
        </dl>
      </div>

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
                <span key={c.fecha} className={estilos.celda} data-nivel={c.nivel} title={textoCelda(c)} />
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

      <div className={estilos.bloque}>
        <div className={estilos.bloqueCabecera}>
          <h2>Por tema</h2>
          <span>Dominio de cada tema</span>
        </div>
        <ul className={estilos.temas}>
          {preparacion.porTema.map((t) => (
            <li key={t.tema}>
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
    </section>
  );
}
