import { test, expect } from "vitest";
import { presentar } from "./solucion.js";

test("arma la frase con los tres datos", () => {
  expect(presentar("Ana", 20, "Lima")).toBe("Me llamo Ana, tengo 20 años y vivo en Lima.");
});

test("funciona con otros datos", () => {
  expect(presentar("Rosa", 35, "Cusco")).toBe("Me llamo Rosa, tengo 35 años y vivo en Cusco.");
});

test("quita los espacios de sobra del nombre y la ciudad", () => {
  expect(presentar("  Luis ", 19, " Arequipa ")).toBe("Me llamo Luis, tengo 19 años y vivo en Arequipa.");
});

test("la edad 0 también se muestra", () => {
  expect(presentar("Bebé", 0, "Ica")).toBe("Me llamo Bebé, tengo 0 años y vivo en Ica.");
});
