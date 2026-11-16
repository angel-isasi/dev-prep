// Tests para validarRegistro(datos)
//
// La función ya existe y funciona. Tu trabajo: escribir los tests que atrapen
// sus posibles errores. La app la corre contra la versión correcta (tus tests
// deben pasar) y contra 6 versiones con un error escondido (deben fallar).
//
// Escribe cada test con test("qué prueba", () => { expect(...)... }).

// Datos con todo válido. En cada test cambia solo lo que quieres probar:
// { ...validos, correo: "ana" } es igual a validos, pero con otro correo.
const validos = {
  nombre: "Ana Pérez",
  correo: "ana@correo.pe",
  edad: 25,
  clave: "secreta123",
  confirmar: "secreta123",
};

export function misTests({ test, expect }, validarRegistro) {
  test("detecta un correo sin arroba", () => {
    expect(validarRegistro({ ...validos, correo: "ana" })).toEqual({ correo: "El correo no es válido" });
  });

  // Agrega aquí más tests. Pistas: un test por campo inválido, uno con todo
  // válido (¿el objeto está realmente vacío?) y uno con varios errores juntos.
}
