// @vitest-environment jsdom
import { test, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CarritoProvider, Encabezado, BotonPizza } from "./solucion.jsx";

test('al inicio muestra "Carrito: 0"', () => {
  render(
    <CarritoProvider>
      <Encabezado />
      <BotonPizza nombre="Hawaiana" />
    </CarritoProvider>,
  );
  expect(screen.getByText("Carrito: 0")).toBeTruthy();
  expect(screen.getByRole("button", { name: "Pedir Hawaiana" })).toBeTruthy();
});

test("un clic agrega la pizza y el encabezado se entera", () => {
  render(
    <CarritoProvider>
      <Encabezado />
      <BotonPizza nombre="Hawaiana" />
    </CarritoProvider>,
  );
  fireEvent.click(screen.getByText("Pedir Hawaiana"));
  expect(screen.getByText("Carrito: 1")).toBeTruthy();
});

test("varios botones comparten el mismo carrito", () => {
  render(
    <CarritoProvider>
      <Encabezado />
      <BotonPizza nombre="Hawaiana" />
      <BotonPizza nombre="Americana" />
    </CarritoProvider>,
  );
  fireEvent.click(screen.getByText("Pedir Hawaiana"));
  fireEvent.click(screen.getByText("Pedir Americana"));
  fireEvent.click(screen.getByText("Pedir Hawaiana"));
  expect(screen.getByText("Carrito: 3")).toBeTruthy();
});

test("funciona aunque el botón esté anidado muy adentro", () => {
  render(
    <CarritoProvider>
      <header>
        <nav>
          <Encabezado />
        </nav>
      </header>
      <main>
        <section>
          <article>
            <BotonPizza nombre="Vegana" />
          </article>
        </section>
      </main>
    </CarritoProvider>,
  );
  fireEvent.click(screen.getByText("Pedir Vegana"));
  expect(screen.getByText("Carrito: 1")).toBeTruthy();
});

test("cada provider tiene su propio carrito", () => {
  render(
    <>
      <div data-testid="tienda-a">
        <CarritoProvider>
          <Encabezado />
          <BotonPizza nombre="Hawaiana" />
        </CarritoProvider>
      </div>
      <div data-testid="tienda-b">
        <CarritoProvider>
          <Encabezado />
          <BotonPizza nombre="Margarita" />
        </CarritoProvider>
      </div>
    </>,
  );
  fireEvent.click(screen.getByText("Pedir Hawaiana"));
  expect(screen.getByTestId("tienda-a").textContent).toContain("Carrito: 1");
  expect(screen.getByTestId("tienda-b").textContent).toContain("Carrito: 0");
});
