// Ajustes del celular: tus datos, tema, versión del contenido y respaldo del progreso.
// Tu progreso vive en este celular: el respaldo sirve para no perderlo si borras los datos.
import { useEffect, useRef, useState } from "react";
import { api } from "../lib/api.js";
import { desvincular, leerVinculo, sincronizar } from "../lib/sync-movil.js";
import { useTema } from "../hooks/useTema.js";
import { CabeceraPagina } from "../components/CabeceraPagina.jsx";
import { Esqueleto } from "../components/Esqueleto.jsx";
import { IconoDescargar, IconoLuna, IconoSol } from "../components/Iconos.jsx";
import estilos from "./AjustesMovil.module.css";

function fechaYHora(iso) {
  return new Date(iso).toLocaleString("es-PE", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

/** Borra el service worker y la caché, y recarga: descarga todo de nuevo (requiere internet). */
async function forzarActualizacion() {
  const registros = (await navigator.serviceWorker?.getRegistrations?.()) ?? [];
  await Promise.all(registros.map((r) => r.unregister()));
  const claves = (await globalThis.caches?.keys?.()) ?? [];
  await Promise.all(claves.map((c) => caches.delete(c)));
  location.reload();
}

export function AjustesMovil() {
  const { tema, alternar } = useTema();
  const [form, setForm] = useState(null);
  const [version, setVersion] = useState(null);
  const [persistente, setPersistente] = useState(null);
  const [aviso, setAviso] = useState(null);
  const [reportados, setReportados] = useState({});
  const [vinculo, setVinculo] = useState(leerVinculo);
  const archivo = useRef(null);

  useEffect(() => {
    api.config().then((c) => setForm({ nombre: c.nombre ?? "", objetivo: c.objetivo ?? "" }));
    api.version().then(setVersion, () => {});
    navigator.storage?.persisted?.().then(setPersistente, () => {});
    api.reportados().then(setReportados, () => {});
  }, []);

  if (!form) return <Esqueleto variante="texto" />;

  async function guardar(evento) {
    evento.preventDefault();
    await api.guardarConfig({ nombre: form.nombre.slice(0, 60), objetivo: form.objetivo.slice(0, 500) });
    setAviso({ tipo: "exito", texto: "Guardado." });
  }

  function exportar() {
    const blob = new Blob([api.exportarProgreso()], { type: "application/json" });
    const enlace = document.createElement("a");
    enlace.href = URL.createObjectURL(blob);
    enlace.download = `dev-prep-respaldo-${new Date().toISOString().slice(0, 10)}.json`;
    enlace.click();
    URL.revokeObjectURL(enlace.href);
  }

  async function importar(evento) {
    const elegido = evento.target.files?.[0];
    evento.target.value = "";
    if (!elegido) return;
    try {
      await api.importarProgreso(await elegido.text());
      setAviso({ tipo: "exito", texto: "Respaldo restaurado." });
    } catch (e) {
      setAviso({ tipo: "error", texto: `No se pudo restaurar: ${e.message}` });
    }
  }

  return (
    <section className={estilos.pagina}>
      <CabeceraPagina etiqueta="Tu configuración" titulo="Ajustes" />

      <form className={estilos.bloque} onSubmit={guardar}>
        <h2>Sobre ti</h2>
        <label>
          <span>Tu nombre</span>
          <input value={form.nombre} maxLength={60} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
        </label>
        <label>
          <span>Tu objetivo</span>
          <textarea
            rows={3}
            maxLength={500}
            placeholder="Conseguir mis prácticas como desarrollador frontend en marzo de 2027."
            value={form.objetivo}
            onChange={(e) => setForm({ ...form, objetivo: e.target.value })}
          />
        </label>
        <button type="submit" className={`boton boton-primario ${estilos.ancho}`}>
          Guardar
        </button>
      </form>

      <div className={estilos.bloque}>
        <h2>Apariencia</h2>
        <button type="button" className={`boton ${estilos.ancho}`} onClick={alternar}>
          {tema === "oscuro" ? <IconoSol /> : <IconoLuna />}
          {tema === "oscuro" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
        </button>
      </div>

      <div className={estilos.bloque}>
        <h2>Tu progreso</h2>
        <p className={estilos.ayuda}>
          Se guarda solo en este celular{persistente ? ", protegido para que Android no lo borre" : ""}. Haz un respaldo de vez
          en cuando: si borras los datos de la app, con el respaldo lo recuperas.
        </p>
        <div className={estilos.fila}>
          <button type="button" className="boton" onClick={exportar}>
            <IconoDescargar /> Descargar respaldo
          </button>
          <button type="button" className="boton" onClick={() => archivo.current?.click()}>
            Restaurar
          </button>
          <input ref={archivo} type="file" accept="application/json,.json" hidden onChange={importar} />
        </div>
      </div>

      <div className={estilos.bloque}>
        <h2>Sincronización con la laptop</h2>
        {vinculo ? (
          <>
            <p className={estilos.ayuda}>
              Vinculado. Última vez: {vinculo.ultima ? fechaYHora(vinculo.ultima) : "todavía no"}
              {vinculo.error ? ` · ${vinculo.error}` : ""}
            </p>
            <div className={estilos.fila}>
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
            Para unir tu progreso con el de la laptop: en la laptop ve a Ajustes, toca "Vincular el celular (QR)" y escanéalo
            con la cámara.
          </p>
        )}
      </div>

      {Object.keys(reportados).length > 0 && (
        <div className={estilos.bloque}>
          <h2>Preguntas reportadas</h2>
          <p className={estilos.ayuda}>Las marcaste como mal hechas y no salen en las lecciones. Si fue un error, restáuralas.</p>
          <ul className={estilos.reportados}>
            {Object.entries(reportados).map(([clave, fecha]) => (
              <li key={clave}>
                <code>{clave}</code>
                <small>{fecha}</small>
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
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className={estilos.bloque}>
        <h2>Contenido</h2>
        {version && (
          <p className={estilos.ayuda}>
            {version.ejercicios} ejercicios, {version.temas} temas, {version.entradas} entradas de Referencia y{" "}
            {version.preguntas} preguntas. Versión {version.huella}.
          </p>
        )}
        <button type="button" className={`boton ${estilos.ancho}`} onClick={forzarActualizacion}>
          Forzar actualización (necesita internet)
        </button>
      </div>

      {aviso && (
        <p className={estilos.aviso} data-tipo={aviso.tipo} role="status">
          {aviso.texto}
        </p>
      )}
    </section>
  );
}
