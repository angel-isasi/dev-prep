import { test, expect } from "vitest";
import { buscarPorEmail } from "./solucion.js";

const usuarios = [
  { id: 1, email: "ana@correo.com" },
  { id: 2, email: "Luis@Correo.com" },
  { id: 3, email: "rosa@correo.com" },
];

test("encuentra a un usuario que sí está registrado", () => {
  expect(buscarPorEmail(usuarios, "rosa@correo.com")).toEqual({ id: 3, email: "rosa@correo.com" });
});

test("no le importan las mayúsculas", () => {
  expect(buscarPorEmail(usuarios, "ANA@correo.com")?.id).toBe(1);
  expect(buscarPorEmail(usuarios, "luis@correo.com")?.id).toBe(2);
});

test("devuelve el mismo objeto de la lista, no una copia", () => {
  expect(buscarPorEmail(usuarios, "ana@correo.com")).toBe(usuarios[0]);
});

test("si el email no existe devuelve null", () => {
  expect(buscarPorEmail(usuarios, "nadie@correo.com")).toBeNull();
});
