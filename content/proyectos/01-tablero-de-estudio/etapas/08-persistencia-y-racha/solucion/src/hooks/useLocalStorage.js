import { useEffect, useState } from "react";

function readStored(key, initialValue) {
  try {
    const saved = localStorage.getItem(key);
    return saved === null ? initialValue : JSON.parse(saved);
  } catch {
    // JSON roto o localStorage bloqueado (modo privado): seguimos con el valor inicial
    return initialValue;
  }
}

/** Como useState, pero recuerda el valor en localStorage (como JSON). */
export function useLocalStorage(key, initialValue) {
  // Función en useState: se lee el almacenamiento una sola vez, al montar
  const [value, setValue] = useState(() => readStored(key, initialValue));

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Sin espacio o bloqueado: la app sigue funcionando, solo no recuerda
    }
  }, [key, value]);

  return [value, setValue];
}
