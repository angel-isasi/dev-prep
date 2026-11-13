import { test, expect, vi, afterEach } from "vitest";
import { usuario, saludoLigado } from "./solucion.js";

afterEach(() => {
  vi.useRealTimers();
});

test("saludar usa el nombre del usuario", () => {
  expect(usuario.saludar()).toBe("Hola, soy Angel");
});

test("saludar lee el nombre con this: depende de quién lo llama", () => {
  const rosa = { nombre: "Rosa", saludar: usuario.saludar };
  expect(rosa.saludar()).toBe("Hola, soy Rosa");
});

test("saludarLuego se cumple con el nombre a los 100 ms", async () => {
  vi.useFakeTimers();
  let valor;
  usuario.saludarLuego().then((v) => {
    valor = v;
  });
  await vi.advanceTimersByTimeAsync(99);
  expect(valor, "a los 99 ms todavía no debería cumplirse").toBeUndefined();
  await vi.advanceTimersByTimeAsync(1);
  expect(valor).toBe("Angel");
});

test("saludarLuego conserva el this dentro del setTimeout", async () => {
  vi.useFakeTimers();
  const luis = { nombre: "Luis", saludarLuego: usuario.saludarLuego };
  const promesa = luis.saludarLuego();
  await vi.advanceTimersByTimeAsync(100);
  await expect(promesa).resolves.toBe("Luis");
});

test("saludoLigado funciona suelto y no cambia de dueño", () => {
  expect(typeof saludoLigado).toBe("function");
  const suelta = saludoLigado;
  expect(suelta()).toBe("Hola, soy Angel");
  const otro = { nombre: "Rosa", saludar: saludoLigado };
  expect(otro.saludar(), "una función ligada ignora quién la llama").toBe("Hola, soy Angel");
});
