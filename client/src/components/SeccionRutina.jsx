// Ajustes de la rutina (versión web): "Mi semana" (cuánto puedes cada día), semanas de exámenes,
// meta de inglés, sonidos y el tiempo libre (tope y qué juego se mide). Se sincronizan entre dispositivos.
import { createContext, useContext, useEffect, useState } from "react";
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

const TODAS = ["semana", "pausas", "puntos", "sonidos"];

/**
 * Ajustes lo pone en true alrededor de su pestaña "Dispositivos": ahí "Mi semana", las pausas y
 * los puntos ya se muestran en otras pestañas, así que esta sección solo pinta inglés y sonidos.
 */
export const EnPestanas = createContext(false);

/**
 * @param {{ partes?: ("semana" | "pausas" | "puntos" | "sonidos")[] }} props
 * `partes` elige qué tarjetas se pintan. Sin ella: todas, o solo "sonidos" dentro de las pestañas de Ajustes.
 */
export function SeccionRutina({ partes }) {
  const enPestanas = useContext(EnPestanas);
  const ver = partes ?? (enPestanas ? ["sonidos"] : TODAS);
  const [r, setR] = useState(null);
  const [aviso, setAviso] = useState(null); // { parte, texto }: el aviso sale en la tarjeta que lo causó
  const [pausa, setPausa] = useState({ desde: "", hasta: "" });
  const [sonido, setSonido] = useState(nivelSonido());

  const cargar = () => api.rutina?.().then(setR, () => {});
  useEffect(() => {
    cargar();
  }, []);
  if (!r) return null;

  const listo = (parte, texto) => {
    setAviso({ parte, texto });
    cargar();
  };
  const avisoDe = (parte) =>
    aviso?.parte === parte && (
      <p className={estilos.ayuda} role="status">
        {aviso.texto}
      </p>
    );

  async function agregarPausa() {
    if (!pausa.desde || !pausa.hasta || pausa.hasta < pausa.desde) return;
    const manana = new Date(Date.now() + 86_400_000).toLocaleDateString("en-CA");
    if (pausa.desde < manana) return setAviso({ parte: "pausas", texto: "Las pausas se programan con al menos un día de anticipación." });
    const dias = (Date.parse(pausa.hasta) - Date.parse(pausa.desde)) / 86_400_000 + 1;
    if (dias > 14) return setAviso({ parte: "pausas", texto: "Una pausa dura como máximo 2 semanas." });
    await api.guardarPausas([...r.pausas, pausa]);
    setPausa({ desde: "", hasta: "" });
    listo("pausas", "Pausa guardada: esos días no suman deuda ni rompen tu racha.");
  }

  return (
    <>
      {ver.includes("semana") && (
        <section className={estilos.seccion}>
          <h2 title={`Tu meta diaria (${r.metaDiaria}) se reparte según esto sin cambiar el total de la semana: más el día libre, menos el de clases largas.`}>
            Mi semana
          </h2>
          <p className={estilos.ayuda}>Cuánto puedes estudiar cada día: tu meta se reparte según esto.</p>
          {/* 7 en una fila en la laptop, 2 por fila en el celular */}
          <div className={propios.semana}>
            {DIAS.map(([clave, nombre]) => (
              <label key={clave}>
                <span>{nombre}</span>
                <select
                  value={r.horario[clave] ?? "normal"}
                  onChange={async (e) => {
                    await api.guardarHorario({ ...r.horario, [clave]: e.target.value });
                    listo("semana", "Horario guardado.");
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
          {avisoDe("semana")}
        </section>
      )}

      {ver.includes("pausas") && (
        <section className={estilos.seccion}>
          <h2>Semanas de exámenes</h2>
          <p className={estilos.ayuda}>Una pausa (desde mañana, hasta 2 semanas) no suma deuda ni rompe tu racha.</p>
          <div className={propios.fila}>
            <label>
              Desde <input type="date" value={pausa.desde} onChange={(e) => setPausa({ ...pausa, desde: e.target.value })} />
            </label>
            <label>
              Hasta <input type="date" value={pausa.hasta} onChange={(e) => setPausa({ ...pausa, hasta: e.target.value })} />
            </label>
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
                      listo("pausas", "Pausa quitada.");
                    }}
                  >
                    Quitar
                  </button>
                </li>
              ))}
            </ul>
          )}
          {avisoDe("pausas")}
        </section>
      )}

      {ver.includes("puntos") && (
        <section className={estilos.seccion}>
          <h2>Puntos y tiempo libre</h2>
          <p className={estilos.ayuda}>
            <strong>1 punto = 1 minuto libre</strong>
          </p>
          {/* La tabla: dos columnas en la laptop, una en el celular */}
          <ul className={propios.puntos}>
            {GANANCIA.map((g) => (
              <li key={g.campo}>
                <span>{g.texto}</span>
                <strong>+{g.minutos}</strong>
              </li>
            ))}
          </ul>
          <details className={propios.como}>
            <summary>Cómo funciona</summary>
            <p>
              Esta misma tabla mide tu meta diaria y tu racha. El tiempo libre se desbloquea al cumplir tu meta y lo que juegues de más pasa a
              deuda. Si dev-prep está abierto en tu laptop, mide solo el tiempo de juego.
            </p>
          </details>
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
                  listo("puntos", "Tope guardado.");
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
                  listo("puntos", "Juegos guardados.");
                }}
              />
            </label>
          </div>
          {avisoDe("puntos")}
        </section>
      )}

      {ver.includes("sonidos") && (
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
                  listo("sonidos", "Meta de inglés guardada.");
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
          {avisoDe("sonidos")}
        </section>
      )}
    </>
  );
}
