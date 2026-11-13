// @vitest-environment jsdom
import { test, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Autocompletar } from "./solucion.jsx";

const OPCIONES = ["Ica", "Ica Norte", "Parcona", "Pueblo Nuevo"];

const input = () => screen.getByRole("combobox");
const escribir = (texto) => fireEvent.change(input(), { target: { value: texto } });
const tecla = (key) => fireEvent.keyDown(input(), { key });
const sugerencias = () => screen.queryAllByRole("option").map((o) => o.textContent);
const resaltada = () =>
  screen
    .queryAllByRole("option")
    .filter((o) => o.getAttribute("aria-selected") === "true")
    .map((o) => o.textContent);

test("sin texto no muestra sugerencias", () => {
  render(<Autocompletar opciones={OPCIONES} onElegir={() => {}} />);
  expect(screen.getByLabelText("Distrito")).toBe(input());
  expect(sugerencias()).toEqual([]);
});

test("sugiere las opciones que empiezan con lo escrito, sin importar mayúsculas", () => {
  render(<Autocompletar opciones={OPCIONES} onElegir={() => {}} />);
  escribir("p");
  expect(sugerencias()).toEqual(["Parcona", "Pueblo Nuevo"]);
  escribir("ICA");
  expect(sugerencias()).toEqual(["Ica", "Ica Norte"]);
});

test("las flechas mueven la opción resaltada sin salirse de los extremos", () => {
  render(<Autocompletar opciones={OPCIONES} onElegir={() => {}} />);
  escribir("p");
  expect(resaltada()).toEqual([]);
  tecla("ArrowDown");
  expect(resaltada()).toEqual(["Parcona"]);
  tecla("ArrowDown");
  tecla("ArrowDown");
  expect(resaltada()).toEqual(["Pueblo Nuevo"]);
  tecla("ArrowUp");
  tecla("ArrowUp");
  expect(resaltada()).toEqual(["Parcona"]);
});

test("Enter elige la resaltada, llena el input y cierra la lista", () => {
  const onElegir = vi.fn();
  render(<Autocompletar opciones={OPCIONES} onElegir={onElegir} />);
  escribir("p");
  tecla("ArrowDown");
  tecla("ArrowDown");
  tecla("Enter");
  expect(onElegir).toHaveBeenCalledWith("Pueblo Nuevo");
  expect(input().value).toBe("Pueblo Nuevo");
  expect(sugerencias()).toEqual([]);
});

test("clic en una sugerencia también la elige", () => {
  const onElegir = vi.fn();
  render(<Autocompletar opciones={OPCIONES} onElegir={onElegir} />);
  escribir("ica");
  fireEvent.click(screen.getByText("Ica Norte"));
  expect(onElegir).toHaveBeenCalledWith("Ica Norte");
  expect(input().value).toBe("Ica Norte");
  expect(sugerencias()).toEqual([]);
});

test("Escape borra el texto y cierra la lista", () => {
  render(<Autocompletar opciones={OPCIONES} onElegir={() => {}} />);
  escribir("p");
  tecla("Escape");
  expect(input().value).toBe("");
  expect(sugerencias()).toEqual([]);
});
