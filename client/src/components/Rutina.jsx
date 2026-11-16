// Piezas de la rutina diaria (versión web):
// - PlanDeHoy: una sola lista de lo que toca hoy, con "Siguiente".
// - TarjetaDiario y PaginaDiario: tu diario de una línea.
// - Enfoque: sesiones de 25 minutos (en la laptop, si abres el juego durante la sesión, se anula).
// - RetoMes y ResumenMes: el reto del mes y lo que lograste el mes pasado.
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { api } from "../lib/api.js";
import { celebrar } from "../lib/celebrar.js";
import { sonidos } from "../lib/sonidos.js";
import { useAhora } from "../hooks/useAhora.js";
import { useEvento } from "../hooks/useEvento.js";
import { CabeceraPagina } from "./CabeceraPagina.jsx";
import { AnilloProgreso } from "./AnilloProgreso.jsx";
import estilos from "./Rutina.module.css";

export function PlanDeHoy() {
  const [plan, setPlan] = useState(null);
  useEffect(() => {
    api.planDeHoy?.().then(setPlan, () => {});
  }, []);
  if (!plan) return null;
  const hechos = plan.pasos.filter((p) => p.hecho).length;

  return (
    <div className={estilos.tarjeta}>
      <div className={estilos.cabecera}>
        <div>
          <span className={estilos.etiqueta}>{plan.pausa ? "Semana de exámenes: sin presión" : "Tu plan de hoy"}</span>
          <strong>
            {hechos} de {plan.pasos.length} listos
          </strong>
        </div>
        {plan.siguiente ? (
          <Link to={plan.siguiente.a} className="boton boton-primario">
            Siguiente: {plan.siguiente.texto.split(":")[0]} →
          </Link>
        ) : (
          <span className={estilos.listo}>¡Día completo!</span>
        )}
      </div>
      <ol className={estilos.pasos}>
        {plan.pasos.map((p) => (
          <li key={p.id} data-hecho={p.hecho}>
            <Link to={p.a}>
              <span className={estilos.check} aria-hidden>
                {p.hecho ? "✓" : ""}
              </span>
              <span>
                <strong>{p.texto}</strong>
                <small>{p.detalle}</small>
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}

/** El diario: dos líneas al cerrar el día. */
export function PaginaDiario() {
  const [entradas, setEntradas] = useState([]);
  const [aprendi, setAprendi] = useState("");
  const [trabe, setTrabe] = useState("");
  const [guardado, setGuardado] = useState(false);

  const cargar = () =>
    api.diario().then((lista) => {
      setEntradas(lista);
      const hoy = lista.find((e) => e.fecha === new Date().toLocaleDateString("en-CA"));
      if (hoy) {
        setAprendi(hoy.aprendi);
        setTrabe(hoy.trabe);
      }
    });
  useEffect(() => {
    cargar();
  }, []);

  async function guardar(e) {
    e.preventDefault();
    await api.guardarDiario({ aprendi, trabe });
    setGuardado(true);
    cargar();
  }

  return (
    <section className={estilos.pagina}>
      <CabeceraPagina etiqueta="Una línea al día" titulo="Tu diario">
        Escribir lo que aprendiste lo fija en la memoria, y lo que te trabó te dice qué repasar mañana.
      </CabeceraPagina>
      <div className={estilos.diario}>
        <form onSubmit={guardar} className={estilos.formulario}>
          <label>
            ¿Qué aprendiste hoy?
            <input
              value={aprendi}
              onChange={(e) => setAprendi(e.target.value)}
              maxLength={280}
              placeholder="Por ejemplo: que map devuelve un arreglo nuevo"
            />
          </label>
          <label>
            ¿Qué te trabó?
            <input
              value={trabe}
              onChange={(e) => setTrabe(e.target.value)}
              maxLength={280}
              placeholder="Por ejemplo: el orden de las promesas"
            />
          </label>
          <div>
            <button type="submit" className="boton boton-primario" disabled={!aprendi.trim() && !trabe.trim()}>
              Guardar
            </button>
            {guardado && <span className={estilos.listo}> Guardado</span>}
          </div>
        </form>
        <ol className={estilos.entradas}>
          {entradas.map((e) => (
            <li key={e.fecha} className="aparecer">
              <small>
                {new Date(`${e.fecha}T12:00:00`).toLocaleDateString("es-PE", { weekday: "long", day: "numeric", month: "long" })}
              </small>
              {e.aprendi && <p>✓ {e.aprendi}</p>}
              {e.trabe && <p>⚠ {e.trabe}</p>}
            </li>
          ))}
          {entradas.length === 0 && <li className={estilos.vacio}>Aquí aparecerán tus días. La primera línea es la más difícil.</li>}
        </ol>
      </div>
    </section>
  );
}

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
        <aside className={estilos.consejos}>
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
