// @vitest-environment jsdom
import { test, expect } from "vitest";
import { normalizarPedido } from "./solucion.jsx";

const BASE = { nombre: "Ana", correo: "ana@correo.pe", telefono: "987654321", cantidad: "2" };

const con = (cambios) => normalizarPedido({ ...BASE, ...cambios });

test("limpia un pedido completo", () => {
  expect(
    normalizarPedido({
      nombre: "  Angel   Isasi ",
      correo: " ANGEL@Unica.edu.pe ",
      telefono: "+51 987-654-321",
      cantidad: "abc",
    }),
  ).toEqual({ nombre: "Angel Isasi", correo: "angel@unica.edu.pe", telefono: "51987654321", cantidad: 1 });
});

test("el nombre queda sin espacios en los extremos y con uno solo entre palabras", () => {
  expect(con({ nombre: "   María    del   Pilar  " }).nombre).toBe("María del Pilar");
});

test("el correo queda en minúsculas y sin espacios", () => {
  expect(con({ correo: "  Rosa.Quispe@GMAIL.com" }).correo).toBe("rosa.quispe@gmail.com");
});

test("el teléfono conserva solo los dígitos", () => {
  expect(con({ telefono: "(056) 21-3456" }).telefono).toBe("056213456");
});

test("la cantidad es un entero de al menos 1", () => {
  expect(con({ cantidad: "3" }).cantidad).toBe(3);
  expect(con({ cantidad: "2.7" }).cantidad).toBe(2);
  expect(con({ cantidad: "" }).cantidad).toBe(1);
  expect(con({ cantidad: "0" }).cantidad).toBe(1);
  expect(con({ cantidad: "-3" }).cantidad).toBe(1);
});

test("no modifica el objeto que recibe", () => {
  const formulario = { nombre: " Luis ", correo: " L@X.PE ", telefono: "9-8-7", cantidad: "x" };
  const copia = { ...formulario };
  const limpio = normalizarPedido(formulario);
  expect(formulario).toEqual(copia);
  expect(limpio).not.toBe(formulario);
});
