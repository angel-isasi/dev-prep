// @vitest-environment jsdom
import { test, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Etiquetas } from "./solucion.jsx";

const sugerencias = ["React", "CSS", "TypeScript"];
const elegidas = () => screen.getByText(/Elegidas:/).textContent;

test("al hacer clic en una etiqueta, aparece en las elegidas", () => {
  render(<Etiquetas sugerencias={sugerencias} />);
  fireEvent.click(screen.getByRole("button", { name: "CSS" }));
  expect(elegidas()).toBe("Elegidas: CSS");
});

test("al inicio no hay ninguna elegida", () => {
  render(<Etiquetas sugerencias={sugerencias} />);
  expect(elegidas()).toBe("Elegidas: ninguna");
});

test("muestra las elegidas en el orden de los clics", () => {
  render(<Etiquetas sugerencias={sugerencias} />);
  fireEvent.click(screen.getByRole("button", { name: "TypeScript" }));
  fireEvent.click(screen.getByRole("button", { name: "React" }));
  expect(elegidas()).toBe("Elegidas: TypeScript, React");
});

test("muestra un botón por sugerencia", () => {
  render(<Etiquetas sugerencias={sugerencias} />);
  expect(screen.getAllByRole("button").map((b) => b.textContent)).toEqual(sugerencias);
});
