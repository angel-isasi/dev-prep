import { expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

export async function probarBoletin(Boletin) {
  // 1. Preparar: una función espía en lugar de la real y un "usuario" simulado.
  const onSuscribir = vi.fn();
  const usuario = userEvent.setup();
  render(<Boletin onSuscribir={onSuscribir} />);

  // Buscamos los elementos como los encuentra una persona: por su etiqueta y su rol.
  const campo = screen.getByLabelText("Correo");
  const boton = screen.getByRole("button", { name: "Suscribirme" });

  // 2. Caso inválido: escribe sin "@" y envía.
  await usuario.type(campo, "angel");
  await usuario.click(boton);
  expect(screen.getByRole("alert").textContent).toBe("Ingresa un correo válido");
  expect(onSuscribir).not.toHaveBeenCalled();

  // 3. Caso válido: completa el correo y vuelve a enviar.
  await usuario.type(campo, "@unica.edu.pe");
  await usuario.click(boton);
  expect(onSuscribir).toHaveBeenCalledTimes(1);
  expect(onSuscribir).toHaveBeenCalledWith("angel@unica.edu.pe");
  expect(screen.queryByRole("alert")).toBeNull();
}
