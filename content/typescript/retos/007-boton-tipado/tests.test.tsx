// @vitest-environment jsdom
import { test, expect, expectTypeOf, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Boton, type Variante } from "./solucion";

test("muestra lo que recibe en children", () => {
  render(<Boton>Guardar</Boton>);
  expect(screen.getByRole("button", { name: "Guardar" })).toBeTruthy();
});

test('sin variante usa la clase "boton boton--primario" y type="button"', () => {
  render(<Boton>Guardar</Boton>);
  const boton = screen.getByRole("button") as HTMLButtonElement;
  expect(boton.className).toBe("boton boton--primario");
  expect(boton.type).toBe("button");
});

test("la variante cambia la clase", () => {
  render(
    <>
      <Boton variante="secundario">Cancelar</Boton>
      <Boton variante="peligro">Eliminar</Boton>
    </>,
  );
  expect(screen.getByText("Cancelar").className).toBe("boton boton--secundario");
  expect(screen.getByText("Eliminar").className).toBe("boton boton--peligro");
});

test("al hacer clic llama a onClick", () => {
  const alClic = vi.fn();
  render(<Boton onClick={alClic}>Guardar</Boton>);
  fireEvent.click(screen.getByText("Guardar"));
  expect(alClic).toHaveBeenCalledTimes(1);
});

test("deshabilitado: el botón queda disabled y no llama a onClick", () => {
  const alClic = vi.fn();
  render(
    <Boton deshabilitado onClick={alClic}>
      Eliminar
    </Boton>,
  );
  const boton = screen.getByText("Eliminar") as HTMLButtonElement;
  expect(boton.disabled).toBe(true);
  fireEvent.click(boton);
  expect(alClic).not.toHaveBeenCalled();
});

test("Variante es la unión de los 3 literales (lo revisa tsc)", () => {
  expectTypeOf<Variante>().toEqualTypeOf<"primario" | "secundario" | "peligro">();
  const probar = () => (
    <>
      {/* @ts-expect-error "rojo" no es una Variante */}
      <Boton variante="rojo">Hola</Boton>
      {/* @ts-expect-error children es obligatorio */}
      <Boton />
    </>
  );
  expect(typeof probar).toBe("function");
});
