// Ajustes de la versión publicada en pantalla grande: va al final del mismo Ajustes de la laptop,
// en lugar de la sección del QR (que solo tiene sentido en la laptop con su servidor).
import { useEffect, useRef, useState } from "react";
import { api } from "../lib/api.js";
import { desvincular, leerVinculo, sincronizar } from "../lib/sync-movil.js";
import estilos from "../components/SeccionSync.module.css";
import propios from "./SeccionWeb.module.css";
import { SeccionRutina } from "../components/SeccionRutina.jsx";
import { SeccionAvisos } from "../components/SeccionAvisos.jsx";
import { SeccionLaptop } from "./SeccionLaptop.jsx";
import { Confirmar } from "../components/Confirmar.jsx";
import { usePantallaGrande } from "../hooks/usePantallaGrande.js";

const fecha = (iso) =>
  new Date(iso).toLocaleString("es-PE", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

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
  const [reportados, setReportados] = useState({});
  const archivo = useRef(null);
  const grande = usePantallaGrande();

  useEffect(() => {
    api.version().then(setVersion, () => {});
    api.reportados().then(setReportados, () => {});
  }, []);

  function descargar() {
    const blob = new Blob([api.exportarProgreso()], {
      type: "application/json",
    });
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
      {/* Conectar con el dev-prep de la laptop solo tiene sentido en una computadora */}
      {grande && <SeccionLaptop />}
      <SeccionAvisos />
      <SeccionRutina />

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
          <>
            <p className={estilos.ayuda}>Sin vincular: tu progreso vive solo en este navegador.</p>
            <details className={propios.como}>
              <summary>Cómo vincular</summary>
              <ol>
                <li>Abre dev-prep en tu laptop (el acceso directo del escritorio).</li>
                <li>Ve a Ajustes, pestaña Dispositivos.</li>
                <li>Toca "Vincular la versión web"; en el celular, escanea el QR de "Vincular el celular (QR)".</li>
              </ol>
            </details>
          </>
        )}
      </section>

      <section className={estilos.seccion}>
        <h2>Tu progreso en este navegador</h2>
        <p className={estilos.ayuda}>Se guarda en este navegador. Si borras sus datos, lo recuperas sincronizando o con un respaldo.</p>
        <div className={estilos.acciones}>
          <button type="button" className="boton" onClick={descargar}>
            Descargar respaldo
          </button>
          <button type="button" className="boton" onClick={() => archivo.current?.click()}>
            Restaurar respaldo
          </button>
          <input ref={archivo} type="file" accept="application/json,.json" hidden onChange={restaurar} />
        </div>
        <EmpezarDeCero />
        {aviso && <p className={estilos.ayuda}>{aviso}</p>}
      </section>

      {Object.keys(reportados).length > 0 && (
        <section className={estilos.seccion}>
          <h2>Preguntas reportadas</h2>
          <p className={estilos.ayuda}>Las marcaste como mal hechas y no salen en las lecciones. Si fue un error, restáuralas.</p>
          {Object.entries(reportados).map(([clave, fechaReporte]) => (
            <div key={clave} className={estilos.acciones}>
              <code>{clave}</code>
              <small>{fechaReporte}</small>
              <button
                type="button"
                className="boton boton-fantasma"
                onClick={async () => {
                  await api.quitarReporte(clave);
                  setReportados(await api.reportados());
                }}
              >
                Restaurar
              </button>
            </div>
          ))}
        </section>
      )}

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

/** Empezar de cero: borra tu progreso en todos tus dispositivos (en la laptop conectada, también el suyo). */
export function EmpezarDeCero() {
  return (
    <>
      <p className={estilos.ayuda}>
        <strong>Empezar de cero:</strong> borra tu progreso en todos tus dispositivos. No se puede deshacer.
      </p>
      <div className={estilos.acciones}>
        {/* El detalle de qué se borra y qué se queda va en el diálogo, que es donde se decide */}
        <Confirmar
          disparador={
            <button type="button" className="boton boton-peligro">
              Empezar de cero
            </button>
          }
          titulo="¿Empezar de cero?"
          descripcion="Se borra tu progreso en TODOS tus dispositivos: ejercicios, racha, repasos, tarjetas, lecciones, inglés, exámenes, simulacros, logros, postulaciones y diario. Se quedan tus ajustes, tu pitch, tus historias STAR y tu CV. Descarga un respaldo antes si quieres guardarlo. No se puede deshacer."
          textoConfirmar="Sí, borrar todo"
          peligro
          alConfirmar={async () => {
            await api.empezarDeCero();
            await sincronizar().catch(() => {});
            location.assign("/");
          }}
        />
      </div>
    </>
  );
}

/** El botón con su sección, para la web conectada a tu laptop (allí no sale "Tu progreso en este navegador"). */
export function SeccionEmpezarDeCero() {
  return (
    <section className={estilos.seccion}>
      <h2>Empezar de cero</h2>
      <EmpezarDeCero />
    </section>
  );
}
