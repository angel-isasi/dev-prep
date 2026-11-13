import { test, expect, vi, afterEach } from "vitest";
import { sumarTres } from "./solucion.js";

afterEach(() => {
  vi.useRealTimers();
});

test("devuelve una promesa", () => {
  expect(sumarTres(1, 2, 3)).toBeInstanceOf(Promise);
});

test("suma tres números", async () => {
  expect(await sumarTres(1, 2, 3)).toBe(6);
});

test("funciona con negativos y con cero", async () => {
  expect(await sumarTres(10, -4, 0)).toBe(6);
  expect(await sumarTres(0, 0, 0)).toBe(0);
});

test("usa sumarLento dos veces, una después de otra (tarda 20 ms)", async () => {
  vi.useFakeTimers();
  let total;
  sumarTres(1, 2, 3).then((valor) => {
    total = valor;
  });

  await vi.advanceTimersByTimeAsync(10);
  expect(total, "a los 10 ms solo debería ir la primera suma").toBeUndefined();

  await vi.advanceTimersByTimeAsync(10);
  expect(total).toBe(6);
});
