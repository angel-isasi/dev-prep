export function presentarse(saludo, signo) {
  return `${saludo}, soy ${this.nombre}${signo}`;
}

export function presentarCon(persona, saludo, signo) {
  return presentarse.call(persona, saludo, signo);
}

export function presentarConLista(persona, argumentos) {
  return presentarse.apply(persona, argumentos);
}

export function crearPresentador(persona) {
  return presentarse.bind(persona);
}
