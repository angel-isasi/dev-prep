// @vitest-environment jsdom
import { test, expect, expectTypeOf } from "vitest";
import { render, screen } from "@testing-library/react";
import { Lista } from "./solucion";

type Producto = { id: number; nombre: string; precio: number };

const productos: Producto[] = [
  { id: 1, nombre: "Teclado", precio: 120 },
  { id: 2, nombre: "Mouse", precio: 45 },
  { id: 3, nombre: "Monitor", precio: 700 },
];

test("pinta un <li> por elemento usando renderItem", () => {
  render(<Lista items={productos} obtenerClave={(p) => p.id} renderItem={(p) => `${p.nombre}: S/ ${p.precio}`} />);
  const filas = screen.getAllByRole("listitem");
  expect(filas.map((li) => li.textContent)).toEqual(["Teclado: S/ 120", "Mouse: S/ 45", "Monitor: S/ 700"]);
});

test("renderItem recibe también el índice", () => {
  render(<Lista items={productos} obtenerClave={(p) => p.id} renderItem={(p, i) => `${i + 1}. ${p.nombre}`} />);
  expect(screen.getByText("1. Teclado")).toBeTruthy();
  expect(screen.getByText("3. Monitor")).toBeTruthy();
});

test("renderItem puede devolver JSX", () => {
  render(
    <Lista items={productos} obtenerClave={(p) => p.id} renderItem={(p) => <strong>{p.nombre}</strong>} />,
  );
  expect(screen.getByText("Mouse").tagName).toBe("STRONG");
});

test('sin elementos muestra "No hay elementos" y no pinta la lista', () => {
  render(<Lista items={[] as Producto[]} obtenerClave={(p) => p.id} renderItem={(p) => p.nombre} />);
  expect(screen.getByText("No hay elementos")).toBeTruthy();
  expect(screen.queryByRole("list")).toBeNull();
});

test("el mensaje de vacío se puede cambiar", () => {
  render(
    <Lista items={[] as string[]} obtenerClave={(t) => t} renderItem={(t) => t} vacio="Tu carrito está vacío" />,
  );
  expect(screen.getByText("Tu carrito está vacío")).toBeTruthy();
});

test("sirve para cualquier tipo de elemento, no solo objetos", () => {
  render(<Lista items={["rojo", "verde"]} obtenerClave={(color) => color} renderItem={(color) => color.toUpperCase()} />);
  expect(screen.getAllByRole("listitem").map((li) => li.textContent)).toEqual(["ROJO", "VERDE"]);
});

test("T se infiere de items y tipa renderItem (lo revisa tsc)", () => {
  render(
    <Lista
      items={productos}
      obtenerClave={(p) => p.id}
      renderItem={(p, i) => {
        expectTypeOf(p).toEqualTypeOf<Producto>();
        expectTypeOf(i).toEqualTypeOf<number>();
        return p.nombre;
      }}
    />,
  );
  const probar = () => [
    Lista({
      items: productos,
      obtenerClave: (p) => p.id,
      // @ts-expect-error Producto no tiene "titulo"
      renderItem: (p) => p.titulo,
    }),
    Lista({
      items: productos,
      // @ts-expect-error la clave debe ser string o number, no el producto entero
      obtenerClave: (p) => p,
      renderItem: (p) => p.nombre,
    }),
  ];
  expect(typeof probar).toBe("function");
});
