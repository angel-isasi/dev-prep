// Ajustes de la rutina (versión web): "Mi semana" (cuánto puedes cada día), semanas de exámenes,
// meta de inglés, sonidos y el tiempo libre (tope y qué juego se mide). Se sincronizan entre dispositivos.
import { useEffect, useState } from "react";
import { api } from "../lib/api.js";
import { cambiarSonido, NIVELES_SONIDO, nivelSonido, sonidos } from "../lib/sonidos.js";
import { GANANCIA } from "../../../server/juego.js";
import estilos from "./SeccionSync.module.css";
import propios from "./SeccionRutina.module.css";

const DIAS = [
  ["lun", "Lunes"],
  ["mar", "Martes"],
  ["mie", "Miércoles"],
  ["jue", "Jueves"],
  ["vie", "Viernes"],
  ["sab", "Sábado"],
  ["dom", "Domingo"],
];
const CARGAS = [
  ["libre", "Libre"],
  ["poco", "Poco"],
  ["normal", "Normal"],
  ["mucho", "Mucho"],
];

export function SeccionRutina() {
  const [r, setR] = useState(null);
  const [aviso, setAviso] = useState(null);
  const [pausa, setPausa] = useState({ desde: "", hasta: "" });
  const [sonido, setSonido] = useState(nivelSonido());

  const cargar = () => api.rutina?.().then(setR, () => {});
  useEffect(() => {
    cargar();
  }, []);
  if (!r) return null;

  const listo = (texto) => {
    setAviso(texto);
    cargar();
  };

  async function agregarPausa() {
    if (!pausa.desde || !pausa.hasta || pausa.hasta < pausa.desde) return;
    const manana = new Date(Date.now() + 86_400_000).toLocaleDateString("en-CA");
    if (pausa.desde < manana) return setAviso("Las pausas se programan con al menos un día de anticipación.");
    const dias = (Date.parse(pausa.hasta) - Date.parse(pausa.desde)) / 86_400_000 + 1;
    if (dias > 14) return setAviso("Una pausa dura como máximo 2 semanas.");
    await api.guardarPausas([...r.pausas, pausa]);
    setPausa({ desde: "", hasta: "" });
    listo("Pausa guardada: esos días no suman deuda ni rompen tu racha.");
  }

  return (
    <>
      <section className={estilos.seccion}>
        <h2>Mi semana</h2>
        <p className={estilos.ayuda}>
          Cuánto puedes estudiar cada día. Tu meta diaria ({r.metaDiaria}) se reparte según esto sin cambiar el total de la semana: más el día libre, menos el de clases
          largas.
        </p>
        <div className={propios.semana}>
          {DIAS.map(([clave, nombre]) => (
            <label key={clave}>
              <span>{nombre}</span>
              <select
                value={r.horario[clave] ?? "normal"}
                onChange={async (e) => {
                  await api.guardarHorario({ ...r.horario, [clave]: e.target.value });
                  listo("Horario guardado.");
                }}
              >
                {CARGAS.map(([v, t]) => (
                  <option key={v} value={v}>
                    {t}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>
      </section>

      <section className={estilos.seccion}>
        <h2>Semanas de exámenes</h2>
        <p className={estilos.ayuda}>Programa una pausa (desde mañana, hasta 2 semanas): esos días no suman deuda ni rompen tu racha.</p>
        <div className={propios.fila}>
          <input type="date" value={pausa.desde} onChange={(e) => setPausa({ ...pausa, desde: e.target.value })} aria-label="Desde" />
          <input type="date" value={pausa.hasta} onChange={(e) => setPausa({ ...pausa, hasta: e.target.value })} aria-label="Hasta" />
          <button type="button" className="boton" onClick={agregarPausa}>
            Agregar pausa
          </button>
        </div>
        {r.pausas.length > 0 && (
          <ul className={propios.lista}>
            {r.pausas.map((p, i) => (
              <li key={`${p.desde}-${i}`}>
                {p.desde} a {p.hasta}
                <button
                  type="button"
                  className="boton boton-fantasma"
                  onClick={async () => {
                    await api.guardarPausas(r.pausas.filter((_, j) => j !== i));
                    listo("Pausa quitada.");
                  }}
                >
                  Quitar
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className={estilos.seccion}>
        <h2>Tiempo libre</h2>
        <p className={estilos.ayuda}>
          Se gana con lo que demuestras y se desbloquea al cumplir tu meta. Lo de más pasa a deuda. Si dev-prep está abierto en tu laptop, mide solo el tiempo de juego.
        </p>
        <ul className={propios.lista}>
          {GANANCIA.map((g) => (
            <li key={g.campo}>
              {g.texto} <strong>+{g.minutos} min</strong>
            </li>
          ))}
        </ul>
        <div className={propios.fila}>
          <label>
            Tope por día (minutos){" "}
            <input
              type="number"
              min="0"
              max="240"
              defaultValue={r.juego.tope}
              onBlur={async (e) => {
                const tope = Math.max(0, Math.min(240, Number(e.target.value) || 0));
                await api.guardarJuego({ ...r.juego, tope });
                listo("Tope guardado.");
              }}
            />
          </label>
          <label>
            Juegos que se miden{" "}
            <input
              defaultValue={r.juego.procesos.join(", ")}
              onBlur={async (e) => {
                const procesos = e.target.value
                  .split(",")
                  .map((p) => p.trim())
                  .filter(Boolean);
                await api.guardarJuego({ ...r.juego, procesos });
                listo("Juegos guardados.");
              }}
            />
          </label>
        </div>
      </section>

      <section className={estilos.seccion}>
        <h2>Inglés y sonidos</h2>
        <div className={propios.fila}>
          <label>
            Meta de inglés (minutos al día){" "}
            <input
              type="number"
              min="0"
              max="120"
              defaultValue={r.metaIngles}
              onBlur={async (e) => {
                await api.guardarMetaIngles(Math.max(0, Math.min(120, Number(e.target.value) || 0)));
                listo("Meta de inglés guardada.");
              }}
            />
          </label>
          <label>
            Sonidos{" "}
            <select
              value={sonido}
              onChange={(e) => {
                cambiarSonido(e.target.value);
                setSonido(e.target.value);
                sonidos.acierto();
              }}
            >
              {Object.keys(NIVELES_SONIDO).map((n) => (
                <option key={n} value={n}>
                  {n[0].toUpperCase() + n.slice(1)}
                </option>
              ))}
            </select>
          </label>
        </div>
        {aviso && <p className={estilos.ayuda}>{aviso}</p>}
      </section>
    </>
  );
}
