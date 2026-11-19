import { expect, test } from "vitest";
import { estaOcupado } from "./ocupado.js";

test("la app se actualiza sola solo fuera de lo que una recarga cortaría", () => {
  for (const libre of ["/", "/aprender", "/practicar", "/practicar/lista", "/ingles", "/ingles/historias", "/progreso", "/ajustes"]) {
    expect(estaOcupado({ pathname: libre })).toBe(false);
  }
  for (const ocupado of ["/leccion", "/enfoque", "/practicar/js-ej-001", "/ingles/historia/h1", "/ingles/parejas", "/revision/03"]) {
    expect(estaOcupado({ pathname: ocupado })).toBe(true);
  }
  expect(estaOcupado({ pathname: "/entrevistas", search: "?pestana=simulacro" })).toBe(true);
  expect(estaOcupado({ pathname: "/entrevistas", search: "?pestana=etapas" })).toBe(false);
});
