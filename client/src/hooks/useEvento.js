import { useEffect, useRef } from "react";
import { escuchar } from "../lib/eventos.js";

/** Ejecuta `callback` cada vez que el servidor envía un evento de ese tipo. */
export function useEvento(tipo, callback) {
  // Guardamos la última versión del callback en una ref para no volver a
  // suscribirnos en cada render.
  const ref = useRef(callback);
  ref.current = callback;

  useEffect(() => escuchar(tipo, (datos) => ref.current(datos)), [tipo]);
}
