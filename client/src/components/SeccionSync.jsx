// Ajustes de la laptop: estado de la sincronización con el celular y el QR para vincularlo.
import { useEffect, useState } from "react";
import { api } from "../lib/api.js";
import estilos from "./SeccionSync.module.css";

function haceCuanto(iso) {
  if (!iso) return "nunca";
  const minutos = Math.round((Date.now() - Date.parse(iso)) / 60000);
  if (minutos < 1) return "recién";
  if (minutos < 60) return `hace ${minutos} min`;
  return new Date(iso).toLocaleString("es-PE", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

export function SeccionSync() {
  const [estado, setEstado] = useState(null);
  const [ocupado, setOcupado] = useState(false);
  const [verQr, setVerQr] = useState(false);

  useEffect(() => {
    api.sync().then(setEstado, () => setEstado({ activa: false }));
  }, []);

  if (!estado) return null;

  async function ahora() {
    setOcupado(true);
    setEstado(await api.sincronizar().catch(() => estado));
    setOcupado(false);
  }

  return (
    <section className={estilos.seccion}>
      <h2>Sincronización con el celular</h2>
      {!estado.activa ? (
        <p className={estilos.ayuda}>
          No está configurada. Para activarla, corre <code>npm run aws:crear</code> en la carpeta del proyecto (usa tu AWS CLI) y
          reinicia dev-prep.
        </p>
      ) : (
        <>
          <p className={estilos.ayuda}>
            Tu progreso de la laptop y del celular se une solo cuando hay internet. Última vez:{" "}
            <strong>{haceCuanto(estado.ultima)}</strong>
            {estado.error && <span className={estilos.error}> · {estado.error}</span>}
          </p>
          {estado.dispositivos?.length > 0 && (
            <p className={estilos.ayuda}>Dispositivos: {estado.dispositivos.map((d) => d.dispositivo).join(", ")}</p>
          )}
          <div className={estilos.acciones}>
            <button type="button" className="boton" onClick={ahora} disabled={ocupado}>
              {ocupado ? "Sincronizando…" : "Sincronizar ahora"}
            </button>
            <button type="button" className="boton" onClick={() => setVerQr((v) => !v)}>
              {verQr ? "Ocultar el QR" : "Vincular el celular (QR)"}
            </button>
          </div>
          {verQr && (
            <div className={estilos.qr}>
              <img src="/api/sync/qr" alt="Código QR para vincular el celular" width="220" height="220" />
              <p>
                Escanéalo con la cámara del celular y ábrelo en Chrome: la app del celular queda vinculada. El QR lleva tu clave
                secreta: no lo compartas.
              </p>
            </div>
          )}
        </>
      )}
    </section>
  );
}
