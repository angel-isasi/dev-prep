// Prestar un método con call, apply y bind
//
// `presentarse` usa this.nombre, pero las personas no tienen ese método.
// Préstaselo sin meterlo dentro del objeto:
//
//   presentarCon(ana, "Hola", "!")          ->  "Hola, soy Ana!"    (con call)
//   presentarConLista(ana, ["Hola", "!"])   ->  "Hola, soy Ana!"    (con apply)
//   const presentarAna = crearPresentador(ana);                     (con bind)
//   presentarAna("Buenas", ".")             ->  "Buenas, soy Ana."
//
// Guarda el archivo (Ctrl + S) y mira el resultado de los tests en la app.

export function presentarse(saludo, signo) {
  return `${saludo}, soy ${this.nombre}${signo}`;
}

export function presentarCon(persona, saludo, signo) {
  // Tu código aquí
}

export function presentarConLista(persona, argumentos) {
  // Tu código aquí
}

export function crearPresentador(persona) {
  // Tu código aquí
}
