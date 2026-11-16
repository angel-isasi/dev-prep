// Tests para validarRegistro(datos)

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

  test("con todo válido devuelve un objeto realmente vacío", () => {
    // toStrictEqual, porque toEqual aceptaría { nombre: undefined, ... }
    expect(validarRegistro(validos)).toStrictEqual({});
  });

  test("un nombre de solo espacios cuenta como vacío", () => {
    expect(validarRegistro({ ...validos, nombre: "   " })).toEqual({ nombre: "El nombre es obligatorio" });
  });

  test("detecta un correo sin punto después de la arroba", () => {
    expect(validarRegistro({ ...validos, correo: "ana@correo" })).toEqual({ correo: "El correo no es válido" });
  });

  test("acepta 18 años justos", () => {
    expect(validarRegistro({ ...validos, edad: 18 })).toEqual({});
  });

  test("rechaza 17 años", () => {
    expect(validarRegistro({ ...validos, edad: 17 })).toEqual({ edad: "Debes tener al menos 18 años" });
  });

  test("detecta contraseñas que no coinciden", () => {
    expect(validarRegistro({ ...validos, confirmar: "secreta124" })).toEqual({
      confirmar: "Las contraseñas no coinciden",
    });
  });

  test("devuelve todos los errores a la vez", () => {
    const datos = { nombre: "", correo: "ana", edad: 15, clave: "corta", confirmar: "otra" };
    expect(validarRegistro(datos)).toEqual({
      nombre: "El nombre es obligatorio",
      correo: "El correo no es válido",
      edad: "Debes tener al menos 18 años",
      clave: "La contraseña debe tener al menos 8 caracteres",
      confirmar: "Las contraseñas no coinciden",
    });
  });
}
