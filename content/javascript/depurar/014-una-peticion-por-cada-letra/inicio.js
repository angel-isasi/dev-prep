// Debounce
//
// Devuelve una versión de `fn` que espera `ms` milisegundos sin nuevas
// llamadas antes de ejecutarse. Si la llaman otra vez antes de tiempo,
// cancela la espera anterior y empieza de nuevo: solo corre la última.
//
//   const buscarConEspera = debounce(buscar, 300);
//   buscarConEspera("c"); buscarConEspera("ca"); buscarConEspera("cas");
//   // 300 ms después: buscar("cas"), una sola vez

export function debounce(fn, ms) {
  return function (...args) {
    let temporizador;
    clearTimeout(temporizador);
    temporizador = setTimeout(() => fn(...args), ms);
  };
}
