import { useEffect, useState } from "react";
import { NavLink } from "react-router";
import { motion } from "motion/react";
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
} from "./Iconos.jsx";
import estilos from "./BarraLateral.module.css";

const SECCIONES = [
  { a: "/", texto: "Inicio", Icono: IconoInicio, exacto: true },
  { a: "/aprender", texto: "Aprender", Icono: IconoAprender },
  { a: "/practicar", texto: "Practicar", Icono: IconoPracticar },
  { a: "/entrevistas", texto: "Entrevistas", Icono: IconoEntrevistas },
  { a: "/progreso", texto: "Progreso", Icono: IconoProgreso },
  { a: "/referencia", texto: "Referencia", Icono: IconoReferencia },
  // Solo en la versión publicada: las lecciones estilo Duolingo y las chuletas
  ...(ES_MOVIL
    ? [
        { a: "/ingles", texto: "Inglés", Icono: IconoIngles },
        { a: "/trabajo", texto: "Trabajo", Icono: IconoTrabajo },
        { a: "/camino", texto: "Lecciones", Icono: IconoProgreso },
        { a: "/chuletas", texto: "Chuletas", Icono: IconoAprender },
      ]
    : []),
];

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
        {SECCIONES.map(({ a, texto, Icono, exacto }) => (
          <NavLink
            key={a}
            to={a}
            end={exacto}
            className={({ isActive }) =>
              `${estilos.enlace} ${isActive ? estilos.activo : ""}`
            }
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
      </nav>

      <div className={estilos.pie}>
        {racha && (
          <div
            className={estilos.racha}
            data-activa={racha.dias > 0}
            title={
              racha.cumplio
                ? "Meta de hoy cumplida"
                : "Aún no cumples la meta de hoy"
            }
          >
            <Llama encendida={racha.dias > 0} tamano={20} />
            <strong>{racha.dias}</strong>
            {racha.dias === 1 ? "día de racha" : "días de racha"}
          </div>
        )}
        <NavLink
          to="/ajustes"
          className={({ isActive }) =>
            `${estilos.enlace} ${isActive ? estilos.activo : ""}`
          }
        >
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
          <span>
            Tu progreso quedó guardado. Ya puedes cerrar esta pestaña.
          </span>
        </div>
      )}
    </aside>
  );
}
