// @vitest-environment jsdom
import { test, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { FILTROS, TareasConFiltro } from "./solucion.jsx";

function agregar(texto) {
  fireEvent.change(screen.getByLabelText("Nueva tarea"), { target: { value: texto } });
  fireEvent.click(screen.getByText("Agregar"));
}

function visibles() {
  return screen.queryAllByRole("listitem").map((li) => li.textContent);
}

test("FILTROS decide qué tareas se ven", () => {
  const pendiente = { id: 1, texto: "Amasar", hecha: false };
  const hecha = { id: 2, texto: "Hornear", hecha: true };
  expect([pendiente, hecha].filter(FILTROS.todas)).toEqual([pendiente, hecha]);
  expect([pendiente, hecha].filter(FILTROS.pendientes)).toEqual([pendiente]);
  expect([pendiente, hecha].filter(FILTROS.hechas)).toEqual([hecha]);
});

test("agrega tareas, limpia el input e ignora textos vacíos", () => {
  render(<TareasConFiltro />);
  agregar("  Amasar ");
  agregar("   ");
  agregar("Hornear");
  expect(visibles()).toEqual(["Amasar", "Hornear"]);
  expect(screen.getByLabelText("Nueva tarea").value).toBe("");
});

test("el contador cambia al marcar y desmarcar", () => {
  render(<TareasConFiltro />);
  agregar("Amasar");
  agregar("Hornear");
  expect(screen.getByText("Quedan 2 tareas")).toBeTruthy();
  fireEvent.click(screen.getByLabelText("Amasar"));
  expect(screen.getByText("Queda 1 tarea")).toBeTruthy();
  fireEvent.click(screen.getByLabelText("Hornear"));
  expect(screen.getByText("Quedan 0 tareas")).toBeTruthy();
  fireEvent.click(screen.getByLabelText("Amasar"));
  expect(screen.getByText("Queda 1 tarea")).toBeTruthy();
});

test("los filtros muestran pendientes o hechas y marcan el botón activo", () => {
  render(<TareasConFiltro />);
  agregar("Amasar");
  agregar("Hornear");
  fireEvent.click(screen.getByLabelText("Amasar"));
  expect(screen.getByText("todas").getAttribute("aria-pressed")).toBe("true");

  fireEvent.click(screen.getByText("pendientes"));
  expect(visibles()).toEqual(["Hornear"]);
  expect(screen.getByText("pendientes").getAttribute("aria-pressed")).toBe("true");
  expect(screen.getByText("todas").getAttribute("aria-pressed")).toBe("false");

  fireEvent.click(screen.getByText("hechas"));
  expect(visibles()).toEqual(["Amasar"]);
});

test('"Borrar las hechas" elimina solo las hechas', () => {
  render(<TareasConFiltro />);
  agregar("Amasar");
  agregar("Hornear");
  agregar("Repartir");
  fireEvent.click(screen.getByLabelText("Amasar"));
  fireEvent.click(screen.getByLabelText("Repartir"));
  fireEvent.click(screen.getByText("Borrar las hechas"));
  expect(visibles()).toEqual(["Hornear"]);
  expect(screen.getByText("Queda 1 tarea")).toBeTruthy();
});
