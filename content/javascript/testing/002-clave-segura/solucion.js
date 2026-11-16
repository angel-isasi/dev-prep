// Tests para esClaveSegura(clave)

export function misTests({ test, expect }, esClaveSegura) {
  test("acepta una contraseña normal", () => {
    expect(esClaveSegura("Segura123")).toBe(true);
  });

  test("acepta 8 caracteres justos (el mínimo)", () => {
    expect(esClaveSegura("Abcdefg1")).toBe(true);
  });

  test("rechaza 7 caracteres (uno menos que el mínimo)", () => {
    expect(esClaveSegura("Abcdef1")).toBe(false);
  });

  test("acepta 20 caracteres justos (el máximo)", () => {
    expect(esClaveSegura("A1" + "x".repeat(18))).toBe(true);
  });

  test("rechaza 21 caracteres (uno más que el máximo)", () => {
    expect(esClaveSegura("A1" + "x".repeat(19))).toBe(false);
  });

  test("rechaza una contraseña sin números", () => {
    expect(esClaveSegura("Abcdefgh")).toBe(false);
  });

  test("rechaza una contraseña sin mayúsculas", () => {
    expect(esClaveSegura("abcdefg1")).toBe(false);
  });
}
