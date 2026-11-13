// @vitest-environment jsdom
import { test, expect, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { CargarMas } from "./solucion.jsx";

const PAGINAS = {
  1: { datos: ["n1", "n2"], siguiente: true },
  2: { datos: ["n3", "n4"], siguiente: true },
  3: { datos: ["n5"], siguiente: false },
};

const textos = () => screen.queryAllByRole("listitem").map((li) => li.textContent);

test("al montar carga la página 1", async () => {
  const obtenerPagina = vi.fn(async (n) => PAGINAS[n]);
  render(<CargarMas obtenerPagina={obtenerPagina} />);
  await screen.findByText("n2");
  expect(textos()).toEqual(["n1", "n2"]);
  expect(obtenerPagina).toHaveBeenCalledWith(1);
});

test('"Cargar más" agrega la página siguiente al final', async () => {
  const obtenerPagina = vi.fn(async (n) => PAGINAS[n]);
  render(<CargarMas obtenerPagina={obtenerPagina} />);
  await screen.findByText("n2");
  fireEvent.click(screen.getByText("Cargar más"));
  await screen.findByText("n4");
  expect(textos()).toEqual(["n1", "n2", "n3", "n4"]);
  expect(obtenerPagina).toHaveBeenLastCalledWith(2);
});

test("el botón desaparece cuando no hay más páginas", async () => {
  render(<CargarMas obtenerPagina={async (n) => PAGINAS[n]} />);
  await screen.findByText("n2");
  fireEvent.click(screen.getByText("Cargar más"));
  await screen.findByText("n4");
  fireEvent.click(screen.getByText("Cargar más"));
  await screen.findByText("n5");
  expect(textos()).toEqual(["n1", "n2", "n3", "n4", "n5"]);
  expect(screen.queryByText("Cargar más")).toBeNull();
});

test("mientras carga dice Cargando… y está deshabilitado", async () => {
  let resolverPagina2;
  const obtenerPagina = vi.fn((n) => {
    if (n === 1) return Promise.resolve(PAGINAS[1]);
    return new Promise((resolver) => {
      resolverPagina2 = resolver;
    });
  });
  render(<CargarMas obtenerPagina={obtenerPagina} />);
  await screen.findByText("n2");

  fireEvent.click(screen.getByText("Cargar más"));
  const boton = screen.getByRole("button");
  expect(boton.textContent).toBe("Cargando…");
  expect(boton.disabled).toBe(true);

  // Un segundo clic mientras carga no pide otra página
  fireEvent.click(boton);
  expect(obtenerPagina).toHaveBeenCalledTimes(2);

  await act(async () => resolverPagina2(PAGINAS[2]));
  expect(screen.getByText("Cargar más")).toBeTruthy();
  expect(textos()).toEqual(["n1", "n2", "n3", "n4"]);
});
