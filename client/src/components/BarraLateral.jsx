import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router";
import { AnimatePresence, motion } from "motion/react";
import { Llama } from "./Llama.jsx";
import { api } from "../lib/api.js";
import { useEvento } from "../hooks/useEvento.js";
import { Confirmar } from "./Confirmar.jsx";
import { useTema } from "../hooks/useTema.js";
import { ES_MOVIL } from "../lib/modo.js";
import { IconoAjustes, IconoApagar, IconoEnfoque, IconoLuna, IconoReferencia, IconoSol } from "./Iconos.jsx";
import { SECCIONES, estaEnDestino, ubicar } from "../lib/navegacion.js";
import { abrirPaleta } from "../lib/paleta.js";
import estilos from "./BarraLateral.module.css";

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
  const actual = ubicar(pathname).seccion;

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

      {/* Buscador global: también se abre con Ctrl+K */}
      <button type="button" className={estilos.buscar} onClick={abrirPaleta}>
        <IconoReferencia />
        <span>Buscar</span>
        <kbd>Ctrl K</kbd>
      </button>

      <nav className={estilos.nav} aria-label="Secciones">
        {SECCIONES.map((s) => {
          const activa = actual?.id === s.id;
          const { a, texto, Icono, exacto } = s;
          return (
            <div key={s.id} className={estilos.grupo}>
              <NavLink to={a} end={exacto} viewTransition className={`${estilos.enlace} ${activa ? estilos.activo : ""}`}>
                {activa && <Indicador />}
                <Icono />
                {texto}
              </NavLink>
              {/* Los destinos de la sección se despliegan solo cuando estás en ella */}
              <AnimatePresence initial={false}>
                {activa && s.sub.length > 1 && (
                  <motion.div
                    className={estilos.subs}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
                  >
                    {s.sub.map((destino) => (
                      <NavLink
                        key={destino.a}
                        to={destino.a}
                        viewTransition
                        className={estilos.sub}
                        data-activo={estaEnDestino(pathname, destino)}
                        aria-current={estaEnDestino(pathname, destino) ? "page" : undefined}
                      >
                        {destino.texto}
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
        {/* El modo enfoque siempre a la mano (solo en la versión publicada) */}
        {ES_MOVIL && (
          <NavLink to="/enfoque" viewTransition className={({ isActive }) => `${estilos.enlace} ${isActive ? estilos.activo : ""}`}>
            {({ isActive }) => (
              <>
                {isActive && <Indicador />}
                <IconoEnfoque />
                Modo enfoque
              </>
            )}
          </NavLink>
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
