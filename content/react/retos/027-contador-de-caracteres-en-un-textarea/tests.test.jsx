// @vitest-environment jsdom
import { test, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Comentario } from "./solucion.jsx";

function escribir(texto) {
  fireEvent.change(screen.getByLabelText("Comentario"), { target: { value: texto } });
}

const publicar = () => screen.getByText("Publicar");

test("al inicio muestra todos los caracteres disponibles y Publicar deshabilitado", () => {
  render(<Comentario max={20} />);
  expect(screen.getByText("20 caracteres restantes")).toBeTruthy();
  expect(publicar().disabled).toBe(true);
});

test("el contador baja mientras escribes y Publicar se habilita", () => {
  render(<Comentario max={20} />);
  escribir("Gran corto");
  expect(screen.getByText("10 caracteres restantes")).toBeTruthy();
  expect(publicar().disabled).toBe(false);
});

test("si solo hay espacios, Publicar sigue deshabilitado", () => {
  render(<Comentario max={20} />);
  escribir("   ");
  expect(screen.getByText("17 caracteres restantes")).toBeTruthy();
  expect(publicar().disabled).toBe(true);
});

test("el textarea tiene el límite real con maxLength", () => {
  render(<Comentario max={20} />);
  expect(screen.getByLabelText("Comentario").maxLength).toBe(20);
});

test("sin la prop max, el límite es 140", () => {
  render(<Comentario />);
  expect(screen.getByText("140 caracteres restantes")).toBeTruthy();
  expect(screen.getByLabelText("Comentario").maxLength).toBe(140);
});
