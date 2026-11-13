// @vitest-environment jsdom
import { test, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Wizard } from "./solucion.jsx";

function escribir(etiqueta, valor) {
  fireEvent.change(screen.getByLabelText(etiqueta), { target: { value: valor } });
}

const clic = (texto) => fireEvent.click(screen.getByText(texto));

test("empieza en el paso 1 con el campo Nombre y sin botón Atrás", () => {
  render(<Wizard onFinalizar={vi.fn()} />);
  expect(screen.getByText("Paso 1 de 3")).toBeTruthy();
  expect(screen.getByLabelText("Nombre")).toBeTruthy();
  expect(screen.queryByText("Atrás")).toBeNull();
});

test('"Siguiente" lleva al paso 2 con el campo Escuela', () => {
  render(<Wizard onFinalizar={vi.fn()} />);
  escribir("Nombre", "Angel");
  clic("Siguiente");
  expect(screen.getByText("Paso 2 de 3")).toBeTruthy();
  expect(screen.getByLabelText("Escuela")).toBeTruthy();
  expect(screen.queryByLabelText("Nombre")).toBeNull();
});

test("al volver atrás no se pierde lo escrito", () => {
  render(<Wizard onFinalizar={vi.fn()} />);
  escribir("Nombre", "Angel");
  clic("Siguiente");
  escribir("Escuela", "Sistemas");
  clic("Atrás");
  expect(screen.getByLabelText("Nombre").value).toBe("Angel");
  clic("Siguiente");
  expect(screen.getByLabelText("Escuela").value).toBe("Sistemas");
});

test("el último paso muestra el resumen y el botón Enviar", () => {
  render(<Wizard onFinalizar={vi.fn()} />);
  escribir("Nombre", "Angel");
  clic("Siguiente");
  escribir("Escuela", "Sistemas");
  clic("Siguiente");
  expect(screen.getByText("Paso 3 de 3")).toBeTruthy();
  expect(screen.getByText("Confirma: Angel, Sistemas")).toBeTruthy();
  expect(screen.getByText("Enviar")).toBeTruthy();
  expect(screen.queryByText("Siguiente")).toBeNull();
});

test('"Enviar" llama a onFinalizar con todos los datos', () => {
  const onFinalizar = vi.fn();
  render(<Wizard onFinalizar={onFinalizar} />);
  escribir("Nombre", "Angel");
  clic("Siguiente");
  escribir("Escuela", "Sistemas");
  clic("Siguiente");
  expect(onFinalizar).not.toHaveBeenCalled();
  clic("Enviar");
  expect(onFinalizar).toHaveBeenCalledTimes(1);
  expect(onFinalizar).toHaveBeenCalledWith({ nombre: "Angel", escuela: "Sistemas" });
});
