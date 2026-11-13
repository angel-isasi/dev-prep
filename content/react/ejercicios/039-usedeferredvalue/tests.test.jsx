// @vitest-environment jsdom
import { test, expect } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BuscadorFluido, ListaPesada } from "./solucion.jsx";

const ITEMS = ["margarita", "marinara", "hawaiana"];

const escribir = (texto) =>
  fireEvent.change(screen.getByLabelText("Buscar"), { target: { value: texto } });
const visibles = () => screen.queryAllByRole("listitem").map((li) => li.textContent);

test("al inicio muestra todos los items", () => {
  render(<BuscadorFluido items={ITEMS} />);
  expect(visibles()).toEqual(ITEMS);
});

test("el input muestra lo escrito al instante", () => {
  render(<BuscadorFluido items={ITEMS} />);
  escribir("mar");
  expect(screen.getByLabelText("Buscar").value).toBe("mar");
});

test("la lista se pone al día con el filtro", async () => {
  render(<BuscadorFluido items={ITEMS} />);
  escribir("mar");
  await waitFor(() => expect(visibles()).toEqual(["margarita", "marinara"]));
});

test("no distingue mayúsculas y avisa si no hay resultados", async () => {
  render(<BuscadorFluido items={ITEMS} />);
  escribir("  HAWA ");
  await waitFor(() => expect(visibles()).toEqual(["hawaiana"]));
  escribir("xyz");
  await waitFor(() => expect(screen.getByText("Sin resultados")).toBeTruthy());
  expect(visibles()).toEqual([]);
});

test("ListaPesada está envuelta en memo", () => {
  expect(ListaPesada.$$typeof).toBe(Symbol.for("react.memo"));
});
