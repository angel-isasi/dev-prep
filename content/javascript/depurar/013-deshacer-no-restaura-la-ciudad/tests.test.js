import { test, expect } from "vitest";
import { cambiarCiudad } from "./solucion.js";

const crearUsuario = () => ({
  nombre: "Ana",
  direccion: { calle: "Av. Sol 123", ciudad: "Lima" },
});

test("devuelve el usuario con la ciudad nueva", () => {
  expect(cambiarCiudad(crearUsuario(), "Cusco")).toEqual({
    nombre: "Ana",
    direccion: { calle: "Av. Sol 123", ciudad: "Cusco" },
  });
});

test("el usuario original sigue en su ciudad (se puede deshacer)", () => {
  const antes = crearUsuario();
  cambiarCiudad(antes, "Cusco");
  expect(antes.direccion.ciudad).toBe("Lima");
});

test("la dirección nueva es otro objeto, no la misma", () => {
  const antes = crearUsuario();
  const despues = cambiarCiudad(antes, "Arequipa");
  expect(despues).not.toBe(antes);
  expect(despues.direccion).not.toBe(antes.direccion);
});

test("cambiar dos veces no mezcla los resultados", () => {
  const antes = crearUsuario();
  const cusco = cambiarCiudad(antes, "Cusco");
  const piura = cambiarCiudad(antes, "Piura");
  expect(cusco.direccion.ciudad).toBe("Cusco");
  expect(piura.direccion.ciudad).toBe("Piura");
});
