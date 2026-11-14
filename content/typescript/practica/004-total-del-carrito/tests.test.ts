import { test, expect, expectTypeOf } from "vitest";
import { totalCarrito, type Producto, type ItemCarrito } from "./solucion";

const audifonos: Producto = { id: 1, nombre: "Audífonos", precio: 59.9 };
const mouse: Producto = { id: 2, nombre: "Mouse", precio: 35 };
const cable: Producto = { id: 3, nombre: "Cable USB-C", precio: 0.1 };

test("suma precio por cantidad de cada ítem: 2 audífonos y 1 mouse dan 154.8", () => {
  const carrito: ItemCarrito[] = [
    { producto: audifonos, cantidad: 2 },
    { producto: mouse, cantidad: 1 },
  ];
  expect(totalCarrito(carrito)).toBe(154.8);
});

test("un solo ítem con varias unidades: 3 mouse dan 105", () => {
  expect(totalCarrito([{ producto: mouse, cantidad: 3 }])).toBe(105);
});

test("un carrito vacío cuesta 0", () => {
  expect(totalCarrito([])).toBe(0);
});

test("redondea a 2 decimales: 3 cables de 0.1 dan 0.3 (no 0.30000000000000004)", () => {
  expect(totalCarrito([{ producto: cable, cantidad: 3 }])).toBe(0.3);
});

test("Producto e ItemCarrito tienen las propiedades pedidas (lo revisa tsc)", () => {
  expectTypeOf<Producto>().toEqualTypeOf<{ id: number; nombre: string; precio: number }>();
  expectTypeOf<ItemCarrito["producto"]>().toEqualTypeOf<Producto>();
  expectTypeOf<ItemCarrito["cantidad"]>().toEqualTypeOf<number>();
  expectTypeOf(totalCarrito).returns.toEqualTypeOf<number>();
});

test("rechaza objetos incompletos o con tipos equivocados (lo revisa tsc)", () => {
  const probar = () => {
    // @ts-expect-error a un ItemCarrito le falta la cantidad
    const sinCantidad: ItemCarrito = { producto: mouse };
    // @ts-expect-error el precio debe ser number, no string
    const precioTexto: Producto = { id: 9, nombre: "Teclado", precio: "120" };
    // @ts-expect-error "stock" no es una propiedad de Producto
    const conExtra: Producto = { id: 9, nombre: "Teclado", precio: 120, stock: 5 };
    return [sinCantidad, precioTexto, conExtra];
  };
  expect(typeof probar).toBe("function");
});
