import { readFileSync, readdirSync } from "node:fs";
import { describe, expect, test } from "vitest";
import { partesTeoria } from "./teoria.js";

const ejemplo = `## En una frase

Una idea.

## Lo esencial

### Primero

Texto con \`código\`.

\`\`\`js
## esto es código, no una sección
\`\`\`

### Segundo

Más texto.

## Errores típicos

1. **Olvidar el return.**
   \`\`\`js
   const f = () => { 1 };
   \`\`\`
   Sin llaves devuelve solo.

**2. Comparar con \`==\`**

Usa \`===\`.

## Chuleta

| A | B |
|---|---|
| x | y |

## En la entrevista

- **¿Qué es?** Una respuesta.

**¿Y esto?**
Otra respuesta
en dos líneas.
`;

describe("partes de la teoría", () => {
  test("separa frase, conceptos, errores, chuleta y preguntas (los dos formatos)", () => {
    const p = partesTeoria(ejemplo);
    expect(p.frase).toBe("Una idea.");
    expect(p.conceptos.map((c) => c.titulo)).toEqual(["Primero", "Segundo"]);
    expect(p.conceptos[0].cuerpo).toContain("## esto es código");
    expect(p.errores.map((e) => e.titulo)).toEqual(["Olvidar el return", "Comparar con `==`"]);
    expect(p.errores[0].cuerpo).toBe("```js\nconst f = () => { 1 };\n```\nSin llaves devuelve solo.");
    expect(p.chuleta).toContain("| x | y |");
    expect(p.entrevista).toEqual([
      { titulo: "¿Qué es?", cuerpo: "Una respuesta." },
      { titulo: "¿Y esto?", cuerpo: "Otra respuesta\nen dos líneas." },
    ]);
  });

  test("sin las secciones de siempre devuelve null (se muestra el texto completo)", () => {
    expect(partesTeoria("# Hola\n\nTexto suelto.")).toBeNull();
  });

  test("todos los temas de Aprender se leen completos", () => {
    const dir = "content/aprender";
    for (const tema of readdirSync(dir)) {
      const p = partesTeoria(readFileSync(`${dir}/${tema}/teoria.md`, "utf8"));
      expect(p, tema).not.toBeNull();
      expect(p.conceptos.length, tema).toBeGreaterThanOrEqual(2);
      expect(p.errores.length, tema).toBeGreaterThan(0);
      expect(p.entrevista.length, tema).toBeGreaterThan(0);
      for (const e of [...p.errores, ...p.entrevista]) expect(e.cuerpo, `${tema}: ${e.titulo}`).not.toBe("");
    }
  });
});
