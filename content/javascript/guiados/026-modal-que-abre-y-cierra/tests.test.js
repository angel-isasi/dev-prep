// @vitest-environment jsdom
import { test, expect, afterEach } from "vitest";
import { montarModal } from "./solucion.js";

afterEach(() => {
  document.body.innerHTML = "";
});

function montar(titulo = "¿Eliminar tarea?", texto = "Esta acción no se puede deshacer.") {
  const contenedor = document.createElement("div");
  document.body.append(contenedor);
  montarModal(contenedor, titulo, texto);
  return {
    contenedor,
    abrir: contenedor.querySelector(".abrir"),
    fondo: contenedor.querySelector(".fondo"),
    modal: contenedor.querySelector(".modal"),
    cerrar: contenedor.querySelector(".cerrar"),
  };
}

const tecla = (key) => document.dispatchEvent(new KeyboardEvent("keydown", { key }));

test("arma el botón y el modal empieza cerrado", () => {
  const { abrir, fondo, modal } = montar();
  expect(abrir.textContent).toBe("Abrir");
  expect(fondo.hidden).toBe(true);
  expect(fondo.contains(modal)).toBe(true);
  expect(modal.querySelector("h2").textContent).toBe("¿Eliminar tarea?");
  expect(modal.querySelector("p").textContent).toBe("Esta acción no se puede deshacer.");
  expect(modal.querySelector(".cerrar").textContent).toBe("Cerrar");
});

test("el botón Abrir muestra el modal", () => {
  const { abrir, fondo } = montar();
  abrir.click();
  expect(fondo.hidden).toBe(false);
});

test("el botón Cerrar lo oculta", () => {
  const { abrir, fondo, cerrar } = montar();
  abrir.click();
  cerrar.click();
  expect(fondo.hidden).toBe(true);
});

test("un clic en el fondo lo cierra, pero un clic dentro de la caja no", () => {
  const { abrir, fondo, modal } = montar();
  abrir.click();
  modal.click();
  modal.querySelector("p").click();
  modal.querySelector("h2").click();
  expect(fondo.hidden).toBe(false);
  fondo.click();
  expect(fondo.hidden).toBe(true);
});

test("Escape lo cierra; otras teclas no", () => {
  const { abrir, fondo } = montar();
  abrir.click();
  tecla("Enter");
  expect(fondo.hidden).toBe(false);
  tecla("Escape");
  expect(fondo.hidden).toBe(true);
});

test("muestra el título y el texto como texto, no como HTML", () => {
  const { modal } = montar("<i>Hola</i>", '<img src="x">');
  expect(modal.querySelector("h2").textContent).toBe("<i>Hola</i>");
  expect(modal.querySelector("i")).toBeNull();
  expect(modal.querySelector("img")).toBeNull();
});
