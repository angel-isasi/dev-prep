import { describe, test, expect } from "vitest";
import { analizarLineas, barajar, codigoSinComentarios, hayRepetidas, mezclarOpciones, normalizar, primeraOracion, slug } from "./util.js";

describe("analizarLineas", () => {
  test("separa el código del comentario de cada línea", () => {
    const lineas = analizarLineas("const a = 1; // uno\n// solo comentario\nconst b = 2;");
    expect(lineas).toEqual([
      { codigo: "const a = 1;", comentario: "uno" },
      { codigo: "", comentario: "solo comentario" },
      { codigo: "const b = 2;", comentario: null },
    ]);
  });

  test("no confunde // dentro de strings, template literals ni regex", () => {
    const fuente = 'const url = "http://x.pe";\nconst t = `a // b ${"c"}`;\nconst r = /\\/\\//g; // fin';
    const lineas = analizarLineas(fuente);
    expect(lineas[0]).toEqual({ codigo: 'const url = "http://x.pe";', comentario: null });
    expect(lineas[1].codigo).toBe('const t = `a // b ${"c"}`;');
    expect(lineas[2]).toEqual({ codigo: "const r = /\\/\\//g;", comentario: "fin" });
  });

  test("quita comentarios de bloque y de JSX sin cambiar la cantidad de líneas", () => {
    const fuente = "/* a\n b */\nconst x = 1;\n<div>\n  {/* nota */}\n</div>";
    const lineas = analizarLineas(fuente).map((l) => l.codigo);
    expect(lineas).toEqual(["", "", "const x = 1;", "<div>", "", "</div>"]);
  });

  test("codigoSinComentarios marca las líneas que eran solo comentario", () => {
    const r = codigoSinComentarios("// hola\n\nconst a = 1;");
    expect(r.map((l) => l.eraComentario)).toEqual([true, false, false]);
  });
});

describe("opciones", () => {
  test("normalizar ignora espacios, mayúsculas y el tipo de comilla", () => {
    expect(normalizar("[1, 2]")).toBe(normalizar("[1,2]"));
    expect(normalizar("'a'")).toBe(normalizar('"A"'));
    expect(hayRepetidas(["`map`", "` map `", "`filter`"])).toBe(true);
  });

  test("mezclarOpciones es determinista y apunta a la correcta", () => {
    const a = mezclarOpciones("ok", ["x", "y", "z"], "semilla");
    const b = mezclarOpciones("ok", ["x", "y", "z"], "semilla");
    expect(a).toEqual(b);
    expect(a.opciones[a.correcta]).toBe("ok");
    expect([...a.opciones].sort()).toEqual(["ok", "x", "y", "z"]);
  });

  test("mezclarOpciones devuelve null si hay opciones repetidas", () => {
    expect(mezclarOpciones("true", ["TRUE", "false", "null"], "s")).toBeNull();
  });

  test("barajar no pierde elementos y depende de la semilla", () => {
    const lista = [1, 2, 3, 4, 5, 6, 7, 8];
    expect([...barajar(lista, "a")].sort()).toEqual(lista);
    expect(barajar(lista, "a")).toEqual(barajar(lista, "a"));
  });
});

describe("textos", () => {
  test("slug y primera oración", () => {
    expect(slug("Map, Set y otros")).toBe("map-set-y-otros");
    expect(slug("Números y Math")).toBe("numeros-y-math");
    expect(primeraOracion("Une `a.b` con otros. Luego más.")).toBe("Une `a.b` con otros.");
  });
});
