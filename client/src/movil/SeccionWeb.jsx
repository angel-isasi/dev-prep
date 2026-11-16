// Ajustes de la versión publicada en pantalla grande: va al final del mismo Ajustes de la laptop,
// en lugar de la sección del QR (que solo tiene sentido en la laptop con su servidor).
import { useEffect, useRef, useState } from "react";
import { api } from "../lib/api.js";
import { desvincular, leerVinculo, sincronizar } from "../lib/sync-movil.js";
import estilos from "../components/SeccionSync.module.css";

const fecha = (iso) => new Date(iso).toLocaleString("es-PE", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

/** Borra el service worker y la caché, y recarga: descarga todo de nuevo (requiere internet). */
async function forzarActualizacion() {
  for (const r of (await navigator.serviceWorker?.getRegistrations?.()) ?? []) await r.unregister();
  for (const c of (await globalThis.caches?.keys?.()) ?? []) await caches.delete(c);
  location.reload();
}

export function SeccionWeb() {
  const [vinculo, setVinculo] = useState(leerVinculo);
  const [version, setVersion] = useState(null);
  const [aviso, setAviso] = useState(null);
  const archivo = useRef(null);

  useEffect(() => {
    api.version().then(setVersion, () => {});
  }, []);

  function descargar() {
    const blob = new Blob([api.exportarProgreso()], { type: "application/json" });
    const enlace = document.createElement("a");
    enlace.href = URL.createObjectURL(blob);
    enlace.download = `dev-prep-respaldo-${new Date().toISOString().slice(0, 10)}.json`;
    enlace.click();
    URL.revokeObjectURL(enlace.href);
  }

  async function restaurar(evento) {
    const elegido = evento.target.files?.[0];
    evento.target.value = "";
    if (!elegido) return;
    try {
      await api.importarProgreso(await elegido.text());
      setAviso("Respaldo restaurado.");
    } catch (e) {
      setAviso(`No se pudo restaurar: ${e.message}`);
    }
  }

  return (
    <>
      <section className={estilos.seccion}>
        <h2>Sincronización</h2>
        {vinculo ? (
          <>
            <p className={estilos.ayuda}>
              Vinculado: tu progreso se une con la laptop cuando hay internet. Última vez:{" "}
              <strong>{vinculo.ultima ? fecha(vinculo.ultima) : "todavía no"}</strong>
              {vinculo.error && <span className={estilos.error}> · {vinculo.error}</span>}
            </p>
            <div className={estilos.acciones}>
              <button type="button" className="boton" onClick={async () => setVinculo(await sincronizar())}>
                Sincronizar ahora
              </button>
              <button
                type="button"
                className="boton boton-fantasma"
                onClick={() => {
                  desvincular();
                  setVinculo(null);
                }}
              >
                Desvincular
              </button>
            </div>
          </>
        ) : (
          <p className={estilos.ayuda}>
            Para unir este navegador con tu laptop: abre la app de la laptop (el acceso directo del escritorio), ve a Ajustes y toca
            "Vincular la versión web". Se abre esta página ya vinculada. En el celular, escanea el QR de "Vincular el celular (QR)".
          </p>
        )}
      </section>

      <section className={estilos.seccion}>
        <h2>Tu progreso en este navegador</h2>
        <p className={estilos.ayuda}>
          Se guarda en este navegador y no se pierde al apagar la computadora. Si borras los datos de navegación, lo recuperas
          sincronizando o con un respaldo.
        </p>
        <div className={estilos.acciones}>
          <button type="button" className="boton" onClick={descargar}>
            Descargar respaldo
          </button>
          <button type="button" className="boton" onClick={() => archivo.current?.click()}>
            Restaurar respaldo
          </button>
          <input ref={archivo} type="file" accept="application/json,.json" hidden onChange={restaurar} />
        </div>
        {aviso && <p className={estilos.ayuda}>{aviso}</p>}
      </section>

      <section className={estilos.seccion}>
        <h2>Contenido</h2>
        {version && (
          <p className={estilos.ayuda}>
            {version.ejercicios} ejercicios, {version.temas} temas, {version.entradas} entradas de Referencia y {version.preguntas}{" "}
            preguntas. Versión {version.huella}.
          </p>
        )}
        <div className={estilos.acciones}>
          <button type="button" className="boton" onClick={forzarActualizacion}>
            Forzar actualización
          </button>
        </div>
      </section>
    </>
  );
}
