// Ajustes: avisos diarios en este dispositivo (celular o Chrome de la laptop), con hora fija opcional.
import { useEffect, useState } from "react";
import { api } from "../lib/api.js";
import { activarAvisos, desactivarAvisos, estadoAvisos, probarAvisos } from "../lib/avisos-push.js";
import estilos from "./SeccionSync.module.css";

const TEXTOS = {
  "no-disponible": "Este navegador no permite avisos. En el celular, instala la app desde Chrome; en la laptop, usa Chrome.",
  "sin-vinculo": "Para recibir avisos, primero vincula este dispositivo (en la laptop: Ajustes, Vincular el celular o la versión web).",
  bloqueado: "Bloqueaste los avisos para esta página. Actívalos en la configuración del sitio en Chrome (ícono a la izquierda de la dirección).",
  activos: "Activos en este dispositivo. Te aviso a tu hora habitual si no estudiaste, a las 21:00 si tu racha está en riesgo, el sábado con el examen y el domingo con tu resumen. Máximo 2 al día.",
  apagados: "Apagados en este dispositivo.",
};

export function SeccionAvisos() {
  const [estado, setEstado] = useState(null);
  const [aviso, setAviso] = useState(null);
  const [ocupado, setOcupado] = useState(false);
  const [hora, setHora] = useState("");

  const cargar = () => estadoAvisos().then(setEstado, () => setEstado("no-disponible"));
  useEffect(() => {
    cargar();
    api.rutina?.().then(() => {}, () => {});
  }, []);
  if (!estado) return null;

  async function hacer(accion, exito) {
    setOcupado(true);
    setAviso(null);
    try {
      await accion();
      setAviso(exito);
    } catch (e) {
      setAviso(e.message);
    }
    setOcupado(false);
    cargar();
  }

  return (
    <section className={estilos.seccion}>
      <h2>Avisos</h2>
      <p className={estilos.ayuda}>{TEXTOS[estado]}</p>
      <div className={estilos.acciones}>
        {estado === "apagados" && (
          <button type="button" className="boton boton-primario" disabled={ocupado} onClick={() => hacer(activarAvisos, "Avisos activados. Te mandé uno de prueba.").then(() => probarAvisos().catch(() => {}))}>
            Activar avisos en este dispositivo
          </button>
        )}
        {estado === "activos" && (
          <>
            <button type="button" className="boton" disabled={ocupado} onClick={() => hacer(probarAvisos, "Aviso de prueba enviado.")}>
              Mandar uno de prueba
            </button>
            <button type="button" className="boton boton-fantasma" disabled={ocupado} onClick={() => hacer(desactivarAvisos, "Avisos apagados en este dispositivo.")}>
              Apagar
            </button>
          </>
        )}
      </div>
      {estado === "activos" && api.guardarAvisos && (
        <div className={estilos.acciones}>
          <label className={estilos.ayuda}>
            Hora fija del recordatorio (si la dejas vacía, uso tu hora habitual){" "}
            <input type="time" step="3600" value={hora} onChange={(e) => setHora(e.target.value)} />
          </label>
          <button type="button" className="boton" onClick={() => api.guardarAvisos({ hora: hora || null }).then(() => setAviso("Hora guardada."))}>
            Guardar hora
          </button>
        </div>
      )}
      {aviso && <p className={estilos.ayuda}>{aviso}</p>}
    </section>
  );
}
