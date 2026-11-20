// Piezas de la rutina diaria (versión web):
// - Enfoque: sesiones de 25 minutos (en la laptop, si abres el juego durante la sesión, se anula).
// - RetoMes y ResumenMes: el reto del mes y lo que lograste el mes pasado.
import { useEffect, useState } from "react";
import { api } from "../lib/api.js";
import { celebrar } from "../lib/celebrar.js";
import { sonidos } from "../lib/sonidos.js";
import { useAhora } from "../hooks/useAhora.js";
import { useEvento } from "../hooks/useEvento.js";
import { CabeceraPagina } from "./CabeceraPagina.jsx";
import { AnilloProgreso } from "./AnilloProgreso.jsx";
import estilos from "./Rutina.module.css";

const CLAVE_ENFOQUE = "devprep-enfoque";
const MINUTOS = 25;

/** Sesión de enfoque de 25 minutos. Sobrevive a cambiar de pantalla (se guarda la hora de inicio). */
export function Enfoque() {
  const [inicio, setInicio] = useState(() => Number(localStorage.getItem(CLAVE_ENFOQUE)) || null);
  const [mensaje, setMensaje] = useState(null);
  const ahora = useAhora(1000);
  const restante = inicio ? Math.max(0, MINUTOS * 60 - Math.floor((ahora - inicio) / 1000)) : null;

  const terminar = (texto) => {
    localStorage.removeItem(CLAVE_ENFOQUE);
    setInicio(null);
    setMensaje(texto);
  };

  useEffect(() => {
    if (inicio && restante === 0) {
      api.completarEnfoque();
      celebrar("meta");
      terminar("¡25 minutos de enfoque! Tómate 5 de descanso: levántate, toma agua.");
    }
  }, [inicio, restante]);

  // En la laptop, el motor avisa si el juego está abierto: la sesión no cuenta
  useEvento("juego", (d) => {
    if (inicio && d.jugando) {
      sonidos.fallo();
      terminar("Se anuló la sesión: abriste el juego durante el enfoque.");
    }
  });

  return (
    <section className={estilos.pagina}>
      <CabeceraPagina etiqueta="Pomodoro" titulo="Modo enfoque">
        25 minutos de una sola cosa, sin celular ni juego. Cada sesión completa suma 5 minutos de tiempo libre (hasta 4 al día).
      </CabeceraPagina>
      <div className={estilos.enfoque}>
        <div>
          <div className={estilos.reloj}>
            <AnilloProgreso
              valor={restante === null ? 0 : 1 - restante / (MINUTOS * 60)}
              tamano={300}
              grosor={14}
              completo={restante === 0}
            >
              <strong>
                {restante === null ? `${MINUTOS}:00` : `${Math.floor(restante / 60)}:${String(restante % 60).padStart(2, "0")}`}
              </strong>
            </AnilloProgreso>
            {inicio ? (
              <button type="button" className="boton" onClick={() => terminar("Sesión cancelada.")}>
                Cancelar
              </button>
            ) : (
              <button
                type="button"
                className="boton boton-primario"
                onClick={() => {
                  const t = Date.now();
                  localStorage.setItem(CLAVE_ENFOQUE, String(t));
                  setInicio(t);
                  setMensaje(null);
                }}
              >
                Empezar 25 minutos
              </button>
            )}
          </div>
          {mensaje && <p className={estilos.mensaje}>{mensaje}</p>}
        </div>
        <aside className={`textura ${estilos.consejos}`}>
          <strong>Para que funcione</strong>
          <ol>
            <li>Elige UNA cosa antes de empezar: un ejercicio, una lección o un tema.</li>
            <li>Celular boca abajo y lejos. WhatsApp cerrado en la laptop.</li>
            <li>Si se te cruza otra idea, anótala en un papel y vuelve a lo tuyo.</li>
            <li>Al terminar, descansa 5 minutos de verdad: lejos de la pantalla.</li>
          </ol>
        </aside>
      </div>
    </section>
  );
}

export function RetoMes() {
  const [reto, setReto] = useState(null);
  const cargar = () => api.retoMes?.().then(setReto, () => {});
  useEffect(() => {
    cargar();
  }, []);
  if (!reto) return null;

  if (reto.elegido) {
    const r = reto.elegido;
    return (
      <div className={estilos.tarjeta}>
        <span className={estilos.etiqueta}>Reto del mes</span>
        <strong>
          {r.cumplido ? "✓ " : ""}
          {r.titulo}
        </strong>
        <div className={estilos.barra}>
          <i style={{ width: `${(r.actual / r.meta) * 100}%` }} />
        </div>
        <small className={estilos.detalle}>
          {r.actual} de {r.meta}
        </small>
      </div>
    );
  }
  return (
    <div className={estilos.tarjeta}>
      <span className={estilos.etiqueta}>Elige tu reto del mes</span>
      <div className={estilos.opciones}>
        {reto.propuestas.map((p) => (
          <button
            key={p.tipo}
            type="button"
            className="boton"
            onClick={async () => {
              await api.elegirRetoMes(p);
              cargar();
            }}
          >
            {p.titulo}
          </button>
        ))}
      </div>
    </div>
  );
}

const NOMBRES = [
  ["resueltos", "Ejercicios resueltos"],
  ["repasos", "Repasos"],
  ["lecciones", "Lecciones"],
  ["ingles", "Minutos de inglés"],
  ["estudio", "Minutos de estudio"],
  ["juego", "Minutos de juego"],
  ["diasActivos", "Días activos"],
];

/** Lo que lograste el mes pasado comparado con el anterior (se muestra la primera semana del mes). */
export function ResumenMes({ siempre = false }) {
  const [r, setR] = useState(null);
  useEffect(() => {
    if (!siempre && new Date().getDate() > 7) return;
    api.resumenMes?.().then(setR, () => {});
  }, [siempre]);
  if (!r || !Object.values(r.cifras).some(Boolean)) return null;
  const nombreMes = new Date(`${r.mes}-15T12:00:00`).toLocaleDateString("es-PE", { month: "long", year: "numeric" });

  return (
    <div className={estilos.tarjeta}>
      <span className={estilos.etiqueta}>Tu resumen de {nombreMes}</span>
      <div className={estilos.cifras}>
        {NOMBRES.map(([campo, texto]) => {
          const dif = r.cifras[campo] - r.antes[campo];
          return (
            <div key={campo}>
              <strong>{r.cifras[campo]}</strong>
              <small>{texto}</small>
              {r.antes[campo] > 0 && (
                <em data-sube={campo === "juego" ? dif <= 0 : dif >= 0}>
                  {dif >= 0 ? "+" : ""}
                  {dif} vs. mes anterior
                </em>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
