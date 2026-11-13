import { test, expect } from "vitest";
import { prefijoComun } from "./solucion.js";

test("prefijo parcial: [\"flower\", \"flow\", \"flight\"] da \"fl\"", () => {
  expect(prefijoComun(["flower", "flow", "flight"])).toBe("fl");
});

test("sin prefijo común: [\"dog\", \"racecar\", \"car\"] da \"\"", () => {
  expect(prefijoComun(["dog", "racecar", "car"])).toBe("");
});

test("una palabra es prefijo de las otras: [\"casa\", \"casas\", \"casado\"]", () => {
  expect(prefijoComun(["casa", "casas", "casado"])).toBe("casa");
});

test("la palabra más corta no va primero: [\"casado\", \"casas\", \"cas\"]", () => {
  expect(prefijoComun(["casado", "casas", "cas"])).toBe("cas");
});

test("una sola palabra o arreglo vacío", () => {
  expect(prefijoComun(["solo"])).toBe("solo");
  expect(prefijoComun([])).toBe("");
});

test("con una cadena vacía o mayúsculas distintas no hay prefijo", () => {
  expect(prefijoComun(["", "abc"])).toBe("");
  expect(prefijoComun(["Casa", "casa"])).toBe("");
});
