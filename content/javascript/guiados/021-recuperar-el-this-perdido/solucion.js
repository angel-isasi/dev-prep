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
  emisor.on(() => contador.sumar());
}
