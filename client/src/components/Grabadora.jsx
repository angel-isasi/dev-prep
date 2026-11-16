// Grabadora de voz: te grabas respondiendo (simulacro, pitch, inglés) y te escuchas.
// Los audios quedan SOLO en este dispositivo (IndexedDB, los últimos 20) y nunca se suben a ningún lado.
import { useEffect, useRef, useState } from "react";
import { useAhora } from "../hooks/useAhora.js";
import estilos from "./Grabadora.module.css";

const BASE = "devprep-audios";
const MAX_AUDIOS = 20;

function abrir() {
  return new Promise((resolver, rechazar) => {
    const pedido = indexedDB.open(BASE, 1);
    pedido.onupgradeneeded = () => pedido.result.createObjectStore("audios", { keyPath: "id" });
    pedido.onsuccess = () => resolver(pedido.result);
    pedido.onerror = () => rechazar(pedido.error);
  });
}

async function operar(modo, accion) {
  const db = await abrir();
  return new Promise((resolver, rechazar) => {
    const tx = db.transaction("audios", modo);
    const pedido = accion(tx.objectStore("audios"));
    tx.oncomplete = () => resolver(pedido?.result);
    tx.onerror = () => rechazar(tx.error);
  });
}

/** Guarda un audio y borra los más viejos si hay más de 20. */
async function guardarAudio(clave, blob, segundos) {
  const todos = (await operar("readonly", (s) => s.getAll())) ?? [];
  const sobran = todos.sort((a, b) => a.en - b.en).slice(0, Math.max(0, todos.length - MAX_AUDIOS + 1));
  await operar("readwrite", (s) => {
    for (const a of sobran) s.delete(a.id);
    return s.put({ id: `${clave}:${Date.now()}`, clave, blob, segundos, en: Date.now() });
  });
}

const ultimoAudio = async (clave) =>
  ((await operar("readonly", (s) => s.getAll())) ?? []).filter((a) => a.clave === clave).sort((a, b) => b.en - a.en)[0] ?? null;

const formato = () => ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg"].find((t) => globalThis.MediaRecorder?.isTypeSupported?.(t)) ?? "";

/**
 * @param {{ clave: string, maxSegundos?: number, texto?: string }} props
 *   clave: a qué pertenece la grabación (por ejemplo "pitch" o "sim:ent-004"); se guarda la última.
 */
export function Grabadora({ clave, maxSegundos = 120, texto = "Grabar mi respuesta" }) {
  const [estado, setEstado] = useState("listo"); // listo | grabando | error
  const [audio, setAudio] = useState(null); // { url, segundos }
  const [error, setError] = useState(null);
  const grabador = useRef(null);
  const inicio = useRef(0);
  const ahora = useAhora(estado === "grabando" ? 250 : 60_000);
  const segundos = estado === "grabando" ? Math.floor((ahora - inicio.current) / 1000) : 0;

  useEffect(() => {
    let url = null;
    ultimoAudio(clave)
      .then((a) => {
        if (!a) return setAudio(null);
        url = URL.createObjectURL(a.blob);
        setAudio({ url, segundos: a.segundos });
      })
      .catch(() => {});
    return () => url && URL.revokeObjectURL(url);
  }, [clave]);

  useEffect(() => {
    if (estado === "grabando" && segundos >= maxSegundos) detener();
  }, [segundos, estado, maxSegundos]);

  if (!globalThis.MediaRecorder || !navigator.mediaDevices?.getUserMedia) return null;

  async function grabar() {
    setError(null);
    try {
      const flujo = await navigator.mediaDevices.getUserMedia({ audio: true });
      const tipo = formato();
      const r = new MediaRecorder(flujo, tipo ? { mimeType: tipo } : undefined);
      const partes = [];
      r.ondataavailable = (e) => e.data.size && partes.push(e.data);
      r.onstop = async () => {
        flujo.getTracks().forEach((t) => t.stop());
        const blob = new Blob(partes, { type: r.mimeType || tipo || "audio/webm" });
        const dur = Math.round((Date.now() - inicio.current) / 1000);
        await guardarAudio(clave, blob, dur).catch(() => {});
        setAudio((previo) => {
          if (previo?.url) URL.revokeObjectURL(previo.url);
          return { url: URL.createObjectURL(blob), segundos: dur };
        });
        setEstado("listo");
      };
      grabador.current = r;
      inicio.current = Date.now();
      r.start();
      setEstado("grabando");
    } catch (e) {
      setEstado("listo");
      setError(e.name === "NotAllowedError" ? "No diste permiso al micrófono. Actívalo en la configuración del sitio en Chrome." : "No se pudo usar el micrófono.");
    }
  }

  function detener() {
    if (grabador.current?.state === "recording") grabador.current.stop();
  }

  return (
    <div className={estilos.grabadora} data-grabando={estado === "grabando"}>
      {estado === "grabando" ? (
        <button type="button" className="boton boton-primario" onClick={detener}>
          ■ Detener ({segundos}s / {maxSegundos}s)
        </button>
      ) : (
        <button type="button" className="boton" onClick={grabar}>
          🎙 {audio ? "Grabar de nuevo" : texto}
        </button>
      )}
      {audio && estado !== "grabando" && (
        <div className={estilos.reproductor}>
          <audio src={audio.url} controls preload="metadata" />
          <small>{audio.segundos}s · se guarda solo en este dispositivo</small>
        </div>
      )}
      {error && <small className={estilos.error}>{error}</small>}
    </div>
  );
}
