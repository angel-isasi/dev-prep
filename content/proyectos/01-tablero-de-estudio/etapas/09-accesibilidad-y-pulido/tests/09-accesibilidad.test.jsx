// @vitest-environment jsdom
import { beforeEach, expect, test } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../src/App.jsx";
import { resetDatabase } from "../src/api.js";

const TAREAS = [
  { id: 1, title: "Repasar closures", topic: "JavaScript", done: false },
  { id: 2, title: "Leer sobre useState", topic: "React", done: true },
  { id: 3, title: "Practicar Flexbox", topic: "CSS", done: false },
];

beforeEach(() => {
  resetDatabase(TAREAS);
  localStorage.clear();
});

async function abrirApp() {
  const user = userEvent.setup();
  render(<App />);
  await screen.findByText("Repasar closures");
  return user;
}

const lista = () => screen.getByRole("region", { name: "Mis tareas" });

test("la página tiene banner, main y regiones con nombre", async () => {
  await abrirApp();
  const banner = screen.getByRole("banner");
  expect(within(banner).getByRole("heading", { level: 1, name: "Tablero de estudio" })).toBeTruthy();
  expect(within(banner).getByText(/^Racha:/)).toBeTruthy();

  const main = screen.getByRole("main");
  expect(within(main).getByRole("region", { name: "Agregar tarea" })).toBeTruthy();
  expect(within(main).getByRole("region", { name: "Mis tareas" })).toBeTruthy();
  expect(within(lista()).getByRole("list", { name: "Mis tareas" })).toBeTruthy();
  expect(within(lista()).getByRole("group", { name: "Filtrar por estado" })).toBeTruthy();
});

test("la sección Mis tareas avisa con aria-busy mientras carga", async () => {
  render(<App />);
  expect(lista().getAttribute("aria-busy")).toBe("true");
  await screen.findByText("Repasar closures");
  expect(lista().getAttribute("aria-busy")).toBe("false");
});

test("un título inválido marca el campo, lo une a su error y le devuelve el foco", async () => {
  const user = await abrirApp();
  const campo = screen.getByLabelText("Tarea");
  expect(campo.hasAttribute("aria-invalid")).toBe(false);
  expect(campo.hasAttribute("aria-describedby")).toBe(false);

  await user.click(screen.getByRole("button", { name: "Agregar" }));
  const error = await screen.findByRole("alert");
  expect(campo.getAttribute("aria-invalid")).toBe("true");
  expect(error.id).not.toBe("");
  expect(campo.getAttribute("aria-describedby")).toBe(error.id);
  expect(document.activeElement).toBe(campo);

  await user.type(campo, "Leer sobre promesas");
  await user.click(screen.getByRole("button", { name: "Agregar" }));
  await screen.findByText("Leer sobre promesas");
  expect(campo.hasAttribute("aria-invalid")).toBe(false);
  expect(campo.hasAttribute("aria-describedby")).toBe(false);
});

test("después de crear una tarea el campo queda vacío y con el foco, y se anuncia", async () => {
  const user = await abrirApp();
  const anuncio = screen.getByRole("status");
  expect(anuncio.textContent).toBe(""); // la región viva existe desde el inicio

  const campo = screen.getByLabelText("Tarea");
  await user.type(campo, "Practicar fetch con async");
  await user.click(screen.getByRole("button", { name: "Agregar" }));

  await screen.findByRole("checkbox", { name: "Practicar fetch con async" });
  await waitFor(() => expect(anuncio.textContent).toBe("Tarea creada: Practicar fetch con async"));
  expect(campo.value).toBe("");
  expect(document.activeElement).toBe(campo);
});

test("al borrar se anuncia la tarea borrada y el foco pasa al título Mis tareas", async () => {
  const user = await abrirApp();
  await user.click(screen.getByRole("button", { name: "Borrar Practicar Flexbox" }));

  await waitFor(() => expect(screen.getByRole("status").textContent).toBe("Tarea borrada: Practicar Flexbox"));
  expect(screen.queryByText("Practicar Flexbox")).toBeNull();
  expect(document.activeElement).toBe(screen.getByRole("heading", { level: 2, name: "Mis tareas" }));
});

test("cada tarea tiene casilla y botones con un nombre que dice cuál es", async () => {
  await abrirApp();
  for (const tarea of TAREAS) {
    expect(screen.getByRole("checkbox", { name: tarea.title }).checked).toBe(tarea.done);
    expect(screen.getByRole("button", { name: `Editar ${tarea.title}` })).toBeTruthy();
    expect(screen.getByRole("button", { name: `Borrar ${tarea.title}` })).toBeTruthy();
  }
  // Ningún botón queda sin nombre accesible
  for (const boton of screen.getAllByRole("button")) {
    const nombre = boton.getAttribute("aria-label") ?? boton.textContent;
    expect(nombre.trim()).not.toBe("");
  }
});

test("al editar, el foco va al campo; Escape cancela y el foco vuelve a su botón Editar", async () => {
  const user = await abrirApp();
  await user.click(screen.getByRole("button", { name: "Editar Repasar closures" }));
  const campo = screen.getByLabelText("Editar título");
  expect(document.activeElement).toBe(campo);

  await user.keyboard("{Escape}");
  expect(screen.queryByLabelText("Editar título")).toBeNull();
  expect(screen.getByText("Repasar closures")).toBeTruthy();
  expect(document.activeElement).toBe(screen.getByRole("button", { name: "Editar Repasar closures" }));
});

test("al guardar la edición el foco vuelve al botón Editar de esa tarea", async () => {
  const user = await abrirApp();
  await user.click(screen.getByRole("button", { name: "Editar Leer sobre useState" }));
  const campo = screen.getByLabelText("Editar título");
  await user.clear(campo);
  await user.type(campo, "Leer sobre useState y useEffect{Enter}");

  const boton = await screen.findByRole("button", { name: "Editar Leer sobre useState y useEffect" });
  await waitFor(() => expect(document.activeElement).toBe(boton));
});
