import { test, expect } from "vitest";
import { todasONada, resumenDeEstados, primeraEnTerminar, primeraExitosa } from "./solucion.js";

const ok = (valor, ms) => new Promise((r) => setTimeout(() => r(valor), ms));

// Promesa que se rechaza. El .catch vacío evita avisos de "rechazo sin manejar"
// si tu función todavía no la usa; quien la reciba igual verá el rechazo.
const ko = (mensaje, ms) => {
  const p = new Promise((_, rechazar) => setTimeout(() => rechazar(new Error(mensaje)), ms));
  p.catch(() => {});
  return p;
};

test("todasONada: se cumple con todos los valores en orden", async () => {
  await expect(todasONada([ok("a", 5), ok("b", 1)])).resolves.toEqual(["a", "b"]);
});

test("todasONada: si una falla, se rechaza con ese error", async () => {
  await expect(todasONada([ok("a", 5), ko("b", 1)])).rejects.toThrow("b");
});

test("resumenDeEstados: devuelve el estado de cada una y no se rechaza", async () => {
  await expect(resumenDeEstados([ok("a", 5), ko("b", 1)])).resolves.toEqual(["fulfilled", "rejected"]);
  await expect(resumenDeEstados([ko("x", 1), ko("y", 2)])).resolves.toEqual(["rejected", "rejected"]);
});

test("primeraEnTerminar: gana la más rápida, aunque falle", async () => {
  await expect(primeraEnTerminar([ok("lenta", 30), ok("rápida", 5)])).resolves.toBe("rápida");
  await expect(primeraEnTerminar([ko("falló", 1), ok("lenta", 30)])).rejects.toThrow("falló");
});

test("primeraExitosa: ignora las que fallan y se queda con la primera que sale bien", async () => {
  await expect(primeraExitosa([ko("x", 1), ok("primera ok", 10), ok("segunda ok", 20)])).resolves.toBe(
    "primera ok",
  );
});

test("primeraExitosa: solo se rechaza si todas fallan", async () => {
  await expect(primeraExitosa([ko("x", 1), ko("y", 2)])).rejects.toBeInstanceOf(AggregateError);
});
