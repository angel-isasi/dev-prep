// @vitest-environment jsdom
import { test, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Contacto } from "./solucion.jsx";

function llenar(nombre, mensaje) {
  fireEvent.change(screen.getByLabelText("Nombre"), { target: { value: nombre } });
  fireEvent.change(screen.getByLabelText("Mensaje"), { target: { value: mensaje } });
}

test("al enviar llama a onEnviar con los datos del formulario", () => {
  const onEnviar = vi.fn();
  render(<Contacto onEnviar={onEnviar} />);
  llenar("Angel", "Sin cebolla");
  fireEvent.click(screen.getByText("Enviar"));
  expect(onEnviar).toHaveBeenCalledWith({ nombre: "Angel", mensaje: "Sin cebolla" });
});

test("llama a onEnviar una sola vez por envío", () => {
  const onEnviar = vi.fn();
  render(<Contacto onEnviar={onEnviar} />);
  llenar("Rosa", "Extra queso");
  fireEvent.click(screen.getByText("Enviar"));
  expect(onEnviar).toHaveBeenCalledTimes(1);
});

test("limpia los campos después de enviar", () => {
  render(<Contacto onEnviar={vi.fn()} />);
  llenar("Angel", "Sin cebolla");
  fireEvent.click(screen.getByText("Enviar"));
  expect(screen.getByLabelText("Nombre").value).toBe("");
  expect(screen.getByLabelText("Mensaje").value).toBe("");
});

test("no envía si el nombre está vacío", () => {
  const onEnviar = vi.fn();
  render(<Contacto onEnviar={onEnviar} />);
  llenar("", "Sin cebolla");
  fireEvent.click(screen.getByText("Enviar"));
  expect(onEnviar).not.toHaveBeenCalled();
});

test("el mensaje es un textarea", () => {
  render(<Contacto onEnviar={vi.fn()} />);
  expect(screen.getByLabelText("Mensaje").tagName).toBe("TEXTAREA");
});
