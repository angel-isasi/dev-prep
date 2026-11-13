// @vitest-environment jsdom
import { test, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Pestanas } from "./solucion.jsx";

const PESTANAS = [
  { titulo: "Drama", contenido: "Cortos de drama" },
  { titulo: "Terror", contenido: "Cortos de terror" },
  { titulo: "Comedia", contenido: "Cortos de comedia" },
];

const tab = (nombre) => screen.getByRole("tab", { name: nombre });
const panel = () => screen.getByRole("tabpanel").textContent;

test("al inicio muestra la primera pestaña", () => {
  render(<Pestanas pestanas={PESTANAS} />);
  expect(screen.getByRole("tablist")).toBeTruthy();
  expect(screen.getAllByRole("tab").length).toBe(3);
  expect(panel()).toBe("Cortos de drama");
});

test("clic en una pestaña cambia el panel", () => {
  render(<Pestanas pestanas={PESTANAS} />);
  fireEvent.click(tab("Terror"));
  expect(panel()).toBe("Cortos de terror");
});

test("aria-selected y tabIndex marcan la pestaña activa", () => {
  render(<Pestanas pestanas={PESTANAS} />);
  fireEvent.click(tab("Terror"));
  expect(tab("Terror").getAttribute("aria-selected")).toBe("true");
  expect(tab("Drama").getAttribute("aria-selected")).toBe("false");
  expect(tab("Terror").tabIndex).toBe(0);
  expect(tab("Drama").tabIndex).toBe(-1);
});

test("ArrowRight activa la siguiente y da la vuelta al final", () => {
  render(<Pestanas pestanas={PESTANAS} />);
  fireEvent.keyDown(tab("Drama"), { key: "ArrowRight" });
  expect(panel()).toBe("Cortos de terror");
  fireEvent.keyDown(tab("Terror"), { key: "ArrowRight" });
  fireEvent.keyDown(tab("Comedia"), { key: "ArrowRight" });
  expect(tab("Drama").getAttribute("aria-selected")).toBe("true");
  expect(panel()).toBe("Cortos de drama");
});

test("ArrowLeft desde la primera va a la última", () => {
  render(<Pestanas pestanas={PESTANAS} />);
  fireEvent.keyDown(tab("Drama"), { key: "ArrowLeft" });
  expect(tab("Comedia").getAttribute("aria-selected")).toBe("true");
  expect(panel()).toBe("Cortos de comedia");
});

test("el panel está conectado con su pestaña por ids", () => {
  render(<Pestanas pestanas={PESTANAS} />);
  fireEvent.click(tab("Comedia"));
  const elPanel = screen.getByRole("tabpanel");
  expect(elPanel.getAttribute("aria-labelledby")).toBe(tab("Comedia").id);
  expect(tab("Comedia").getAttribute("aria-controls")).toBe(elPanel.id);
});
