// Hook que pide los productos a la API y expone el estado de la petición.
import { fetchProducts } from "../api.js";

/**
 * @returns {{ status: "loading" | "error" | "success", products: Array, retry: () => void }}
 */
export function useProducts() {
  // TODO: guarda el estado de la petición (status, products).
  // TODO: pide los productos con fetchProducts() dentro de un useEffect.
  //       Pista: si el componente se desmonta antes de que llegue la respuesta,
  //       no actualices el estado (usa una variable "ignore" en la limpieza del efecto).
  // TODO: retry() vuelve a mostrar "loading" y repite la petición.
  void fetchProducts;
  return { status: "loading", products: [], retry: () => {} };
}
