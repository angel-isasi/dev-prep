// @vitest-environment jsdom
import { test, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Registro } from "./solucion.jsx";

function llenar(email, clave) {
  fireEvent.change(screen.getByLabelText("Correo"), { target: { value: email } });
  fireEvent.change(screen.getByLabelText("Contraseña"), { target: { value: clave } });
}

function enviar() {
  fireEvent.click(screen.getByText("Crear cuenta"));
}

function alertas() {
  return screen.queryAllByRole("alert").map((a) => a.textContent);
}

test("antes de enviar no muestra errores", () => {
  render(<Registro onSubmit={vi.fn()} />);
  expect(alertas()).toEqual([]);
});

test("al enviar vacío muestra los 2 errores y no llama a onSubmit", () => {
  const onSubmit = vi.fn();
  render(<Registro onSubmit={onSubmit} />);
  enviar();
  expect(alertas()).toEqual(["Ingresa un correo válido", "Mínimo 8 caracteres"]);
  expect(onSubmit).not.toHaveBeenCalled();
});

test("detecta un correo sin formato válido", () => {
  const onSubmit = vi.fn();
  render(<Registro onSubmit={onSubmit} />);
  llenar("angel@unica", "12345678");
  enviar();
  expect(alertas()).toEqual(["Ingresa un correo válido"]);
  expect(onSubmit).not.toHaveBeenCalled();
});

test("detecta una contraseña de menos de 8 caracteres", () => {
  const onSubmit = vi.fn();
  render(<Registro onSubmit={onSubmit} />);
  llenar("angel@unica.edu.pe", "1234567");
  enviar();
  expect(alertas()).toEqual(["Mínimo 8 caracteres"]);
  expect(screen.getByLabelText("Contraseña").getAttribute("aria-invalid")).toBe("true");
  expect(onSubmit).not.toHaveBeenCalled();
});

test("con datos válidos llama a onSubmit con { email, clave }", () => {
  const onSubmit = vi.fn();
  render(<Registro onSubmit={onSubmit} />);
  llenar("angel@unica.edu.pe", "12345678");
  enviar();
  expect(onSubmit).toHaveBeenCalledTimes(1);
  expect(onSubmit).toHaveBeenCalledWith({ email: "angel@unica.edu.pe", clave: "12345678" });
});

test("los errores desaparecen al corregir y volver a enviar", () => {
  const onSubmit = vi.fn();
  render(<Registro onSubmit={onSubmit} />);
  enviar();
  expect(alertas().length).toBe(2);
  llenar("angel@unica.edu.pe", "12345678");
  enviar();
  expect(alertas()).toEqual([]);
  expect(onSubmit).toHaveBeenCalledTimes(1);
});
