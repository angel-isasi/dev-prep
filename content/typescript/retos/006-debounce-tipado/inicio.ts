// debounce tipado
//
// debounce(fn, ms) devuelve una función que espera `ms` milisegundos sin
// nuevas llamadas antes de ejecutar `fn` con los últimos argumentos.
// La función devuelta debe aceptar EXACTAMENTE los mismos argumentos que `fn`
// y tener un método `cancelar()`.
//
//   const buscarConEspera = debounce((texto: string) => buscar(texto), 300);
//   buscarConEspera("r"); buscarConEspera("re"); buscarConEspera("rea");
//   // 300 ms después: buscar("rea"), una sola vez
//
// Guarda el archivo (Ctrl + S) y mira el resultado de los tests en la app.

// Cambia `any[]` en la función devuelta por los parámetros de F.
export type Debounced<F extends (...args: any[]) => void> = ((...args: any[]) => void) & {
  cancelar: () => void;
};

export function debounce<F extends (...args: any[]) => void>(fn: F, ms: number): Debounced<F> {
  // Tu código aquí
  const debounced = (...args: any[]) => {};
  debounced.cancelar = () => {};
  return debounced;
}
