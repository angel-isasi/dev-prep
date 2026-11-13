// @vitest-environment jsdom
import { test, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Votacion } from "./solucion.jsx";

const CORTOS = [
  { id: 1, titulo: "Bajo la arena" },
  { id: 2, titulo: "Luz de desierto" },
];

const boton = (texto) => screen.getByText(texto);

test("muestra un botón habilitado por cada corto", () => {
  render(<Votacion cortos={CORTOS} onVotar={vi.fn()} />);
  expect(boton("Votar por Bajo la arena").disabled).toBe(false);
  expect(boton("Votar por Luz de desierto").disabled).toBe(false);
});

test("al votar con éxito marca el elegido y bloquea todos los botones", async () => {
  const onVotar = vi.fn().mockResolvedValue(true);
  render(<Votacion cortos={CORTOS} onVotar={onVotar} />);
  fireEvent.click(boton("Votar por Bajo la arena"));
  expect(await screen.findByText("✓ Votaste por Bajo la arena")).toBeTruthy();
  expect(onVotar).toHaveBeenCalledWith(1);
  expect(boton("✓ Votaste por Bajo la arena").disabled).toBe(true);
  expect(boton("Votar por Luz de desierto").disabled).toBe(true);
});

test("mientras se envía bloquea los botones para evitar el doble clic", () => {
  // Una promesa que nunca termina: el voto se queda "enviando".
  const onVotar = vi.fn(() => new Promise(() => {}));
  render(<Votacion cortos={CORTOS} onVotar={onVotar} />);
  fireEvent.click(boton("Votar por Bajo la arena"));
  expect(boton("Votar por Bajo la arena").disabled).toBe(true);
  expect(boton("Votar por Luz de desierto").disabled).toBe(true);
  fireEvent.click(boton("Votar por Luz de desierto"));
  expect(onVotar).toHaveBeenCalledTimes(1);
});

test("si falla muestra un error y permite reintentar", async () => {
  const onVotar = vi.fn().mockRejectedValueOnce(new Error("red")).mockResolvedValue(true);
  render(<Votacion cortos={CORTOS} onVotar={onVotar} />);
  fireEvent.click(boton("Votar por Bajo la arena"));
  expect(await screen.findByRole("alert")).toBeTruthy();
  expect(boton("Votar por Bajo la arena").disabled).toBe(false);

  fireEvent.click(boton("Votar por Bajo la arena"));
  expect(await screen.findByText("✓ Votaste por Bajo la arena")).toBeTruthy();
  expect(screen.queryByRole("alert")).toBeNull();
  expect(onVotar).toHaveBeenCalledTimes(2);
});

test("después de votar ya no se puede votar por otro", async () => {
  const onVotar = vi.fn().mockResolvedValue(true);
  render(<Votacion cortos={CORTOS} onVotar={onVotar} />);
  fireEvent.click(boton("Votar por Luz de desierto"));
  await screen.findByText("✓ Votaste por Luz de desierto");
  fireEvent.click(boton("Votar por Bajo la arena"));
  expect(onVotar).toHaveBeenCalledTimes(1);
  expect(onVotar).toHaveBeenCalledWith(2);
});
