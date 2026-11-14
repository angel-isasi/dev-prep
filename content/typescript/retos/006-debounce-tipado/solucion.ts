// La función que devuelve debounce: acepta los MISMOS argumentos que `fn`
// y además tiene un método para cancelar la llamada pendiente.
export type Debounced<F extends (...args: any[]) => void> = ((...args: Parameters<F>) => void) & {
  cancelar: () => void;
};

export function debounce<F extends (...args: any[]) => void>(fn: F, ms: number): Debounced<F> {
  // ReturnType<typeof setTimeout>: sirve tanto en el navegador (number) como en Node (Timeout).
  let temporizador: ReturnType<typeof setTimeout> | undefined;

  const debounced = (...args: Parameters<F>) => {
    clearTimeout(temporizador); // cada llamada reinicia la espera
    temporizador = setTimeout(() => {
      temporizador = undefined;
      fn(...args); // se llama con los argumentos de la ÚLTIMA llamada
    }, ms);
  };

  debounced.cancelar = () => {
    clearTimeout(temporizador);
    temporizador = undefined;
  };

  return debounced;
}
