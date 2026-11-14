// Validador de formulario
//
// validar(datos, reglas) aplica a cada campo sus reglas y devuelve un objeto
// con el primer mensaje de error de cada campo que falle ({} si todo está bien).
// Los tipos deben conectar cada regla con el tipo de SU campo.
//
//   validar({ usuario: "al", edad: 16 }, { usuario: [minLargo(3)], edad: [mayorDeEdad] })
//   // { usuario: "Debe tener al menos 3 caracteres", edad: "Debes ser mayor de edad" }
//
// Guarda el archivo (Ctrl + S) y mira el resultado de los tests en la app.

// Una regla recibe el valor de un campo y devuelve el mensaje de error, o null si está bien.
export type Regla<V> = (valor: V) => string | null;

// Cambia los `any`:
// - Reglas<T>: para cada campo de T (opcional), una lista de reglas para el tipo de ese campo.
// - Errores<T>: como mucho un texto por campo de T, todos opcionales.
export type Reglas<T> = any;
export type Errores<T> = any;

export function validar<T>(datos: T, reglas: Reglas<T>): Errores<T> {
  // Tu código aquí
  return {};
}

export function requerido(mensaje = "Este campo es obligatorio"): Regla<string> {
  // Tu código aquí
  return () => null;
}

export function minLargo(n: number): Regla<string> {
  // Tu código aquí
  return () => null;
}
