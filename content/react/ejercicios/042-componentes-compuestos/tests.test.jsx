// @vitest-environment jsdom
import { test, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Opciones, Masa } from "./solucion.jsx";

test("Masa muestra un radiogroup con Delgada elegida al inicio", () => {
  render(<Masa />);
  expect(screen.getByRole("radiogroup")).toBeTruthy();
  expect(screen.getAllByRole("radio").map((r) => r.textContent)).toEqual(["Delgada", "Gruesa"]);
  expect(screen.getByText("Delgada").getAttribute("aria-checked")).toBe("true");
  expect(screen.getByText("Gruesa").getAttribute("aria-checked")).toBe("false");
});

test('clic en "Gruesa" la marca y desmarca "Delgada"', () => {
  render(<Masa />);
  fireEvent.click(screen.getByText("Gruesa"));
  expect(screen.getByText("Gruesa").getAttribute("aria-checked")).toBe("true");
  expect(screen.getByText("Delgada").getAttribute("aria-checked")).toBe("false");
});

test("el grupo es controlado: avisa con el valor del item y marca el que le pasan", () => {
  const onCambio = vi.fn();
  render(
    <Opciones valor="m" onCambio={onCambio}>
      <Opciones.Item valor="s">Personal</Opciones.Item>
      <Opciones.Item valor="m">Mediana</Opciones.Item>
      <Opciones.Item valor="l">Familiar</Opciones.Item>
    </Opciones>,
  );
  expect(screen.getByText("Mediana").getAttribute("aria-checked")).toBe("true");
  fireEvent.click(screen.getByText("Familiar"));
  expect(onCambio).toHaveBeenCalledWith("l");
});

test("los items pueden ir anidados dentro de otros elementos", () => {
  const onCambio = vi.fn();
  render(
    <Opciones valor="s" onCambio={onCambio}>
      <ul>
        <li>
          <Opciones.Item valor="s">Personal</Opciones.Item>
        </li>
        <li>
          <Opciones.Item valor="l">Familiar</Opciones.Item>
        </li>
      </ul>
    </Opciones>,
  );
  fireEvent.click(screen.getByText("Familiar"));
  expect(onCambio).toHaveBeenCalledWith("l");
});

test("un Item fuera de Opciones lanza un error claro", () => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  expect(() => render(<Opciones.Item valor="x">Suelto</Opciones.Item>)).toThrow(
    /dentro de <Opciones>/,
  );
  vi.restoreAllMocks();
});
