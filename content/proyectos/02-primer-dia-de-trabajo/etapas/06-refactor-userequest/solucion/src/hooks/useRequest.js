import { useCallback, useEffect, useState } from "react";

/**
 * Carga datos de la API al montarse y maneja los estados de la petición.
 *
 *   const { data: orders, setData: setOrders, status, reload } = useRequest(getOrders, []);
 *
 * - `request`: función que devuelve una promesa (por ejemplo, las de api.js). Pasa una función
 *   estable: si creas una flecha nueva en cada render, el efecto se repite sin fin.
 * - `initialData`: lo que vale `data` antes de que llegue la respuesta.
 *
 * Devuelve `data`, `setData` (para actualizar los datos después de un cambio), `status`
 * ("loading" | "error" | "ready") y `reload()` para volver a pedir (el botón "Reintentar").
 */
export function useRequest(request, initialData) {
  const [data, setData] = useState(initialData);
  const [status, setStatus] = useState("loading");

  const reload = useCallback(async () => {
    setStatus("loading");
    try {
      setData(await request());
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, [request]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { data, setData, status, reload };
}
