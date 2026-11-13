// @vitest-environment jsdom
import { test, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Arbol } from "./solucion.jsx";

const DATOS = {
  nombre: "src",
  hijos: [
    { nombre: "app", hijos: [{ nombre: "page.tsx" }] },
    { nombre: "README.md" },
  ],
};

function renderArbol() {
  render(
    <ul>
      <Arbol nodo={DATOS} />
    </ul>,
  );
}

const carpeta = (nombre) => screen.getByRole("button", { name: new RegExp(nombre) });

test("al inicio solo se ve la carpeta raíz, cerrada", () => {
  renderArbol();
  expect(carpeta("src")).toBeTruthy();
  expect(carpeta("src").getAttribute("aria-expanded")).toBe("false");
  expect(screen.queryByText(/README/)).toBeNull();
  expect(screen.queryByText(/app/)).toBeNull();
});

test("al hacer clic en una carpeta muestra sus hijos", () => {
  renderArbol();
  fireEvent.click(carpeta("src"));
  expect(carpeta("src").getAttribute("aria-expanded")).toBe("true");
  expect(screen.getByText(/README\.md/)).toBeTruthy();
  expect(carpeta("app")).toBeTruthy();
});

test("las carpetas anidadas también se abren (recursión)", () => {
  renderArbol();
  fireEvent.click(carpeta("src"));
  fireEvent.click(carpeta("app"));
  expect(screen.getByText(/page\.tsx/)).toBeTruthy();
});

test("los archivos no son botones", () => {
  renderArbol();
  fireEvent.click(carpeta("src"));
  expect(screen.queryByRole("button", { name: /README/ })).toBeNull();
  expect(screen.getByText(/README\.md/).tagName).toBe("LI");
});

test("cada carpeta se abre y se cierra por su cuenta", () => {
  renderArbol();
  fireEvent.click(carpeta("src"));
  fireEvent.click(carpeta("app"));
  fireEvent.click(carpeta("app")); // cierra solo "app"
  expect(screen.queryByText(/page\.tsx/)).toBeNull();
  expect(screen.getByText(/README\.md/)).toBeTruthy();
  fireEvent.click(carpeta("src")); // cierra "src"
  expect(screen.queryByText(/README/)).toBeNull();
});
