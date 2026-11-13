// @vitest-environment jsdom
import { test, expect } from "vitest";
import { render } from "@testing-library/react";
import { Resaltar } from "./solucion.jsx";

function marcas(container) {
  return [...container.querySelectorAll("mark")].map((m) => m.textContent);
}

test("resalta la coincidencia sin distinguir mayúsculas y conserva el texto original", () => {
  const { container } = render(<p><Resaltar texto="Pizza Margarita (grande)" busqueda="mar" /></p>);
  expect(marcas(container)).toEqual(["Mar"]);
  expect(container.textContent).toBe("Pizza Margarita (grande)");
});

test("acepta caracteres especiales de regex como texto literal", () => {
  const { container } = render(<p><Resaltar texto="Pizza (grande)" busqueda="(" /></p>);
  expect(marcas(container)).toEqual(["("]);
  expect(container.textContent).toBe("Pizza (grande)");
});

test("un punto solo busca puntos, no cualquier carácter", () => {
  const { container } = render(<p><Resaltar texto="S/ 28.50" busqueda="." /></p>);
  expect(marcas(container)).toEqual(["."]);
});

test("resalta todas las coincidencias", () => {
  const { container } = render(<p><Resaltar texto="Pizza" busqueda="z" /></p>);
  expect(marcas(container)).toEqual(["z", "z"]);
  expect(container.textContent).toBe("Pizza");
});

test("con la búsqueda vacía o en blanco no resalta nada", () => {
  const { container } = render(<p><Resaltar texto="Pizza Margarita" busqueda="   " /></p>);
  expect(marcas(container)).toEqual([]);
  expect(container.textContent).toBe("Pizza Margarita");
});
