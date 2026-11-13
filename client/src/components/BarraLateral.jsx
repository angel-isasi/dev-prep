import { useEffect, useState } from "react";
import { NavLink } from "react-router";
import { api } from "../lib/api.js";
import { useEvento } from "../hooks/useEvento.js";
import { Confirmar } from "./Confirmar.jsx";
import { useTema } from "../hooks/useTema.js";
import {
  IconoAjustes,
  IconoApagar,
  IconoFuego,
  IconoInicio,
  IconoAprender,
  IconoReferencia,
  IconoEntrevistas,
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
];

export function BarraLateral() {
  const { tema, alternar } = useTema();
  const [racha, setRacha] = useState(null);
  const [cerrada, setCerrada] = useState(false);

  async function cerrarApp() {
    await api.apagar().catch(() => {});
    setCerrada(true);
  }

  // La racha siempre a la vista; se actualiza cuando resuelves o repasas algo.
  const cargarRacha = () => api.inicio().then((d) => setRacha({ dias: d.racha, cumplio: d.meta.cumplio }), () => {});
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
            className={({ isActive }) => `${estilos.enlace} ${isActive ? estilos.activo : ""}`}
          >
            <Icono />
            {texto}
          </NavLink>
        ))}
      </nav>

      <div className={estilos.pie}>
        {racha && (
          <div className={estilos.racha} data-activa={racha.dias > 0} title={racha.cumplio ? "Meta de hoy cumplida" : "Aún no cumples la meta de hoy"}>
            <IconoFuego />
            <strong>{racha.dias}</strong>
            {racha.dias === 1 ? "día de racha" : "días de racha"}
          </div>
        )}
        <NavLink to="/ajustes" className={({ isActive }) => `${estilos.enlace} ${isActive ? estilos.activo : ""}`}>
          <IconoAjustes />
          Ajustes
        </NavLink>
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
