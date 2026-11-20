// @vitest-environment jsdom
import { afterEach, describe, expect, test } from "vitest";
import { aplicarInmersion, quitarInmersion, traducir } from "./inmersion.js";
import { DICCIONARIO, PLANTILLAS } from "./inmersion-diccionario.js";

describe("traducir (función pura)", () => {
  test("texto exacto del diccionario", () => {
    expect(traducir("Hoy")).toBe("Today");
    expect(traducir("Ajustes")).toBe("Settings");
    expect(traducir("Conseguir trabajo")).toBe("Get a job");
  });

  test("respeta los espacios de los lados y junta los de adentro", () => {
    expect(traducir("  Practicar ")).toBe("  Practice ");
    expect(traducir("Ver\n   solución")).toBe("See solution");
  });

  test("si no lo conoce devuelve null (el contenido queda en español)", () => {
    expect(traducir("Agrupar por propiedad")).toBeNull();
    expect(traducir("")).toBeNull();
    expect(traducir("   ")).toBeNull();
    expect(traducir("42")).toBeNull();
    expect(traducir("→")).toBeNull();
    expect(traducir(null)).toBeNull();
  });

  test("plantillas con números", () => {
    expect(traducir("3 de 5")).toBe("3 of 5");
    expect(traducir("12 días")).toBe("12 days");
    expect(traducir("Nivel 4")).toBe("Level 4");
    expect(traducir("Repasa 2 preguntas que te tocan hoy")).toBe("Review 2 questions due today");
    expect(traducir("Inglés: 15 minutos")).toBe("English: 15 minutes");
  });

  test("un número delante o detrás de un texto conocido", () => {
    expect(traducir("390 ejercicios")).toBe("390 exercises");
    expect(traducir("0/43 unidades →")).toBe("0/43 units →");
    expect(traducir("Semana 3")).toBe("Week 3");
    expect(traducir("390 ejercicios · 0 estudiados")).toBe("390 exercises · 0 studied");
  });

  test("fechas", () => {
    expect(traducir("Viernes, 20 de noviembre")).toBe("Friday, November 20");
    expect(traducir("3 de marzo de 2027")).toBe("March 3, 2027");
    expect(traducir("3 de algo")).toBeNull();
  });

  test("flechas, signos y prefijos a los lados", () => {
    expect(traducir("Guardar →")).toBe("Save →");
    expect(traducir("+ Agregar")).toBe("+ Add");
    expect(traducir("Racha:")).toBe("Streak:");
  });

  test('"Prefijo: resto" traduce el prefijo y deja el contenido', () => {
    expect(traducir("Ejercicio nuevo: Agrupar por propiedad")).toBe("New exercise: Agrupar por propiedad");
    expect(traducir("Repasa: Suma de pares")).toBe("Review: Suma de pares");
  });

  test('partes separadas por " · "', () => {
    expect(traducir("Básico · Resuelto")).toBe("Basic · Solved");
    expect(traducir("Básico · algo sin traducir")).toBeNull();
  });

  test("acepta otro diccionario (para probar sin el real)", () => {
    expect(traducir("Hola", { Hola: "Hello" }, {})).toBe("Hello");
    expect(traducir("2 gatos", {}, { "{n} gatos": "{n} cats" })).toBe("2 cats");
  });

  test("el diccionario no tiene claves vacías ni traducciones vacías", () => {
    for (const [es, en] of Object.entries({ ...DICCIONARIO, ...PLANTILLAS })) {
      expect(es.trim()).toBe(es);
      expect(es.length).toBeGreaterThan(0);
      expect(typeof en).toBe("string");
      expect(en.length).toBeGreaterThan(0);
    }
  });

  test("traducir dos veces no cambia nada (no entra en bucle)", () => {
    for (const en of ["Today", "Settings", "Practice", "Save", "Review"]) expect(traducir(en)).toBeNull();
  });
});

describe("aplicar al DOM", () => {
  const raiz = () => document.body;
  const esperar = () => new Promise((r) => setTimeout(r, 0));

  afterEach(() => {
    quitarInmersion(raiz());
    document.body.innerHTML = "";
  });

  test("traduce textos y atributos, y deja el contenido de estudio", () => {
    document.body.innerHTML = `
      <nav><a href="/">Hoy</a><a href="/practicar">Practicar</a></nav>
      <input placeholder="Buscar ejercicios" value="Hoy">
      <button aria-label="Cerrar" title="Guardar">Ver solución</button>
      <div data-sin-inmersion><p>Hoy</p></div>
      <pre><code>Hoy</code></pre>
      <textarea>Hoy</textarea>
      <p><strong lang="en">today</strong> = <small>hoy</small></p>`;
    aplicarInmersion(raiz());
    expect(document.querySelector("nav").textContent).toBe("TodayPractice");
    const input = document.querySelector("input");
    expect(input.getAttribute("placeholder")).toBe("Search exercises");
    expect(input.value).toBe("Hoy");
    const boton = document.querySelector("button");
    expect(boton.textContent).toBe("See solution");
    expect(boton.getAttribute("aria-label")).toBe("Close");
    expect(boton.getAttribute("title")).toBe("Save");
    expect(document.querySelector("[data-sin-inmersion] p").textContent).toBe("Hoy");
    expect(document.querySelector("code").textContent).toBe("Hoy");
    expect(document.querySelector("textarea").value).toBe("Hoy");
    expect(document.querySelector("small").textContent).toBe("hoy");
  });

  test("traduce lo que se agrega o cambia después (como cuando React pinta)", async () => {
    document.body.innerHTML = `<main></main>`;
    aplicarInmersion(raiz());
    const main = document.querySelector("main");
    const p = document.createElement("p");
    p.textContent = "Ajustes";
    main.append(p);
    await esperar();
    expect(p.textContent).toBe("Settings");

    p.firstChild.nodeValue = "Progreso";
    await esperar();
    expect(p.textContent).toBe("Progress");
  });

  test("al apagarlo vuelve todo al español", async () => {
    document.body.innerHTML = `<h1>Entrevistas</h1><input placeholder="Buscar">`;
    aplicarInmersion(raiz());
    expect(document.querySelector("h1").textContent).toBe("Interviews");
    quitarInmersion(raiz());
    expect(document.querySelector("h1").textContent).toBe("Entrevistas");
    expect(document.querySelector("input").getAttribute("placeholder")).toBe("Buscar");
    // apagado ya no traduce lo nuevo
    document.querySelector("h1").firstChild.nodeValue = "Progreso";
    await esperar();
    expect(document.querySelector("h1").textContent).toBe("Progreso");
  });
});
