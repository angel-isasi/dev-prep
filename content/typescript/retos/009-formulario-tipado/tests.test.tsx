// @vitest-environment jsdom
import { test, expect, expectTypeOf, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { FormularioRegistro, validarFormulario, type Formulario } from "./solucion";

function escribir(etiqueta: string, valor: string) {
  fireEvent.change(screen.getByLabelText(etiqueta), { target: { value: valor } });
}

const enviar = () => fireEvent.click(screen.getByRole("button", { name: "Registrarme" }));

test("tiene los tres campos con su etiqueta y el botón", () => {
  render(<FormularioRegistro onRegistrar={() => {}} />);
  expect((screen.getByLabelText("Nombre") as HTMLInputElement).value).toBe("");
  expect((screen.getByLabelText("Email") as HTMLInputElement).value).toBe("");
  expect((screen.getByLabelText("Contraseña") as HTMLInputElement).type).toBe("password");
  expect(screen.getByRole("button", { name: "Registrarme" })).toBeTruthy();
});

test("al escribir, cada input muestra su propio valor", () => {
  render(<FormularioRegistro onRegistrar={() => {}} />);
  escribir("Nombre", "Angel");
  escribir("Email", "angel@correo.pe");
  expect((screen.getByLabelText("Nombre") as HTMLInputElement).value).toBe("Angel");
  expect((screen.getByLabelText("Email") as HTMLInputElement).value).toBe("angel@correo.pe");
});

test("enviar vacío muestra los tres errores y no registra", () => {
  const onRegistrar = vi.fn();
  render(<FormularioRegistro onRegistrar={onRegistrar} />);
  enviar();
  expect(screen.getByText("El nombre es obligatorio")).toBeTruthy();
  expect(screen.getByText("El email no es válido")).toBeTruthy();
  expect(screen.getByText("La contraseña debe tener al menos 8 caracteres")).toBeTruthy();
  expect(onRegistrar).not.toHaveBeenCalled();
});

test("solo muestra los errores de los campos que están mal", () => {
  render(<FormularioRegistro onRegistrar={() => {}} />);
  escribir("Nombre", "Angel");
  escribir("Email", "angel-sin-arroba.pe");
  escribir("Contraseña", "12345678");
  enviar();
  expect(screen.getByText("El email no es válido")).toBeTruthy();
  expect(screen.queryByText("El nombre es obligatorio")).toBeNull();
  expect(screen.queryByText("La contraseña debe tener al menos 8 caracteres")).toBeNull();
});

test("con datos válidos llama a onRegistrar con el formulario y borra los errores", () => {
  const onRegistrar = vi.fn();
  render(<FormularioRegistro onRegistrar={onRegistrar} />);
  enviar(); // primero con errores
  escribir("Nombre", "Angel");
  escribir("Email", "angel@correo.pe");
  escribir("Contraseña", "secreta123");
  enviar();
  expect(onRegistrar).toHaveBeenCalledTimes(1);
  expect(onRegistrar).toHaveBeenCalledWith({ nombre: "Angel", email: "angel@correo.pe", password: "secreta123" });
  expect(screen.queryByText("El nombre es obligatorio")).toBeNull();
});

test("validarFormulario es una función pura que devuelve errores por campo", () => {
  expect(validarFormulario({ nombre: "  ", email: "a@b.pe", password: "corta" })).toEqual({
    nombre: "El nombre es obligatorio",
    password: "La contraseña debe tener al menos 8 caracteres",
  });
  expect(validarFormulario({ nombre: "Ana", email: "ana@correo.pe", password: "12345678" })).toEqual({});
});

test("los tipos del formulario (lo revisa tsc)", () => {
  expectTypeOf<Formulario>().toEqualTypeOf<{ nombre: string; email: string; password: string }>();
  expectTypeOf(validarFormulario).returns.toEqualTypeOf<Partial<Record<keyof Formulario, string>>>();
  const probar = () => (
    <>
      {/* @ts-expect-error onRegistrar recibe un Formulario, no un número */}
      <FormularioRegistro onRegistrar={(edad: number) => edad} />
      {/* @ts-expect-error onRegistrar es obligatorio */}
      <FormularioRegistro />
    </>
  );
  expect(typeof probar).toBe("function");
});
