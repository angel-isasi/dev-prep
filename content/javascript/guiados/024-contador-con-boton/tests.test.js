// @vitest-environment jsdom
import { test, expect } from "vitest";
import { montarContador } from "./solucion.js";

function montar(inicial) {
  const contenedor = document.createElement("div");
  montarContador(contenedor, inicial);
  return {
    contenedor,
    valor: contenedor.querySelector(".valor"),
    sumar: contenedor.querySelector(".sumar"),
    reiniciar: contenedor.querySelector(".reiniciar"),
  };
}

test("arma el span y los dos botones dentro del contenedor", () => {
  const { contenedor, valor, sumar, reiniciar } = montar();
  expect(contenedor.children.length).toBe(3);
  expect(valor.tagName).toBe("SPAN");
  expect(valor.textContent).toBe("0");
  expect(sumar.tagName).toBe("BUTTON");
  expect(sumar.textContent).toBe("+1");
  expect(reiniciar.tagName).toBe("BUTTON");
  expect(reiniciar.textContent).toBe("Reiniciar");
});

test("cada clic en +1 suma 1", () => {
  const { valor, sumar } = montar();
  sumar.click();
  expect(valor.textContent).toBe("1");
  sumar.click();
  sumar.click();
  expect(valor.textContent).toBe("3");
});

test("empieza en el valor inicial", () => {
  const { valor, sumar } = montar(5);
  expect(valor.textContent).toBe("5");
  sumar.click();
  expect(valor.textContent).toBe("6");
});

test("reiniciar vuelve al valor inicial y se sigue contando desde ahí", () => {
  const { valor, sumar, reiniciar } = montar(2);
  sumar.click();
  sumar.click();
  expect(valor.textContent).toBe("4");
  reiniciar.click();
  expect(valor.textContent).toBe("2");
  sumar.click();
  expect(valor.textContent).toBe("3");
});

test("dos contadores no comparten la cuenta", () => {
  const a = montar();
  const b = montar(10);
  a.sumar.click();
  a.sumar.click();
  b.sumar.click();
  expect(a.valor.textContent).toBe("2");
  expect(b.valor.textContent).toBe("11");
});
