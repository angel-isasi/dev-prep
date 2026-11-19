// Tu ruta hasta la fecha meta: las semanas que quedan, qué unidades tocan en cada una y los
// hitos del final. La regla está en server/ruta.js; aquí solo se dibuja.
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { api } from "../lib/api.js";
import estilos from "./Ruta.module.css";

export const ESTADO_RUTA = {
  empezando: { texto: "Recién empiezas", tono: "acento" },
  "al-dia": { texto: "Vas al día", tono: "exito" },
  adelantado: { texto: "Vas adelantado", tono: "exito" },
  atrasado: { texto: "Vas atrasado", tono: "error" },
  terminada: { texto: "Ruta terminada", tono: "exito" },
  vencida: { texto: "La fecha ya pasó", tono: "error" },
};

// El estado de cada unidad se lee por su símbolo, no solo por el color
const SIMBOLO = { verde: "✓", amarillo: "◐", rojo: "○", "sin-empezar": "○" };
const NOMBRE_ESTADO = { verde: "dominada", amarillo: "a medias", rojo: "floja", "sin-empezar": "sin empezar" };

const fecha = (iso, opciones = { day: "numeric", month: "short" }) => {
  const [a, m, d] = iso.split("-").map(Number);
  return new Date(a, m - 1, d).toLocaleDateString("es-PE", opciones);
};

/** Los temas de Aprender tienen su página; Algoritmos solo tiene ejercicios. */
const enlaceUnidad = (u) => (u.area === "algoritmos" ? "/practicar/lista?coleccion=algoritmos%2Fretos" : `/aprender/${u.id}`);

/** Carga la ruta una vez. Devuelve null mientras carga o si esta versión de la app no la tiene. */
export function useRuta() {
  const [ruta, setRuta] = useState(null);
  useEffect(() => {
    api.ruta?.().then(setRuta, () => {});
  }, []);
  return ruta;
}

/** Una frase que explica el veredicto con números. */
export function explicacionRuta(r) {
  if (r.estado === "terminada") return "Todas las unidades están al menos en amarillo. Lo que queda es ponerlas en verde.";
  if (r.estado === "vencida") return "Mueve tu fecha meta en Ajustes para rearmar la ruta.";
  if (r.estado === "empezando") return `${r.total} unidades en ${r.semanas.filter((s) => !s.hito).length} semanas: unas ${r.porSemana} por semana.`;
  const llevas = `Llevas ${r.listas} ${r.listas === 1 ? "unidad lista" : "unidades listas"} y a ritmo parejo tocarían ${r.esperadas}.`;
  return r.estado === "atrasado" ? `${llevas} Lo que falta ya se repartió en las semanas que quedan.` : llevas;
}

// Cuántas semanas se ven de entrada: la actual y las dos siguientes
const SEMANAS_A_LA_VISTA = 3;

export function Ruta({ ruta }) {
  const [todas, setTodas] = useState(false);
  if (!ruta) return null;
  const info = ESTADO_RUTA[ruta.estado];
  // Al día o adelantado, la frase solo repetiría el chip ("13 de 36 unidades listas"): va como title
  const repiteChip = ruta.estado === "al-dia" || ruta.estado === "adelantado";
  // De entrada, solo esta semana y las 2 que siguen; el botón despliega el resto
  const actual = Math.max(0, ruta.semanas.findIndex((s) => s.actual));
  const semanas = todas ? ruta.semanas : ruta.semanas.slice(actual, actual + SEMANAS_A_LA_VISTA);
  const hayMas = ruta.semanas.length > SEMANAS_A_LA_VISTA;

  return (
    <section className={`tarjeta ${estilos.ruta}`} id="ruta">
      <header className={estilos.cabecera}>
        <div>
          <span className="etiqueta">Tu ruta hasta el {fecha(ruta.fechaMeta, { day: "numeric", month: "long", year: "numeric" })}</span>
          <h2>
            {info.texto}
            <span className="chip" data-tono={info.tono} title={repiteChip ? explicacionRuta(ruta) : undefined}>
              {ruta.listas} de {ruta.total} unidades listas
            </span>
          </h2>
          {!repiteChip && <p>{explicacionRuta(ruta)}</p>}
        </div>
        <dl className={estilos.datos}>
          <div>
            <dt>Faltan</dt>
            <dd>{Math.max(0, ruta.diasRestantes)} días</dd>
          </div>
          <div>
            <dt>Ritmo</dt>
            <dd>{ruta.porSemana} por semana</dd>
          </div>
          <div>
            <dt>En verde</dt>
            <dd>{ruta.dominadas}</dd>
          </div>
        </dl>
      </header>

      {ruta.apretada && ruta.estado !== "terminada" && (
        <p className={estilos.aviso}>
          {ruta.sinLugar.length > 0
            ? `No quedan semanas para ${ruta.sinLugar.length} ${ruta.sinLugar.length === 1 ? "unidad" : "unidades"}.`
            : `A este ritmo son ${ruta.porSemana} unidades por semana, y más de 5 es demasiado.`}{" "}
          <Link to="/ajustes">Mueve tu fecha meta</Link> o dale más horas en "Mi semana".
        </p>
      )}

      <ol className={estilos.semanas}>
        {semanas.map((s) => (
          <li key={s.desde} className={estilos.semana} data-actual={s.actual} data-hito={!!s.hito}>
            <div className={estilos.semanaCabeza}>
              <strong>{s.actual ? "Esta semana" : `Semana ${s.numero}`}</strong>
              <span>
                {fecha(s.desde)} al {fecha(s.hasta)}
              </span>
            </div>
            {s.hito ? (
              <div className={estilos.hito}>
                <strong>{s.hito.titulo}</strong>
                <span>{s.hito.detalle}</span>
              </div>
            ) : s.unidades.length ? (
              <ul className={estilos.unidades}>
                {s.unidades.map((u) => (
                  <li key={u.id} data-area={u.area}>
                    <Link to={enlaceUnidad(u)} title={`${u.titulo}: ${NOMBRE_ESTADO[u.estado]}`}>
                      <i data-estado={u.estado} aria-hidden>
                        {SIMBOLO[u.estado]}
                      </i>
                      {u.titulo}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className={estilos.libre}>{s.dias === 0 ? "Semana de exámenes: sin unidades nuevas" : "Semana para repasar y ponerte al día"}</p>
            )}
          </li>
        ))}
      </ol>

      <div className={estilos.pie}>
        {hayMas && (
          <button type="button" className="boton" aria-expanded={todas} onClick={() => setTodas(!todas)}>
            {todas ? "Ver menos" : `Ver las ${ruta.semanas.length} semanas`}
          </button>
        )}
        {/* La regla queda plegada: se abre solo si quieres saber cómo se cuenta */}
        <details className={estilos.leyenda}>
          <summary>¿Cuándo cuenta una unidad?</summary>
          <p>
            Cuenta como lista cuando llega a amarillo en tu mapa: lecciones hechas, quiz aprobado o ejercicios resueltos. Si te atrasas, lo pendiente se
            reparte solo entre las semanas que quedan.
          </p>
        </details>
      </div>
    </section>
  );
}
