// Un pedido a la IA con su estado de carga y su error, para no repetir lo mismo en cada componente.
import { useState } from "react";
import { pedirIa } from "../../lib/ia.js";

/** @param {() => void} [alOlvidarClave] si la contraseña es incorrecta, PuertaIa la vuelve a pedir */
export function useIa(alOlvidarClave) {
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  /** @returns {Promise<object|null>} el resultado, o null si falló (el error queda en `error`) */
  async function pedir(pedido) {
    setCargando(true);
    setError(null);
    try {
      return await pedirIa(pedido);
    } catch (e) {
      if (e.clave) alOlvidarClave?.();
      setError(e.message);
      return null;
    } finally {
      setCargando(false);
    }
  }

  return { cargando, error, pedir, setError };
}
