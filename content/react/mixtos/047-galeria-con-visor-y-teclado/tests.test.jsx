// @vitest-environment jsdom
import { test, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Galeria } from "./solucion.jsx";

const FOTOS = ["horno", "masa", "local"];

function tecla(key) {
  fireEvent.keyDown(document, { key });
}

function visor() {
  return screen.getByRole("dialog");
}

test("al inicio no hay visor y hay un botón por foto", () => {
  render(<Galeria fotos={FOTOS} />);
  expect(screen.queryByRole("dialog")).toBeNull();
  expect(screen.getAllByRole("button").map((b) => b.textContent)).toEqual([
    "Ver horno",
    "Ver masa",
    "Ver local",
  ]);
});

test("al hacer clic abre el visor en esa foto", () => {
  render(<Galeria fotos={FOTOS} />);
  fireEvent.click(screen.getByText("Ver masa"));
  expect(visor().getAttribute("aria-label")).toBe("Foto 2 de 3");
  expect(visor().textContent).toContain("masa");
});

test("ArrowRight avanza y desde la última vuelve a la primera", () => {
  render(<Galeria fotos={FOTOS} />);
  fireEvent.click(screen.getByText("Ver masa"));
  tecla("ArrowRight");
  expect(visor().getAttribute("aria-label")).toBe("Foto 3 de 3");
  tecla("ArrowRight");
  expect(visor().getAttribute("aria-label")).toBe("Foto 1 de 3");
  expect(visor().textContent).toContain("horno");
});

test("ArrowLeft desde la primera va a la última", () => {
  render(<Galeria fotos={FOTOS} />);
  fireEvent.click(screen.getByText("Ver horno"));
  tecla("ArrowLeft");
  expect(visor().getAttribute("aria-label")).toBe("Foto 3 de 3");
  expect(visor().textContent).toContain("local");
});

test("Escape y el botón Cerrar cierran el visor", () => {
  render(<Galeria fotos={FOTOS} />);
  fireEvent.click(screen.getByText("Ver horno"));
  tecla("Escape");
  expect(screen.queryByRole("dialog")).toBeNull();

  fireEvent.click(screen.getByText("Ver local"));
  fireEvent.click(screen.getByText("Cerrar"));
  expect(screen.queryByRole("dialog")).toBeNull();
});

test("con el visor cerrado las flechas no hacen nada", () => {
  render(<Galeria fotos={FOTOS} />);
  tecla("ArrowRight");
  expect(screen.queryByRole("dialog")).toBeNull();

  fireEvent.click(screen.getByText("Ver masa"));
  tecla("Escape");
  tecla("ArrowLeft");
  expect(screen.queryByRole("dialog")).toBeNull();
});
