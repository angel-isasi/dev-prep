// @vitest-environment jsdom
import { test, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Perfil } from "./solucion.jsx";

const ALUMNOS = { 1: { nombre: "Ana Torres" }, 2: { nombre: "Luis Paredes" } };
const crearCargador = () => vi.fn((id) => Promise.resolve(ALUMNOS[id]));

test("al cambiar de alumno, muestra al nuevo", async () => {
  const cargarAlumno = crearCargador();
  const { rerender } = render(<Perfil id={1} cargarAlumno={cargarAlumno} />);
  await screen.findByRole("heading", { name: "Ana Torres" });
  rerender(<Perfil id={2} cargarAlumno={cargarAlumno} />);
  expect(await screen.findByRole("heading", { name: "Luis Paredes" })).toBeTruthy();
});

test("pide los datos del id nuevo", async () => {
  const cargarAlumno = crearCargador();
  const { rerender } = render(<Perfil id={1} cargarAlumno={cargarAlumno} />);
  await screen.findByRole("heading");
  rerender(<Perfil id={2} cargarAlumno={cargarAlumno} />);
  await screen.findByRole("heading", { name: "Luis Paredes" }).catch(() => {});
  expect(cargarAlumno).toHaveBeenLastCalledWith(2);
});

test("muestra Cargando… y luego el nombre", async () => {
  render(<Perfil id={1} cargarAlumno={crearCargador()} />);
  expect(screen.getByText("Cargando…")).toBeTruthy();
  expect(await screen.findByRole("heading", { name: "Ana Torres" })).toBeTruthy();
});

test("si el id no cambia, no vuelve a pedir los datos", async () => {
  const cargarAlumno = crearCargador();
  const { rerender } = render(<Perfil id={1} cargarAlumno={cargarAlumno} />);
  await screen.findByRole("heading");
  rerender(<Perfil id={1} cargarAlumno={cargarAlumno} />);
  expect(cargarAlumno).toHaveBeenCalledTimes(1);
});
