// Panel del código de invitado (solo lo ves tú, en Ajustes > Dispositivos).
//
// El código y su API key viven en Vercel (DEVPREP_IA_INVITADO y ANTHROPIC_API_KEY_INVITADO). La app
// le pregunta al servidor quién eres con tu contraseña de IA: si eres el dueño, te devuelve el código
// para que lo copies y lo compartas. El tope de gasto del invitado lo pone la consola de la API (su
// espacio de trabajo), así que aquí no hay nada que se pueda saltar.
import { useEffect, useState } from "react";
import { quienSoyIa } from "../lib/ia.js";
import seccion from "./SeccionSync.module.css";
import estilos from "./PanelInvitado.module.css";

const CONSOLA = "https://console.anthropic.com/settings/limits";

export function PanelInvitado() {
  const [yo, setYo] = useState(null);
  const [visible, setVisible] = useState(false);
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    quienSoyIa().then(setYo);
  }, []);

  // Solo el dueño ve este panel (los invitados y quien no tiene contraseña, no)
  if (yo?.rol !== "dueno") return null;

  async function copiar() {
    await navigator.clipboard?.writeText(yo.invitado.codigo).catch(() => {});
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  return (
    <section className={seccion.seccion}>
      <h2>IA para invitados</h2>
      {yo.invitado ? (
        <>
          <p className={seccion.ayuda}>Comparte este código con quien quieras invitar. Lo escribe donde la app pide el código de acceso.</p>
          <div className={estilos.fila}>
            <code className={estilos.codigo}>{visible ? yo.invitado.codigo : "•".repeat(16)}</code>
            <button type="button" className="boton" onClick={() => setVisible((v) => !v)}>
              {visible ? "Ocultar" : "Mostrar"}
            </button>
            <button type="button" className="boton" onClick={copiar}>
              {copiado ? "Copiado" : "Copiar"}
            </button>
          </div>
          <details className={estilos.detalle}>
            <summary>Tope, gasto y cómo cortar el acceso</summary>
            <ul>
              <li>Su tope y su gasto están en la consola de la API, en el espacio de trabajo del invitado.</li>
              <li>Para cortar el acceso al instante: desactiva su API key en la consola.</li>
              <li>Para cambiar el código: cambia DEVPREP_IA_INVITADO en Vercel y vuelve a desplegar.</li>
            </ul>
            <a href={CONSOLA} target="_blank" rel="noreferrer">
              Abrir la consola ↗
            </a>
          </details>
        </>
      ) : (
        <p className={seccion.ayuda}>Todavía no hay código de invitado. Se activa con DEVPREP_IA_INVITADO y ANTHROPIC_API_KEY_INVITADO en Vercel (pasos en docs/ia.md).</p>
      )}
    </section>
  );
}
