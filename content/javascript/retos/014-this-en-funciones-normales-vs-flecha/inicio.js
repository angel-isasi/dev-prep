// this en funciones normales vs flecha
//
// Completa `usuario` con dos métodos que lean el nombre con `this`:
//   saludar()      -> "Hola, soy Angel"
//   saludarLuego() -> promesa que, 100 ms después, se cumple con "Angel"
// y crea `saludoLigado`, una función suelta que siempre saluda como Angel.
//
//   const rosa = { nombre: "Rosa", saludar: usuario.saludar };
//   rosa.saludar();   // "Hola, soy Rosa"
//
// Guarda el archivo (Ctrl + S) y mira el resultado de los tests en la app.

export const usuario = {
  nombre: "Angel",
  // Tus métodos aquí
};

export const saludoLigado = undefined; // Cámbialo
