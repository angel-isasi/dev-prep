// Tests para productosBaratos(productos, precioMaximo)

// Cada test pide un catálogo nuevo: así ningún test se ve afectado
// por lo que otro test le haya hecho al arreglo.
const crearCatalogo = () => [
  { id: 1, nombre: "Monitor", precio: 500 },
  { id: 2, nombre: "Mouse", precio: 25 },
  { id: 3, nombre: "Teclado", precio: 100 },
  { id: 4, nombre: "Cable USB", precio: 9 },
];

export function misTests({ test, expect }, productosBaratos) {
  test("deja fuera los productos caros", () => {
    const productos = [
      { id: 1, nombre: "Mouse", precio: 30 },
      { id: 2, nombre: "Monitor", precio: 500 },
    ];
    expect(productosBaratos(productos, 100)).toEqual([{ id: 1, nombre: "Mouse", precio: 30 }]);
  });

  test("ordena de menor a mayor precio, aunque tengan distintas cifras", () => {
    const precios = productosBaratos(crearCatalogo(), 1000).map((p) => p.precio);
    expect(precios).toEqual([9, 25, 100, 500]);
  });

  test("incluye el producto que cuesta justo el máximo", () => {
    const nombres = productosBaratos(crearCatalogo(), 100).map((p) => p.nombre);
    expect(nombres).toEqual(["Cable USB", "Mouse", "Teclado"]);
  });

  test("devuelve los productos completos, con todas sus propiedades", () => {
    expect(productosBaratos(crearCatalogo(), 30)).toEqual([
      { id: 4, nombre: "Cable USB", precio: 9 },
      { id: 2, nombre: "Mouse", precio: 25 },
    ]);
  });

  test("no modifica el arreglo original", () => {
    const productos = crearCatalogo();
    const copia = [...productos];
    productosBaratos(productos, 1000);
    expect(productos).toEqual(copia);
  });

  test("si ninguno entra, devuelve un arreglo vacío", () => {
    expect(productosBaratos(crearCatalogo(), 5)).toEqual([]);
  });
}
