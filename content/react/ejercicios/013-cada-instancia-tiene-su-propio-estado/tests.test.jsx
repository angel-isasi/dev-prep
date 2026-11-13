// @vitest-environment jsdom
import { test, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Cantidad } from "./solucion.jsx";

test("empieza en 0", () => {
  render(<Cantidad nombre="Margarita" />);
  expect(screen.getByRole("button").textContent).toBe("Margarita: 0");
});

test("cada clic suma 1", () => {
  render(<Cantidad nombre="Margarita" />);
  fireEvent.click(screen.getByRole("button"));
  expect(screen.getByRole("button").textContent).toBe("Margarita: 1");
});

test("cuenta varios clics seguidos", () => {
  render(<Cantidad nombre="Pepperoni" />);
  const boton = screen.getByRole("button");
  fireEvent.click(boton);
  fireEvent.click(boton);
  fireEvent.click(boton);
  expect(boton.textContent).toBe("Pepperoni: 3");
});

test("dos instancias llevan cuentas separadas", () => {
  render(
    <>
      <Cantidad nombre="Margarita" />
      <Cantidad nombre="Hawaiana" />
    </>
  );
  fireEvent.click(screen.getByText("Margarita: 0"));
  expect(screen.getByText("Margarita: 1")).toBeTruthy();
  expect(screen.getByText("Hawaiana: 0")).toBeTruthy();

  fireEvent.click(screen.getByText("Hawaiana: 0"));
  expect(screen.getByText("Margarita: 1")).toBeTruthy();
  expect(screen.getByText("Hawaiana: 1")).toBeTruthy();
});
