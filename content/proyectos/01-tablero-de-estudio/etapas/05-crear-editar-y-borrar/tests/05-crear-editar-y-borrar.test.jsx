// @vitest-environment jsdom
import { beforeEach, expect, test } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../src/App.jsx";
import { failNextRequest, getTasks, resetDatabase } from "../src/api.js";

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

test("crear una tarea la guarda en el servidor y la muestra", async () => {
  const user = await abrirApp();
  await user.type(screen.getByLabelText("Tarea"), "Practicar fetch con async");
  await user.click(screen.getByRole("button", { name: "Agregar" }));

  expect(await screen.findByText("Practicar fetch con async")).toBeTruthy();
  const enServidor = await getTasks();
  expect(enServidor.find((t) => t.title === "Practicar fetch con async")).toMatchObject({ done: false });
});

test("marcar una tarea guarda el cambio en el servidor", async () => {
  const user = await abrirApp();
  await user.click(screen.getByRole("checkbox", { name: "Repasar closures" }));
  await waitFor(() => expect(screen.getByRole("checkbox", { name: "Repasar closures" }).checked).toBe(true));

  const enServidor = await getTasks();
  expect(enServidor.find((t) => t.id === 1).done).toBe(true);
});

test("borrar una tarea la quita de la lista y del servidor", async () => {
  const user = await abrirApp();
  await user.click(screen.getByRole("button", { name: "Borrar Practicar Flexbox" }));

  await waitFor(() => expect(screen.queryByText("Practicar Flexbox")).toBeNull());
  expect(screen.getAllByRole("listitem")).toHaveLength(2);
  const enServidor = await getTasks();
  expect(enServidor.map((t) => t.id)).toEqual([1, 2]);
});

test("editar el título guarda el cambio en la lista y en el servidor", async () => {
  const user = await abrirApp();
  await user.click(screen.getByRole("button", { name: "Editar Repasar closures" }));

  const campo = screen.getByLabelText("Editar título");
  expect(campo.value).toBe("Repasar closures");
  await user.clear(campo);
  await user.type(campo, "Repasar closures y scope");
  await user.click(screen.getByRole("button", { name: "Guardar" }));

  expect(await screen.findByText("Repasar closures y scope")).toBeTruthy();
  expect(screen.queryByLabelText("Editar título")).toBeNull();
  const enServidor = await getTasks();
  expect(enServidor.find((t) => t.id === 1).title).toBe("Repasar closures y scope");
});

test("cancelar la edición deja el título como estaba", async () => {
  const user = await abrirApp();
  await user.click(screen.getByRole("button", { name: "Editar Leer sobre useState" }));
  const campo = screen.getByLabelText("Editar título");
  await user.clear(campo);
  await user.type(campo, "Otro título");
  await user.click(screen.getByRole("button", { name: "Cancelar" }));

  expect(screen.queryByLabelText("Editar título")).toBeNull();
  expect(screen.getByText("Leer sobre useState")).toBeTruthy();
  const enServidor = await getTasks();
  expect(enServidor.find((t) => t.id === 2).title).toBe("Leer sobre useState");
});

test("si falla el borrado avisa con una alerta y la tarea sigue en la lista", async () => {
  const user = await abrirApp();
  failNextRequest();
  await user.click(screen.getByRole("button", { name: "Borrar Repasar closures" }));

  const alerta = await screen.findByRole("alert");
  expect(alerta.textContent).toContain("No se pudo borrar la tarea. Intenta de nuevo.");
  expect(screen.getByText("Repasar closures")).toBeTruthy();
  expect(screen.getAllByRole("listitem")).toHaveLength(3);
});

test("si falla la creación avisa y el texto escrito no se pierde", async () => {
  const user = await abrirApp();
  const campo = screen.getByLabelText("Tarea");
  await user.type(campo, "Leer sobre el event loop");
  failNextRequest();
  await user.click(screen.getByRole("button", { name: "Agregar" }));

  const alerta = await screen.findByRole("alert");
  expect(alerta.textContent).toContain("No se pudo crear la tarea. Intenta de nuevo.");
  expect(campo.value).toBe("Leer sobre el event loop");
  expect(screen.getAllByRole("listitem")).toHaveLength(3);
});
