// Niveles e insignias (versión web). TarjetaNivel va en Inicio y Hoy: tu nivel, lo que falta para el
// siguiente y un aviso (con sonido suave) cuando ganas algo nuevo. PaginaLogros muestra todas las insignias.
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { AnimatePresence, motion } from "motion/react";
import { api } from "../lib/api.js";
import { celebrar } from "../lib/celebrar.js";
import { CabeceraPagina } from "./CabeceraPagina.jsx";
import { Esqueleto } from "./Esqueleto.jsx";
import estilos from "./Logros.module.css";

export function TarjetaNivel() {
  const [logros, setLogros] = useState(null);
  const [nuevos, setNuevos] = useState([]);

  useEffect(() => {
    if (!api.logros) return;
    api.logros().then((r) => {
      setLogros(r);
      if (r.nuevos.length) {
        setNuevos(r.nuevos);
        celebrar("logro");
        api.marcarLogros(r.nuevos.map((n) => n.id));
      }
    }, () => {});
  }, []);

  if (!logros) return null;
  const { nivel, siguiente } = logros;

  return (
    <div className={estilos.tarjeta}>
      <AnimatePresence>
        {nuevos.length > 0 && (
          <motion.div className={estilos.nuevos} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <strong>¡Lo ganaste!</strong>
            {nuevos.map((n) => (
              <span key={n.id}>
                {n.icono} {n.titulo}
              </span>
            ))}
            <button type="button" className="boton boton-fantasma" onClick={() => setNuevos([])}>
              Seguir
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      <div className={estilos.cabecera}>
        <div>
          <span className={estilos.etiqueta}>Nivel {nivel.id} de 6</span>
          <strong className={estilos.titulo}>{nivel.titulo}</strong>
          <small>{nivel.descripcion}</small>
        </div>
        <Link to="/logros" className={estilos.insignias}>
          {logros.ganadas}/{logros.insignias.length} insignias →
        </Link>
      </div>
      {siguiente && (
        <div className={estilos.siguiente}>
          <span>Para ser {siguiente.titulo}:</span>
          {siguiente.requisitos.map((r) => (
            <div key={r.campo} className={estilos.requisito} data-listo={r.listo}>
              <span>
                {r.listo ? "✓ " : ""}
                {r.actual}/{r.meta} {r.texto}
              </span>
              <div className={estilos.barra}>
                <i style={{ width: `${(r.actual / r.meta) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function PaginaLogros() {
  const [logros, setLogros] = useState(null);
  useEffect(() => {
    api.logros().then(setLogros, () => setLogros(false));
  }, []);
  if (logros === null) return <Esqueleto variante="tarjetas" />;
  if (!logros) return <p style={{ padding: "var(--espacio-6)", color: "var(--texto-suave)" }}>No se pudieron cargar tus insignias. Recarga la página.</p>;

  return (
    <section className={estilos.pagina}>
      <CabeceraPagina etiqueta={`Nivel ${logros.nivel.id}: ${logros.nivel.titulo}`} titulo="Insignias">
        Se ganan con lo que demuestras: tests que pasan, repasos, simulacros, inglés. Una vez ganadas, no se pierden.
      </CabeceraPagina>
      <div className={estilos.rejilla}>
        {logros.insignias.map((i) => (
          <div key={i.id} className={estilos.insignia} data-ganada={i.ganada}>
            <span className={estilos.icono} aria-hidden>
              {i.icono}
            </span>
            <strong>{i.titulo}</strong>
            <small>{i.descripcion}</small>
            {!i.ganada && i.meta > 1 && (
              <div className={estilos.barra}>
                <i style={{ width: `${(i.actual / i.meta) * 100}%` }} />
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

/** ¿Ya conviene postular? Semáforo en Progreso. */
export function SemaforoPostular() {
  const [s, setS] = useState(null);
  useEffect(() => {
    api.semaforo?.().then(setS, () => {});
  }, []);
  if (!s) return null;
  const titulo = { verde: "Ya puedes postular", amarillo: "Casi: empieza a preparar tus postulaciones", rojo: "Todavía no: sigue practicando" }[s.color];
  return (
    <div className={estilos.semaforo} data-color={s.color}>
      <div className={estilos.luz} aria-hidden />
      <div>
        <strong>{titulo}</strong>
        <ul>
          {s.puntos.map((p) => (
            <li key={p.texto} data-listo={p.listo}>
              {p.listo ? "✓" : "○"} {p.texto}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
