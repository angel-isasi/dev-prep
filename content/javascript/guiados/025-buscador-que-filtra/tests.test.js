// @vitest-environment jsdom
import { test, expect } from "vitest";
import { montarBuscador } from "./solucion.js";

const NOMBRES = ["Ana", "Bruno", "Mariana", "Luis", "Juan"];

function montar(nombres = NOMBRES) {
  const contenedor = document.createElement("div");
  montarBuscador(contenedor, nombres);
  return {
    contenedor,
    input: contenedor.querySelector("input"),
    lista: contenedor.querySelector("ul"),
  };
}

function escribir(input, texto) {
  input.value = texto;
  input.dispatchEvent(new Event("input"));
}

const textos = (lista) => [...lista.children].map((li) => li.textContent);

test("arma el input y la lista con todos los nombres", () => {
  const { contenedor, input, lista } = montar();
  expect(contenedor.children.length).toBe(2);
  expect(input.type).toBe("search");
  expect(input.placeholder).toBe("Buscar...");
  expect(textos(lista)).toEqual(NOMBRES);
});

test("filtra mientras escribes", () => {
  const { input, lista } = montar();
  escribir(input, "an");
  expect(textos(lista)).toEqual(["Ana", "Mariana", "Juan"]);
  escribir(input, "ana");
  expect(textos(lista)).toEqual(["Ana", "Mariana"]);
});

test("no distingue mayúsculas e ignora espacios a los costados", () => {
  const { input, lista } = montar();
  escribir(input, "  LU ");
  expect(textos(lista)).toEqual(["Luis"]);
});

test("sin coincidencias muestra un solo li 'Sin resultados'", () => {
  const { input, lista } = montar();
  escribir(input, "zzz");
  expect(lista.children.length).toBe(1);
  expect(lista.children[0].textContent).toBe("Sin resultados");
  expect(lista.children[0].classList.contains("vacio")).toBe(true);
});

test("al borrar el texto vuelven todos los nombres", () => {
  const { input, lista } = montar();
  escribir(input, "zzz");
  escribir(input, "");
  expect(textos(lista)).toEqual(NOMBRES);
});

test("no modifica el arreglo original y muestra los nombres como texto", () => {
  const nombres = ["<b>Ana</b>", "Bruno"];
  const { input, lista } = montar(nombres);
  escribir(input, "bru");
  expect(nombres).toEqual(["<b>Ana</b>", "Bruno"]);
  escribir(input, "");
  expect(lista.children[0].textContent).toBe("<b>Ana</b>");
  expect(lista.querySelector("b")).toBeNull();
});
