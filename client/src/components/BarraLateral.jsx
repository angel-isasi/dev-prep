import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router";
import { AnimatePresence, motion } from "motion/react";
import { Llama } from "./Llama.jsx";
import { api } from "../lib/api.js";
import { useEvento } from "../hooks/useEvento.js";
import { Confirmar } from "./Confirmar.jsx";
import { useTema } from "../hooks/useTema.js";
import { ES_MOVIL } from "../lib/modo.js";
import {
  IconoAjustes,
  IconoApagar,
  IconoInicio,
  IconoAprender,
  IconoReferencia,
  IconoEntrevistas,
  IconoIngles,
  IconoTrabajo,
  IconoLuna,
  IconoPracticar,
  IconoProgreso,
  IconoSol,
  IconoChevron,
  IconoDiario,
  IconoEnfoque,
  IconoGit,
  IconoGlosario,
  IconoInsignias,
  IconoLecciones,
  IconoRevision,
  IconoChuleta,
} from "./Iconos.jsx";
import estilos from "./BarraLateral.module.css";

/**
 * Las secciones de la barra, en grupos para que no se vea recargada. Los grupos con
 * `plegable` se abren y cierran (y recuerdan cómo los dejaste); se abren solos si estás
 * en una de sus pantallas. Lo marcado con `web` solo existe en la versión publicada.
 */
const GRUPOS = [
  { id: "inicio", secciones: [{ a: "/", texto: "Inicio", Icono: IconoInicio, exacto: true }] },
  {
    id: "estudiar",
    titulo: "Estudiar",
    secciones: [
      { a: "/aprender", texto: "Aprender", Icono: IconoAprender },
      { a: "/camino", texto: "Lecciones", Icono: IconoLecciones, web: true },
      { a: "/practicar", texto: "Practicar", Icono: IconoPracticar },
      { a: "/ingles", texto: "Inglés", Icono: IconoIngles, web: true },
      { a: "/chuletas", texto: "Chuletas", Icono: IconoChuleta, web: true },
      { a: "/referencia", texto: "Referencia", Icono: IconoReferencia },
    ],
  },
  {
    id: "trabajo",
    titulo: "Conseguir trabajo",
    secciones: [
      { a: "/entrevistas", texto: "Entrevistas", Icono: IconoEntrevistas },
      { a: "/trabajo", texto: "Trabajo", Icono: IconoTrabajo, web: true },
    ],
  },
  {
    id: "herramientas",
    titulo: "Herramientas",
    plegable: true,
    secciones: [
      { a: "/glosario", texto: "Glosario", Icono: IconoGlosario, web: true },
      { a: "/revision", texto: "Revisión de código", Icono: IconoRevision, web: true },
      { a: "/git", texto: "Git práctico", Icono: IconoGit, web: true },
      { a: "/enfoque", texto: "Modo enfoque", Icono: IconoEnfoque, web: true },
    ],
  },
  {
    id: "tu",
    titulo: "Tú",
    plegable: true,
    secciones: [
      { a: "/progreso", texto: "Progreso", Icono: IconoProgreso },
      { a: "/logros", texto: "Insignias", Icono: IconoInsignias, web: true },
      { a: "/diario", texto: "Diario", Icono: IconoDiario, web: true },
    ],
  },
]
  .map((g) => ({ ...g, secciones: g.secciones.filter((s) => ES_MOVIL || !s.web) }))
  .filter((g) => g.secciones.length > 0);

const CLAVE_GRUPOS = "devprep-barra-grupos";
const leerAbiertos = () => {
  try {
    return JSON.parse(localStorage.getItem(CLAVE_GRUPOS) ?? "{}");
  } catch {
    return {};
  }
};
const estaEn = (pathname, a, exacto) => (exacto ? pathname === a : pathname === a || pathname.startsWith(`${a}/`));

// Fondo del enlace activo. Todos comparten layoutId: al cambiar de sección, Motion
// lo desliza desde el enlace anterior hasta el nuevo en lugar de saltar.
const Indicador = () => (
  <motion.span
    layoutId="indicador-seccion"
    className={estilos.indicador}
    transition={{ type: "spring", stiffness: 420, damping: 34 }}
    aria-hidden
  />
);

export function BarraLateral() {
  const { tema, alternar } = useTema();
  const [racha, setRacha] = useState(null);
  const [cerrada, setCerrada] = useState(false);
  const { pathname } = useLocation();
  const [abiertos, setAbiertos] = useState(leerAbiertos);
  const alternarGrupo = (id) =>
    setAbiertos((v) => {
      const nuevo = { ...v, [id]: !v[id] };
      localStorage.setItem(CLAVE_GRUPOS, JSON.stringify(nuevo));
      return nuevo;
    });

  async function cerrarApp() {
    await api.apagar().catch(() => {});
    setCerrada(true);
  }

  // La racha siempre a la vista; se actualiza cuando resuelves o repasas algo.
  const cargarRacha = () =>
    api.inicio().then(
      (d) => setRacha({ dias: d.racha, cumplio: d.meta.cumplio }),
      () => {},
    );
  useEffect(() => {
    cargarRacha();
  }, []);
  useEvento("resultado", (d) => {
    if (d.resueltoAhora || d.repasoCompletado) cargarRacha();
  });

  return (
    <aside className={estilos.barra}>
      <div className={estilos.marca}>
        <span className={estilos.logo} aria-hidden>
          {"</>"}
        </span>
        dev-prep
      </div>

      <nav className={estilos.nav} aria-label="Secciones">
        {GRUPOS.map((g) => {
          const activoAqui = g.secciones.some((s) => estaEn(pathname, s.a, s.exacto));
          const abierto = !g.plegable || activoAqui || (abiertos[g.id] ?? false);
          return (
            <div key={g.id} className={estilos.grupo}>
              {g.titulo &&
                (g.plegable ? (
                  <button
                    type="button"
                    className={estilos.tituloGrupo}
                    aria-expanded={abierto}
                    disabled={activoAqui}
                    onClick={() => alternarGrupo(g.id)}
                  >
                    {g.titulo}
                    <span className={estilos.chevron} data-abierto={abierto}>
                      <IconoChevron />
                    </span>
                  </button>
                ) : (
                  <span className={estilos.tituloGrupo}>{g.titulo}</span>
                ))}
              <AnimatePresence initial={false}>
                {abierto && (
                  <motion.div
                    className={estilos.enlaces}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
                  >
                    {g.secciones.map(({ a, texto, Icono, exacto }) => (
                      <NavLink
                        key={a}
                        to={a}
                        end={exacto}
                        viewTransition
                        className={({ isActive }) => `${estilos.enlace} ${isActive ? estilos.activo : ""}`}
                      >
                        {({ isActive }) => (
                          <>
                            {isActive && <Indicador />}
                            <Icono />
                            {texto}
                          </>
                        )}
                      </NavLink>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </nav>

      <div className={estilos.pie}>
        {racha && (
          <div
            className={estilos.racha}
            data-activa={racha.dias > 0}
            title={racha.cumplio ? "Meta de hoy cumplida" : "Aún no cumples la meta de hoy"}
          >
            <Llama encendida={racha.dias > 0} tamano={20} />
            <strong>{racha.dias}</strong>
            {racha.dias === 1 ? "día de racha" : "días de racha"}
          </div>
        )}
        <NavLink to="/ajustes" viewTransition className={({ isActive }) => `${estilos.enlace} ${isActive ? estilos.activo : ""}`}>
          {({ isActive }) => (
            <>
              {isActive && <Indicador />}
              <IconoAjustes />
              Ajustes
            </>
          )}
        </NavLink>
        {/* En la versión publicada no hay servidor que apagar */}
        {!ES_MOVIL && (
          <Confirmar
            titulo="¿Cerrar dev-prep?"
            descripcion="Se apaga el servidor de la app. Tu progreso ya está guardado. Para volver a abrirla, usa el acceso directo del escritorio."
            textoConfirmar="Cerrar dev-prep"
            alConfirmar={cerrarApp}
            disparador={
              <button type="button" className={estilos.tema}>
                <IconoApagar />
                Cerrar dev-prep
              </button>
            }
          />
        )}
        <button type="button" className={estilos.tema} onClick={alternar}>
          {tema === "oscuro" ? <IconoSol /> : <IconoLuna />}
          {tema === "oscuro" ? "Modo claro" : "Modo oscuro"}
        </button>
      </div>
      {cerrada && (
        <div className={estilos.cerrada} role="status">
          <strong>dev-prep está cerrado</strong>
          <span>Tu progreso quedó guardado. Ya puedes cerrar esta pestaña.</span>
        </div>
      )}
    </aside>
  );
}
