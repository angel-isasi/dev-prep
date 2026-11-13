// @vitest-environment jsdom
import { test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Tarjeta } from "./solucion.jsx";

test("muestra el contenido que va entre las etiquetas", () => {
  render(
    <Tarjeta titulo="Promo">
      <p>2x1 los martes</p>
    </Tarjeta>
  );
  expect(screen.getByText("2x1 los martes")).toBeTruthy();
});

test("muestra el título en un <h2>", () => {
  render(
    <Tarjeta titulo="Promo">
      <p>2x1 los martes</p>
    </Tarjeta>
  );
  expect(screen.getByRole("heading", { level: 2 }).textContent).toBe("Promo");
});

test("acepta varios elementos como contenido", () => {
  render(
    <Tarjeta titulo="Horario">
      <p>Lunes a viernes</p>
      <p>De 12 a 23 h</p>
    </Tarjeta>
  );
  expect(screen.getByText("Lunes a viernes")).toBeTruthy();
  expect(screen.getByText("De 12 a 23 h")).toBeTruthy();
});

test("el título y el contenido están dentro del mismo <section>", () => {
  const { container } = render(
    <Tarjeta titulo="Promo">
      <p>2x1 los martes</p>
    </Tarjeta>
  );
  const seccion = container.querySelector("section");
  expect(seccion).toBeTruthy();
  expect(seccion.contains(screen.getByRole("heading"))).toBe(true);
  expect(seccion.contains(screen.getByText("2x1 los martes"))).toBe(true);
});

test("el título va antes del contenido", () => {
  const { container } = render(
    <Tarjeta titulo="Promo">
      <p>2x1 los martes</p>
    </Tarjeta>
  );
  const hijos = [...container.querySelector("section").children].map((el) => el.tagName);
  expect(hijos).toEqual(["H2", "P"]);
});
