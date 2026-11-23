import { describe, expect, it } from "vitest";
import { CV_BASE_INICIAL, encabezadoDe } from "../../../../server/cv-oferta.js";
import { conNombre, nombreArchivo, seccionesDeCv, seccionesDeTexto } from "./HojaCv.jsx";

describe("hoja del CV", () => {
  it("el CV base se arma en secciones con puestos, viñetas y la tabla de habilidades", () => {
    const s = seccionesDeTexto(encabezadoDe(CV_BASE_INICIAL).cuerpo);
    expect(s.map((x) => x.titulo)).toEqual(["PERFIL", "EXPERIENCIA", "PROYECTOS", "EDUCACIÓN", "HABILIDADES", "CURSOS Y CERTIFICADOS"]);
    const exp = s[1].bloques.map((b) => b.tipo);
    expect(exp).toEqual(["puesto", "lugar", "lista", "puesto", "lugar", "lista"]);
    expect(s[1].bloques[2].items).toHaveLength(4);
    expect(s[2].bloques.map((b) => b.tipo)).toEqual(["puesto", "lugar", "lista", "puesto", "lista"]);
    expect(s[2].bloques[0].texto).toMatch(/^dev-prep/);
    expect(JSON.stringify(s)).not.toMatch(/ebook/i);
    const tabla = s[4].bloques[0];
    expect(tabla.tipo).toBe("tabla");
    expect(tabla.filas[0]).toEqual(["Frontend", "HTML, CSS, JavaScript, TypeScript, React, Next.js, Tailwind CSS"]);
    expect(tabla.filas.at(-1)[0]).toBe("Idiomas");
  });

  it("las viñetas con 'Clave: valor' fuera de Habilidades siguen siendo viñetas", () => {
    const s = seccionesDeTexto("# PROYECTOS\n- dev-prep: una app\n\n# HABILIDADES\n- **Frontend:** React");
    expect(s[0].bloques[0]).toEqual({ tipo: "lista", items: ["dev-prep: una app"] });
    expect(s[1].bloques[0].filas).toEqual([["Frontend", "React"]]);
  });

  it("el CV de una oferta usa las mismas secciones", () => {
    const s = seccionesDeCv({
      perfil: "Hola",
      experiencia: [{ puesto: "Dev", periodo: "2026", lugar: "Remoto", puntos: ["a"] }],
      habilidades: [{ grupo: "Frontend", items: "React" }],
      idiomas: "Español",
    });
    expect(s.map((x) => x.titulo)).toEqual(["Perfil", "Experiencia", "Habilidades"]);
    expect(s[1].bloques[0].texto).toBe("Dev | 2026");
    expect(s[2].bloques[0].filas).toEqual([["Frontend", "React"], ["Idiomas", "Español"]]);
  });

  it("el nombre del PDF", () => {
    expect(nombreArchivo("Angel Fernando Isasi Oyolo")).toBe("CV_Angel_Isasi_Oyolo");
    expect(nombreArchivo("Angel Fernando Isasi Oyolo", "Seguros Falabella")).toBe("CV_Angel_Isasi_Oyolo_Seguros_Falabella");
  });
});

describe("negrita del nombre en viñetas", () => {
  it("pone en negrita el nombre corto antes de los dos puntos, no una oración", () => {
    expect(conNombre("La Silenciosa (lasilenciosa.com): sitio web")).toBe("**La Silenciosa (lasilenciosa.com)**: sitio web");
    expect(conNombre("Desarrollo del módulo de votación del Festival de Cortos con Laravel, Filament: x")).toMatch(/^Desarrollo/);
    expect(conNombre("Integración continua con GitHub Actions para ejecutar las pruebas. Trabajo: x")).toMatch(/^Integración/);
  });
});
