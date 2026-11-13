// @vitest-environment jsdom
import { test, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { obtenerConCache, Detalle } from "./solucion.jsx";

// Ojo: la caché es compartida por todo el archivo, por eso cada test usa claves distintas.

test("obtenerConCache llama a cargar una sola vez por clave", async () => {
  const cargar = vi.fn(async (clave) => `dato de ${clave}`);
  const primera = obtenerConCache("menu", cargar);
  const segunda = obtenerConCache("menu", cargar);
  expect(primera).toBe(segunda);
  expect(await primera).toBe("dato de menu");
  expect(cargar).toHaveBeenCalledTimes(1);
  expect(cargar).toHaveBeenCalledWith("menu");
});

test("muestra Cargando… y luego el dato", async () => {
  render(<Detalle id={10} cargar={async (id) => `Pizza ${id}`} />);
  expect(screen.getByText("Cargando…")).toBeTruthy();
  expect(await screen.findByText("Pizza 10")).toBeTruthy();
});

test("al volver a un id ya visto no repite la petición", async () => {
  const cargar = vi.fn(async (id) => `Pizza ${id}`);
  const { rerender } = render(<Detalle id={1} cargar={cargar} />);
  await screen.findByText("Pizza 1");
  rerender(<Detalle id={2} cargar={cargar} />);
  await screen.findByText("Pizza 2");
  rerender(<Detalle id={1} cargar={cargar} />);
  await screen.findByText("Pizza 1");
  expect(cargar).toHaveBeenCalledTimes(2);
});

test("dos componentes con el mismo id comparten una sola petición", async () => {
  const cargar = vi.fn(async (id) => `Pizza ${id}`);
  render(
    <>
      <Detalle id={50} cargar={cargar} />
      <Detalle id={50} cargar={cargar} />
    </>
  );
  await screen.findAllByText("Pizza 50");
  expect(screen.getAllByText("Pizza 50").length).toBe(2);
  expect(cargar).toHaveBeenCalledTimes(1);
});
