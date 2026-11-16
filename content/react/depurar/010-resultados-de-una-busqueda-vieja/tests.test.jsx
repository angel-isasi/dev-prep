// @vitest-environment jsdom
import { test, expect } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { Resultados } from "./solucion.jsx";

// Un "servidor" que responde cuando el test lo decide, para simular respuestas lentas.
function crearServidor() {
  const pendientes = {};
  const buscar = (consulta) => new Promise((resolver) => (pendientes[consulta] = resolver));
  const responder = (consulta, datos) => act(async () => pendientes[consulta](datos));
  return { buscar, responder };
}

const textos = () => screen.queryAllByRole("listitem").map((li) => li.textContent);

test("si la respuesta vieja llega tarde, no pisa a la actual", async () => {
  const { buscar, responder } = crearServidor();
  const { rerender } = render(<Resultados consulta="re" buscar={buscar} />);
  rerender(<Resultados consulta="react" buscar={buscar} />);
  await responder("react", ["React básico"]);
  await responder("re", ["Redes", "Regex", "React básico"]);
  expect(textos()).toEqual(["React básico"]);
});

test("una respuesta vieja que llega antes tampoco se muestra", async () => {
  const { buscar, responder } = crearServidor();
  const { rerender } = render(<Resultados consulta="cs" buscar={buscar} />);
  rerender(<Resultados consulta="css" buscar={buscar} />);
  await responder("cs", ["CSS Grid", "C#"]);
  expect(textos()).toEqual([]);
  await responder("css", ["CSS Grid"]);
  expect(textos()).toEqual(["CSS Grid"]);
});

test("muestra los resultados de la consulta", async () => {
  const { buscar, responder } = crearServidor();
  render(<Resultados consulta="js" buscar={buscar} />);
  await responder("js", ["JavaScript desde cero", "JS intermedio"]);
  expect(textos()).toEqual(["JavaScript desde cero", "JS intermedio"]);
});

test("si se desmonta antes de la respuesta, no falla", async () => {
  const { buscar, responder } = crearServidor();
  const { unmount } = render(<Resultados consulta="node" buscar={buscar} />);
  unmount();
  await responder("node", ["Node.js"]);
  expect(textos()).toEqual([]);
});
