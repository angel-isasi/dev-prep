// @vitest-environment jsdom
import { test, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Conversor } from "./solucion.jsx";

const soles = () => screen.getByLabelText("Soles");
const dolares = () => screen.getByLabelText("Dólares");
const escribir = (input, texto) => fireEvent.change(input, { target: { value: texto } });

test("al inicio los dos inputs están vacíos", () => {
  render(<Conversor />);
  expect(soles().value).toBe("");
  expect(dolares().value).toBe("");
});

test("escribir soles calcula los dólares con 2 decimales", () => {
  render(<Conversor />);
  escribir(soles(), "75");
  expect(soles().value).toBe("75");
  expect(dolares().value).toBe("20.00");
});

test("escribir dólares calcula los soles", () => {
  render(<Conversor />);
  escribir(dolares(), "10");
  expect(soles().value).toBe("37.50");
});

test("lo que escribes en Dólares se queda tal cual, sin reformatear", () => {
  render(<Conversor />);
  escribir(dolares(), "1");
  expect(dolares().value).toBe("1");
  expect(soles().value).toBe("3.75");
  escribir(dolares(), "10");
  expect(dolares().value).toBe("10");
});

test("si borras o escribes algo que no es número, el otro queda vacío", () => {
  render(<Conversor />);
  escribir(soles(), "75");
  escribir(soles(), "");
  expect(dolares().value).toBe("");
  escribir(soles(), "abc");
  expect(soles().value).toBe("abc");
  expect(dolares().value).toBe("");
});
