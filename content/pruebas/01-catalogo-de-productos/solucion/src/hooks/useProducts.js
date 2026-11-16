// Hook que pide los productos a la API y expone el estado de la petición.
import { useCallback, useEffect, useState } from "react";
import { fetchProducts } from "../api.js";

/**
 * @returns {{ status: "loading" | "error" | "success", products: Array, retry: () => void }}
 */
export function useProducts() {
  const [state, setState] = useState({ status: "loading", products: [] });
  // Cada reintento cambia este número y eso vuelve a ejecutar el efecto.
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    // Si el componente se desmonta (o se reintenta) antes de la respuesta,
    // ignoramos la respuesta vieja para no pisar el estado nuevo.
    let ignore = false;

    fetchProducts()
      .then((products) => {
        if (!ignore) setState({ status: "success", products });
      })
      .catch(() => {
        if (!ignore) setState({ status: "error", products: [] });
      });

    return () => {
      ignore = true;
    };
  }, [attempt]);

  const retry = useCallback(() => {
    setState({ status: "loading", products: [] });
    setAttempt((current) => current + 1);
  }, []);

  return { ...state, retry };
}
