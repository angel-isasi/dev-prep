import { useCallback } from "react";
import { useSearchParams } from "react-router";

/**
 * Pestaña activa guardada en la dirección (?pestana=simulacro). Así se puede enlazar directo a
 * una pestaña, recargar sin perderla y volver atrás con el navegador a la pantalla correcta.
 * La pestaña por defecto no se escribe en la dirección, para que quede limpia.
 * @param {string[]} validas ids de las pestañas
 * @param {string} [porDefecto] la que se muestra si la dirección no dice nada
 * @returns {[string, (id: string) => void]}
 */
export function usePestanaUrl(validas, porDefecto = validas[0], clave = "pestana") {
  const [params, setParams] = useSearchParams();
  const pedida = params.get(clave);
  const activa = validas.includes(pedida) ? pedida : porDefecto;

  const cambiar = useCallback(
    (id) =>
      setParams(
        (previos) => {
          const nuevos = new URLSearchParams(previos);
          if (id === porDefecto) nuevos.delete(clave);
          else nuevos.set(clave, id);
          return nuevos;
        },
        { replace: true },
      ),
    [setParams, porDefecto, clave],
  );

  return [activa, cambiar];
}
