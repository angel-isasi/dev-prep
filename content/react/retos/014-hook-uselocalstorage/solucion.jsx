import { useEffect, useState } from "react";

export function useLocalStorage(clave, inicial) {
  // Inicialización perezosa: la función solo se ejecuta en el primer render.
  const [valor, setValor] = useState(() => {
    try {
      const guardado = localStorage.getItem(clave);
      return guardado !== null ? JSON.parse(guardado) : inicial;
    } catch {
      // JSON corrupto o localStorage no disponible
      return inicial;
    }
  });

  // Cada vez que cambia el valor (o la clave), lo guardamos.
  useEffect(() => {
    try {
      localStorage.setItem(clave, JSON.stringify(valor));
    } catch {
      // Modo privado o almacenamiento lleno: seguimos funcionando en memoria.
    }
  }, [clave, valor]);

  return [valor, setValor];
}
