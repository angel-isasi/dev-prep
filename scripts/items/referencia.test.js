import { describe, test, expect } from "vitest";
import {
  descripcionCorta,
  enmascarar,
  generarDevuelve,
  generarEmparejar,
  generarMetodo,
  lineasConResultado,
  nombreCorto,
  palabrasDelNombre,
  separarAclaracion,
  tipoValor,
} from "./referencia.js";

const entrada = (id, nombre, descripcion, ejemplo = "x; // 1", categoria = "Arrays") => ({
  id,
  nombre,
  firma: `${nombre}`,
  descripcion,
  ejemplo,
  devuelve: "algo",
  errorTipico: "algo",
  categoria,
});

const ARRAYS = [
  entrada("array-push", "Array.prototype.push()", "Agrega elementos al final del arreglo. Modifica el original.", "const a = [1, 2];\na.push(3); // 3\na; // [1, 2, 3]"),
  entrada("array-pop", "Array.prototype.pop()", "Quita el último elemento y lo devuelve.", "const a = [1, 2, 3];\na.pop(); // 3\na; // [1, 2]\n[].pop(); // undefined"),
  entrada("array-shift", "Array.prototype.shift()", "Quita el primer elemento y lo devuelve.", "[1, 2].shift(); // 1"),
  entrada("array-join", "Array.prototype.join()", "Une todos los elementos en un solo string.", '["a", "b"].join("-"); // "a-b"'),
  entrada("array-includes", "Array.prototype.includes()", "Indica si el arreglo contiene un valor.", "[1, 2].includes(2); // true\n[1, 2].includes(5); // false"),
  entrada("array-indexof", "Array.prototype.indexOf() y lastIndexOf()", "Devuelve la primera posición (`lastIndexOf` devuelve la última).", '["a"].indexOf("a"); // 0'),
  entrada("array-some", "Array.prototype.some()", "Indica si al menos uno cumple.", "[1].some((n) => n > 0); // true"),
];

describe("nombres", () => {
  test("nombreCorto quita Array.prototype. y las aclaraciones entre paréntesis", () => {
    expect(nombreCorto("Array.prototype.push()")).toBe("push()");
    expect(nombreCorto("Intl.NumberFormat (soles)")).toBe("Intl.NumberFormat");
    expect(nombreCorto("Array.isArray()")).toBe("Array.isArray()");
  });

  test("enmascarar tapa el nombre del método, también dentro de código en línea", () => {
    const palabras = palabrasDelNombre("Array.prototype.indexOf() y lastIndexOf()");
    expect(palabras).toEqual(expect.arrayContaining(["indexOf", "lastIndexOf"]));
    const { texto, cambios } = enmascarar("La primera (`lastIndexOf` da la última).", palabras);
    expect(texto).toBe("La primera (`___` da la última).");
    expect(cambios).toBe(1);
    expect(enmascarar("Usa `with(i, v)` para cambiar.", ["with"]).texto).toBe("Usa `___(i, v)` para cambiar.");
    expect(enmascarar("Un Set guarda valores.", ["Set"]).texto).toBe("Un `___` guarda valores.");
  });
});

describe("¿Qué usarías?", () => {
  test("pregunta con la descripción y opciones de la misma categoría, sin confundibles", () => {
    const items = generarMetodo(ARRAYS);
    const push = items.find((i) => i.clave === "metodo:array-push");
    expect(push).toMatchObject({ tipo: "opcion", subtipo: "metodo", unidad: "arrays" });
    expect(push.pregunta).toContain("Agrega elementos al final");
    expect(push.opciones[push.correcta]).toBe("push()");
    expect(push.opciones).toHaveLength(4);
    expect(push.fuente).toEqual({ tipo: "referencia", id: "array-push", titulo: "Array.prototype.push()" });
    // includes, indexOf y some se parecen demasiado: no van juntas
    const includes = items.find((i) => i.clave === "metodo:array-includes");
    expect(includes.opciones).not.toContain("indexOf() y lastIndexOf()");
    expect(includes.opciones).not.toContain("some()");
  });

  test("si la descripción nombra al método, se enmascara", () => {
    const indexOf = generarMetodo(ARRAYS).find((i) => i.clave === "metodo:array-indexof");
    expect(indexOf.pregunta).not.toMatch(/lastIndexOf/);
    expect(indexOf.pregunta).toContain("`___`");
  });
});

describe("emparejar", () => {
  test("grupos fijos de 4 entradas de una categoría, con la descripción corta", () => {
    const items = generarEmparejar(ARRAYS);
    expect(items.length).toBeGreaterThanOrEqual(1);
    for (const it of items) {
      expect(it.tipo).toBe("emparejar");
      expect(it.pares).toHaveLength(4);
      expect(it.clave).toMatch(/^par:arrays:\d+$/);
      for (const p of it.pares) expect(p.der.length).toBeLessThanOrEqual(90);
    }
    expect(generarEmparejar(ARRAYS)).toEqual(items);
  });

  test("no usa descripciones que nombran la respuesta", () => {
    const e = entrada("array-join", "Array.prototype.join()", "Con join unes los elementos.");
    expect(descripcionCorta(e)).toBeNull();
  });
});

describe("¿Qué devuelve?", () => {
  test("tipos de valor y aclaraciones", () => {
    expect(tipoValor("-3.5")).toBe("numero");
    expect(tipoValor('"hola"')).toBe("string");
    expect(tipoValor("[1, 2]")).toBe("arreglo");
    expect(tipoValor("TypeError")).toBe("error");
    expect(tipoValor("un decimal cualquiera")).toBe("texto");
    expect(separarAclaracion("7 (7 huecos vacíos)")).toEqual({ respuesta: "7", aclaracion: "7 huecos vacíos" });
    expect(separarAclaracion("[1, 2] (copia)")).toEqual({ respuesta: "[1, 2]", aclaracion: "copia" });
  });

  test("solo toma expresiones con un resultado claro", () => {
    const ejemplo = [
      "const a = [1, 2]; // a = [1, 2]",
      "a.length; // 2",
      "Math.random(); // un decimal como 0.73, siempre menor que 1",
      "if (a) console.log(a); // [1, 2]",
      "Promise.resolve(5).then((v) => console.log(v)); // 5",
      "console.log(a.at(-1)); // 2",
      'console.log("hola"); // hola',
    ].join("\n");
    const casos = lineasConResultado(ejemplo);
    expect(casos.map((c) => c.idx)).toEqual([1, 5]);
    expect(casos[1]).toMatchObject({ esLog: true, respuesta: "2" });
  });

  test("muestra el ejemplo hasta la línea, la marca y quita su comentario", () => {
    const items = generarDevuelve(ARRAYS);
    const it = items.find((i) => i.clave === "ref:array-pop:2");
    expect(it.codigo).toEqual({ lenguaje: "js", texto: "const a = [1, 2, 3];\na.pop(); // 3\na;", marcar: 2 });
    expect(it.pregunta).toBe("¿Qué devuelve la línea resaltada?");
    expect(it.opciones[it.correcta]).toBe("`[1, 2]`");
    expect(it.explicacion).toContain("Quita el último elemento");
  });

  test("los booleanos tienen como opciones true, false, undefined y null", () => {
    const it = generarDevuelve(ARRAYS).find((i) => i.clave === "ref:array-includes:1");
    expect([...it.opciones].sort()).toEqual(["`false`", "`null`", "`true`", "`undefined`"]);
    expect(it.opciones[it.correcta]).toBe("`false`");
  });

  test("descarta resultados sin 3 distractores distintos", () => {
    const sola = [entrada("x", "x()", "Algo.", '"a".x(); // "zz"', "Rara")];
    expect(generarDevuelve(sola)).toEqual([]);
  });
});
