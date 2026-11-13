// Implementa bind
//
// Devuelve una función nueva que ejecuta la original con `this` fijado en
// `contexto` y con los argumentos `previos` delante de los nuevos.
//
//   function presentar(saludo, signo) { return `${saludo}, ${this.nombre}${signo}`; }
//   const ligada = presentar.miBind({ nombre: "Ica" }, "Hola");
//   ligada("!");   // "Hola, Ica!"
//
// Guarda el archivo (Ctrl + S) y mira el resultado de los tests en la app.

Function.prototype.miBind = function (contexto, ...previos) {
  // Tu código aquí
};
