// Tests para totalCarrito(items, cupon)

export function misTests({ test, expect }, totalCarrito) {
  test("suma los precios y cobra envío", () => {
    expect(totalCarrito([{ precio: 30, cantidad: 1 }, { precio: 20, cantidad: 1 }])).toBe(65);
  });

  test("multiplica el precio por la cantidad", () => {
    // 20 * 3 = 60, más 15 de envío
    expect(totalCarrito([{ precio: 20, cantidad: 3 }])).toBe(75);
  });

  test("con 100 justos el envío es gratis", () => {
    expect(totalCarrito([{ precio: 50, cantidad: 2 }])).toBe(100);
  });

  test("decide el envío con el monto después del descuento", () => {
    // 105 - 10 % = 94.5, que es menor que 100: se cobra envío
    expect(totalCarrito([{ precio: 105, cantidad: 1 }], "DESC10")).toBe(109.5);
  });

  test("acepta el cupón en minúsculas", () => {
    // 50 - 10 % = 45, más 15 de envío
    expect(totalCarrito([{ precio: 50, cantidad: 1 }], "desc10")).toBe(60);
  });

  test("un cupón que no existe no descuenta nada", () => {
    expect(totalCarrito([{ precio: 50, cantidad: 1 }], "GRATIS")).toBe(65);
  });

  test("el carrito vacío cuesta 0, sin envío", () => {
    expect(totalCarrito([])).toBe(0);
  });
}
