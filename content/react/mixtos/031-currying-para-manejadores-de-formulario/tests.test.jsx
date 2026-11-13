// @vitest-environment jsdom
import { test, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Registro } from "./solucion.jsx";

function escribir(etiqueta, texto) {
  fireEvent.change(screen.getByLabelText(etiqueta), { target: { value: texto } });
}

const salida = () => document.querySelector("output").textContent;

test("al escribir en los dos campos muestra nombre / distrito", () => {
  render(<Registro />);
  escribir("Nombre", "Ana");
  escribir("Distrito", "Ica");
  expect(screen.getByText("Ana / Ica")).toBeTruthy();
});

test("los inputs están controlados por el estado", () => {
  render(<Registro />);
  escribir("Nombre", "Luis");
  expect(screen.getByLabelText("Nombre").value).toBe("Luis");
  expect(screen.getByLabelText("Distrito").value).toBe("");
});

test("cambiar un campo no borra el otro", () => {
  render(<Registro />);
  escribir("Distrito", "Parcona");
  escribir("Nombre", "Rosa");
  escribir("Nombre", "Rosa María");
  expect(salida()).toBe("Rosa María / Parcona");
});

test("al inicio el output está vacío a los dos lados", () => {
  render(<Registro />);
  expect(salida()).toBe(" / ");
});
