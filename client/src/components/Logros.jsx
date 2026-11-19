// Niveles e insignias (versión web). TarjetaNivel va en Inicio y Hoy: tu nivel, lo que falta para el
// siguiente y un aviso (con sonido suave) cuando ganas algo nuevo. PaginaLogros muestra todas las insignias.
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { AnimatePresence, motion } from "motion/react";
import { api } from "../lib/api.js";
import confetti from "canvas-confetti";
import { sonidos } from "../lib/sonidos.js";
import { CabeceraPagina } from "./CabeceraPagina.jsx";
import { Esqueleto } from "./Esqueleto.jsx";
import estilos from "./Logros.module.css";

export function TarjetaNivel() {
  const [logros, setLogros] = useState(null);
  const [nuevos, setNuevos] = useState([]);
  const lienzo = useRef(null);

  useEffect(() => {
    if (!api.logros) return;
    api.logros().then((r) => {
      setLogros(r);
      if (r.nuevos.length) {
        setNuevos(r.nuevos);
        sonidos.logro();
        api.marcarLogros(r.nuevos.map((n) => n.id));
      }
    }, () => {});
  }, []);

  // El confeti se dibuja en un canvas propio que no sale de la tarjeta (antes caía sobre toda
  // la pantalla y tapaba otras tarjetas). Respeta "reducir movimiento".
  useEffect(() => {
    if (!nuevos.length || !lienzo.current) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const estilo = getComputedStyle(document.documentElement);
    const colores = ["--acento", "--exito", "--aviso"].map((v) => estilo.getPropertyValue(v).trim()).filter(Boolean);
    const lanzar = confetti.create(lienzo.current, { resize: true });
    lanzar({ particleCount: 60, spread: 90, startVelocity: 24, ticks: 140, origin: { x: 0.5, y: 0.9 }, colors: colores, disableForReducedMotion: true });
    return () => lanzar.reset();
  }, [nuevos.length]);

  if (!logros) return null;
  const { nivel, siguiente } = logros;

  return (
    <div className={estilos.tarjeta}>
      {nuevos.length > 0 && <canvas ref={lienzo} className={estilos.confeti} aria-hidden />}
      <AnimatePresence>
        {nuevos.length > 0 && (
          <motion.div className={estilos.nuevos} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <strong>¡Lo ganaste!</strong>
            {/* Hasta 3 se nombran; si son más, solo la cantidad y el enlace a la página de insignias */}
            {nuevos.length > 3 ? (
              <Link to="/logros">{nuevos.length} insignias nuevas →</Link>
            ) : (
              nuevos.map((n) => (
                <span key={n.id}>
                  {n.icono} {n.titulo}
                </span>
              ))
            )}
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

// Filtros de la página de insignias. "Cerca": sin ganar pero con la mitad o más del camino hecho.
const FILTROS = [
  { id: "ganadas", texto: "Ganadas", pasa: (i) => i.ganada },
  { id: "cerca", texto: "Cerca", pasa: (i) => !i.ganada && i.meta > 0 && i.actual / i.meta >= 0.5 },
  { id: "todas", texto: "Todas", pasa: () => true },
];

export function PaginaLogros() {
  const [logros, setLogros] = useState(null);
  const [filtro, setFiltro] = useState("todas");
  const [abierta, setAbierta] = useState(null); // insignia bloqueada cuya descripción se está viendo
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
      <div className={estilos.filtros} role="group" aria-label="Qué insignias ver">
        {FILTROS.map((f) => (
          <button key={f.id} type="button" data-activa={filtro === f.id} aria-pressed={filtro === f.id} onClick={() => setFiltro(f.id)}>
            {f.texto} <span>{logros.insignias.filter(f.pasa).length}</span>
          </button>
        ))}
      </div>
      <div className={estilos.rejilla}>
        {logros.insignias.filter(FILTROS.find((f) => f.id === filtro).pasa).map((i) => {
          const contenido = (
            <>
              <span className={estilos.icono} aria-hidden>
                {i.icono}
              </span>
              <strong>{i.titulo}</strong>
              {/* En las bloqueadas la descripción solo sale al tocarlas (y en el title) */}
              {(i.ganada || abierta === i.id) && <small>{i.descripcion}</small>}
              {!i.ganada && i.meta > 1 && (
                <div className={estilos.barra} title={`${i.actual} de ${i.meta}`}>
                  <i style={{ width: `${(i.actual / i.meta) * 100}%` }} />
                </div>
              )}
            </>
          );
          return i.ganada ? (
            <div key={i.id} className={estilos.insignia} data-ganada="true">
              {contenido}
            </div>
          ) : (
            <button
              key={i.id}
              type="button"
              className={estilos.insignia}
              data-ganada="false"
              title={i.descripcion}
              aria-expanded={abierta === i.id}
              onClick={() => setAbierta(abierta === i.id ? null : i.id)}
            >
              {contenido}
            </button>
          );
        })}
      </div>
      {filtro !== "todas" && !logros.insignias.some(FILTROS.find((f) => f.id === filtro).pasa) && (
        <p className={estilos.vacio}>{filtro === "ganadas" ? "Todavía no ganas ninguna." : "Ninguna a medio camino todavía."}</p>
      )}
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
