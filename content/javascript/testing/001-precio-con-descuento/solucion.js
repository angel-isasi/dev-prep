// Tests para precioConDescuento(precio, porcentaje)

export function misTests({ test, expect }, precioConDescuento) {
  test("aplica un 20 % de descuento", () => {
    expect(precioConDescuento(100, 20)).toBe(80);
  });

  test("redondea el resultado a 2 decimales", () => {
    expect(precioConDescuento(19.99, 15)).toBe(16.99);
  });

  test("con 0 % devuelve el mismo precio", () => {
    expect(precioConDescuento(50, 0)).toBe(50);
  });

  test("con 100 % el precio es 0", () => {
    expect(precioConDescuento(50, 100)).toBe(0);
  });

  test("lanza un error si el porcentaje pasa de 100", () => {
    expect(() => precioConDescuento(50, 120)).toThrow();
  });

  test("lanza un error si el porcentaje es negativo", () => {
    expect(() => precioConDescuento(50, -10)).toThrow();
  });
}
