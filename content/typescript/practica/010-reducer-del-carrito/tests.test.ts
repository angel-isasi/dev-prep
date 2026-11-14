import { test, expect, expectTypeOf } from "vitest";
import {
  carritoReducer,
  asegurarNunca,
  type AccionCarrito,
  type EstadoCarrito,
  type Producto,
} from "./solucion";

const inca: Producto = { id: 1, nombre: "Inca Kola 1L", precio: 4.5 };
const pan: Producto = { id: 2, nombre: "Pan francés", precio: 0.5 };

test("agregar un producto nuevo lo pone al final con cantidad 1", () => {
  const vacio: EstadoCarrito = { items: [] };
  const uno = carritoReducer(vacio, { tipo: "agregar", producto: inca });
  const dos = carritoReducer(uno, { tipo: "agregar", producto: pan });
  expect(dos.items).toEqual([
    { id: 1, nombre: "Inca Kola 1L", precio: 4.5, cantidad: 1 },
    { id: 2, nombre: "Pan francés", precio: 0.5, cantidad: 1 },
  ]);
});

test("agregar un producto que ya está le suma 1 a la cantidad (sin duplicarlo)", () => {
  const estado: EstadoCarrito = { items: [{ ...inca, cantidad: 2 }, { ...pan, cantidad: 1 }] };
  const nuevo = carritoReducer(estado, { tipo: "agregar", producto: inca });
  expect(nuevo.items).toEqual([{ ...inca, cantidad: 3 }, { ...pan, cantidad: 1 }]);
});

test("quitar elimina el ítem con ese id y vaciar deja el carrito sin ítems", () => {
  const estado: EstadoCarrito = { items: [{ ...inca, cantidad: 2 }, { ...pan, cantidad: 6 }] };
  expect(carritoReducer(estado, { tipo: "quitar", id: 1 }).items).toEqual([{ ...pan, cantidad: 6 }]);
  expect(carritoReducer(estado, { tipo: "vaciar" })).toEqual({ items: [] });
});

test("cambiarCantidad actualiza la cantidad; con 0 o menos quita el ítem", () => {
  const estado: EstadoCarrito = { items: [{ ...inca, cantidad: 2 }, { ...pan, cantidad: 6 }] };
  expect(carritoReducer(estado, { tipo: "cambiarCantidad", id: 2, cantidad: 10 }).items).toEqual([
    { ...inca, cantidad: 2 },
    { ...pan, cantidad: 10 },
  ]);
  expect(carritoReducer(estado, { tipo: "cambiarCantidad", id: 1, cantidad: 0 }).items).toEqual([
    { ...pan, cantidad: 6 },
  ]);
  expect(carritoReducer(estado, { tipo: "cambiarCantidad", id: 2, cantidad: -1 }).items).toEqual([
    { ...inca, cantidad: 2 },
  ]);
});

test("no modifica el estado original: devuelve uno nuevo", () => {
  const estado: EstadoCarrito = { items: [{ ...inca, cantidad: 1 }] };
  // Congelado: si el reducer intenta modificarlo (push, item.cantidad++), lanza un error.
  Object.freeze(estado.items[0]);
  Object.freeze(estado.items);
  Object.freeze(estado);
  const copia = structuredClone(estado);

  const acciones: AccionCarrito[] = [
    { tipo: "agregar", producto: inca },
    { tipo: "agregar", producto: pan },
    { tipo: "quitar", id: 1 },
    { tipo: "cambiarCantidad", id: 1, cantidad: 5 },
    { tipo: "vaciar" },
  ];
  for (const accion of acciones) {
    const nuevo = carritoReducer(estado, accion);
    expect(nuevo).not.toBe(estado);
  }
  expect(estado).toEqual(copia);
});

test("asegurarNunca lanza un error y el reducer lo usa con una acción desconocida", () => {
  expect(() => asegurarNunca("hola" as never)).toThrow("Acción desconocida");
  const rara = { tipo: "aplicarCupon", codigo: "PERU10" } as unknown as AccionCarrito;
  expect(() => carritoReducer({ items: [] }, rara)).toThrow("Acción desconocida");
});

test("AccionCarrito es una unión discriminada de 4 acciones (lo revisa tsc)", () => {
  expectTypeOf<AccionCarrito["tipo"]>().toEqualTypeOf<"agregar" | "quitar" | "cambiarCantidad" | "vaciar">();
  expectTypeOf<Extract<AccionCarrito, { tipo: "cambiarCantidad" }>>().toEqualTypeOf<{
    tipo: "cambiarCantidad";
    id: number;
    cantidad: number;
  }>();
  // Asignación tipada: asegurarNunca recibe never y devuelve never.
  const firma: (valor: never) => never = asegurarNunca;
  expect(firma).toBe(asegurarNunca);
  expectTypeOf(carritoReducer).returns.toEqualTypeOf<EstadoCarrito>();
});

test("rechaza acciones mal formadas (lo revisa tsc)", () => {
  const probar = () => {
    // @ts-expect-error a "quitar" le falta el id
    carritoReducer({ items: [] }, { tipo: "quitar" });
    // @ts-expect-error "agregar" lleva un producto, no un id
    carritoReducer({ items: [] }, { tipo: "agregar", id: 1 });
    // @ts-expect-error "aplicarCupon" no es una acción del carrito
    carritoReducer({ items: [] }, { tipo: "aplicarCupon", codigo: "PERU10" });
    // @ts-expect-error a asegurarNunca solo le llega never, no un string
    asegurarNunca("hola");
  };
  expect(typeof probar).toBe("function");
});
