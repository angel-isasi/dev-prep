// Recuperar el this perdido
//
// `Contador` y `crearEmisor` ya están hechos: no los cambies.
// Escribe `registrar(contador, emisor)` para que cada vez que el emisor
// emita, se ejecute contador.sumar() y suba contador.clics.
//
// Esto parece correcto, pero falla:
//
//   emisor.on(contador.sumar);
//   emisor.emitir();  // TypeError: Cannot read properties of undefined (reading 'clics')
//
// Guarda el archivo (Ctrl + S) y mira el resultado de los tests en la app.

export class Contador {
  constructor() {
    this.clics = 0;
  }

  sumar() {
    this.clics++;
  }
}

// Simula una librería de eventos: guarda funciones y después las llama
// "sueltas", sin ningún objeto antes del punto.
export function crearEmisor() {
  const oyentes = [];
  return {
    on(fn) {
      oyentes.push(fn);
    },
    emitir() {
      oyentes.forEach((fn) => fn());
    },
  };
}

export function registrar(contador, emisor) {
  // Tu código aquí
}
