import { describe, expect, it } from "vitest";
import { crearVoz, limpiarParaVoz, lineaJson } from "./voz.js";

describe("voz neuronal", () => {
  it("manda el texto como JSON solo con ASCII (las tildes llegan bien en Windows)", () => {
    const linea = lineaJson("Así no vale, ¿sí?");
    expect(linea).toMatch(/^[\x20-\x7e]+$/);
    expect(JSON.parse(linea).text).toBe("Así no vale, ¿sí?");
  });

  it("limpia lo que no se debe leer en voz alta", () => {
    expect(limpiarParaVoz("Usa `map` y **no** mutes.\n\n```js\nx()\n```\nListo")).toBe("Usa map y no mutes. Listo");
    expect(limpiarParaVoz("a".repeat(2000))).toHaveLength(900);
  });

  it("sin programa instalado no hay voces y sintetizar falla sin romper nada", async () => {
    const voz = crearVoz({ datosDir: "carpeta-que-no-existe" });
    expect(await voz.voces()).toEqual([]);
    await expect(voz.sintetizar("hola")).rejects.toThrow();
  });
});
