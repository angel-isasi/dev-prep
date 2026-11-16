// En Progreso: estudio contra juego de los últimos 7 días, y la "proyección honesta" de con cuánta
// preparación llegas a tu fecha meta si sigues al ritmo de esta semana.
import estilos from "./EstudioJuego.module.css";

const horas = (min) => (min >= 60 ? `${(min / 60).toFixed(1).replace(".0", "")} h` : `${min} min`);

/** @param {{ dias: { fecha: string, estudio: number, juego: number }[], proyeccion?: { preparacion: number, ejerciciosMas: number }, fechaMeta?: string }} props */
export function EstudioJuego({ dias, proyeccion, fechaMeta }) {
  if (!dias) return null;
  const maximo = Math.max(30, ...dias.map((d) => Math.max(d.estudio, d.juego)));
  const estudio = dias.reduce((s, d) => s + d.estudio, 0);
  const juego = dias.reduce((s, d) => s + d.juego, 0);

  return (
    <div className={estilos.bloque}>
      <div className={estilos.cabecera}>
        <h2>Estudio contra juego</h2>
        <span>
          Últimos 7 días: <strong>{horas(estudio)}</strong> de estudio y <strong>{horas(juego)}</strong> de juego
        </span>
      </div>
      <div className={estilos.barras}>
        {dias.map((d) => (
          <div key={d.fecha} title={`${d.fecha}: ${d.estudio} min de estudio, ${d.juego} min de juego`}>
            <div className={estilos.par}>
              <span className={estilos.estudio} style={{ height: `${(d.estudio / maximo) * 100}%` }} />
              <span className={estilos.juego} style={{ height: `${(d.juego / maximo) * 100}%` }} />
            </div>
            <small>{new Date(`${d.fecha}T12:00:00`).toLocaleDateString("es-PE", { weekday: "narrow" })}</small>
          </div>
        ))}
      </div>
      <div className={estilos.leyenda}>
        <span>
          <i className={estilos.estudio} /> Estudio
        </span>
        <span>
          <i className={estilos.juego} /> Juego
        </span>
      </div>
      {proyeccion && fechaMeta && (
        <p className={estilos.proyeccion}>
          <strong>Proyección honesta:</strong> si sigues como esta semana, llegas a tu fecha meta con unos{" "}
          <strong>{proyeccion.preparacion}%</strong> de preparación ({proyeccion.ejerciciosMas} ejercicios más).
        </p>
      )}
    </div>
  );
}
