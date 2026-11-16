// @vitest-environment jsdom
// Tests de aceptación: prueban lo que ve y hace el usuario, no cómo está hecho por dentro.
import { afterEach, expect, test, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../src/App.jsx";

const CONTACTO = "Maquetar la página de contacto"; // Por hacer
const IMAGENES = "Optimizar las imágenes del inicio"; // Por hacer
const MENU = "Corregir el menú en móviles"; // En curso
const DOMINIO = "Configurar el dominio de la tienda"; // Hecho

afterEach(() => {
  vi.restoreAllMocks();
});

function setup() {
  const user = userEvent.setup();
  render(<App />);
  return user;
}

const column = (name) => screen.getByRole("region", { name });
/** Títulos de las tarjetas de una columna, en orden. */
const titlesIn = (name) => within(column(name)).queryAllByRole("heading", { level: 3 }).map((h) => h.textContent);
const counter = (name) => within(column(name)).getByText(/^\d+( de \d+)? tareas?$/).textContent;
const status = () => screen.getByRole("status");
const button = (name) => screen.getByRole("button", { name });

async function openDeleteDialog(user, title) {
  await user.click(button(`Borrar ${title}`));
  return screen.getByRole("dialog", { name: "¿Borrar la tarea?" });
}

test("muestra las tres columnas con sus tareas y el contador de cada una", () => {
  setup();
  expect(screen.getByRole("heading", { level: 1, name: "Tablero de Kallpa Studio" })).toBeTruthy();
  expect(titlesIn("Por hacer")).toEqual([CONTACTO, "Revisión de accesibilidad del catálogo", IMAGENES]);
  expect(titlesIn("En curso")).toEqual(["Conectar el formulario de reservas", MENU]);
  expect(titlesIn("Hecho")).toEqual([DOMINIO]);
  expect(counter("Por hacer")).toBe("3 tareas");
  expect(counter("En curso")).toBe("2 tareas");
  expect(counter("Hecho")).toBe("1 tarea");
  expect(status().textContent).toBe(""); // la región viva existe desde el inicio
});

test("crear una tarea la agrega al final de Por hacer y deja el campo vacío y con el foco", async () => {
  const user = setup();
  const field = screen.getByLabelText("Nueva tarea");
  await user.type(field, "  Escribir el README del proyecto  ");
  await user.click(button("Agregar"));

  expect(titlesIn("Por hacer").at(-1)).toBe("Escribir el README del proyecto");
  expect(counter("Por hacer")).toBe("4 tareas");
  expect(field.value).toBe("");
  expect(document.activeElement).toBe(field);
  expect(status().textContent).toBe('Tarea "Escribir el README del proyecto" creada en Por hacer.');

  await user.type(field, "Preparar la demo para el cliente{Enter}");
  expect(titlesIn("Por hacer").at(-1)).toBe("Preparar la demo para el cliente");
});

test("no deja crear una tarea vacía ni repetida, y une el error al campo", async () => {
  const user = setup();
  const field = screen.getByLabelText("Nueva tarea");
  expect(field.hasAttribute("aria-invalid")).toBe(false);

  await user.type(field, "   ");
  await user.click(button("Agregar"));
  const error = screen.getByRole("alert");
  expect(error.textContent).toBe("Escribe un título para la tarea.");
  expect(field.getAttribute("aria-invalid")).toBe("true");
  expect(field.getAttribute("aria-describedby")).toBe(error.id);

  await user.clear(field);
  await user.type(field, "configurar el DOMINIO de la tienda{Enter}");
  expect(screen.getByRole("alert").textContent).toBe("Ya existe una tarea con ese título.");
  expect(counter("Por hacer")).toBe("3 tareas");
  expect(counter("Hecho")).toBe("1 tarea");
});

test("mover con botones lleva la tarea al final de la columna vecina y deja el foco en su tarjeta", async () => {
  const user = setup();
  // Desde Por hacer solo se puede ir a En curso
  expect(screen.queryByRole("button", { name: `Mover ${CONTACTO} a Hecho` })).toBeNull();
  expect(screen.queryByRole("button", { name: `Mover ${CONTACTO} a Por hacer` })).toBeNull();

  await user.click(button(`Mover ${CONTACTO} a En curso`));
  expect(titlesIn("En curso").at(-1)).toBe(CONTACTO);
  expect(titlesIn("Por hacer")).not.toContain(CONTACTO);
  expect(counter("Por hacer")).toBe("2 tareas");
  expect(counter("En curso")).toBe("3 tareas");
  expect(within(document.activeElement).getByRole("heading", { level: 3 }).textContent).toBe(CONTACTO);
  expect(status().textContent).toBe(`"${CONTACTO}" se movió a En curso.`);

  // Desde En curso se puede ir a las dos columnas vecinas
  expect(button(`Mover ${CONTACTO} a Por hacer`)).toBeTruthy();
  await user.click(button(`Mover ${CONTACTO} a Hecho`));
  expect(titlesIn("Hecho")).toEqual([DOMINIO, CONTACTO]);
  expect(counter("En curso")).toBe("2 tareas");

  // Desde Hecho solo se puede volver a En curso
  expect(screen.queryByRole("button", { name: `Mover ${CONTACTO} a Por hacer` })).toBeNull();
  await user.click(button(`Mover ${DOMINIO} a En curso`));
  expect(titlesIn("En curso").at(-1)).toBe(DOMINIO);
  expect(titlesIn("Hecho")).toEqual([CONTACTO]);
});

test("editar: Guardar cambia el título, no acepta uno vacío y Escape lo deja como estaba", async () => {
  const user = setup();
  await user.click(button(`Editar ${MENU}`));
  const field = screen.getByLabelText("Editar título");
  expect(field.value).toBe(MENU);
  expect(document.activeElement).toBe(field);

  await user.clear(field);
  await user.click(button("Guardar"));
  expect(screen.getByRole("alert").textContent).toBe("Escribe un título para la tarea.");
  expect(screen.getByLabelText("Editar título")).toBeTruthy();

  await user.type(field, "Corregir el menú en celulares");
  await user.click(button("Guardar"));
  expect(screen.queryByLabelText("Editar título")).toBeNull();
  expect(titlesIn("En curso")).toEqual(["Conectar el formulario de reservas", "Corregir el menú en celulares"]);
  await waitFor(() => expect(document.activeElement).toBe(button("Editar Corregir el menú en celulares")));

  await user.click(button("Editar Corregir el menú en celulares"));
  await user.type(screen.getByLabelText("Editar título"), " y tablets");
  await user.keyboard("{Escape}");
  expect(screen.queryByLabelText("Editar título")).toBeNull();
  expect(titlesIn("En curso")).toContain("Corregir el menú en celulares");
  expect(document.activeElement).toBe(button("Editar Corregir el menú en celulares"));
});

test("borrar abre un diálogo accesible propio, con el foco en Cancelar, y Cancelar no borra", async () => {
  const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);
  const user = setup();
  const dialog = await openDeleteDialog(user, IMAGENES);

  expect(dialog.getAttribute("aria-modal")).toBe("true");
  const description = document.getElementById(dialog.getAttribute("aria-describedby"));
  expect(description.textContent).toContain(IMAGENES);
  expect(document.activeElement).toBe(within(dialog).getByRole("button", { name: "Cancelar" }));

  await user.click(within(dialog).getByRole("button", { name: "Cancelar" }));
  expect(screen.queryByRole("dialog")).toBeNull();
  expect(titlesIn("Por hacer")).toContain(IMAGENES);
  await waitFor(() => expect(document.activeElement).toBe(button(`Borrar ${IMAGENES}`)));
  expect(confirmSpy).not.toHaveBeenCalled();
});

test("en el diálogo, Tab no se escapa y Escape lo cierra sin borrar", async () => {
  const user = setup();
  const dialog = await openDeleteDialog(user, MENU);
  const cancel = within(dialog).getByRole("button", { name: "Cancelar" });
  const confirm = within(dialog).getByRole("button", { name: "Borrar" });

  await user.tab();
  expect(document.activeElement).toBe(confirm);
  await user.tab();
  expect(document.activeElement).toBe(cancel);
  await user.tab({ shift: true });
  expect(document.activeElement).toBe(confirm);

  await user.keyboard("{Escape}");
  expect(screen.queryByRole("dialog")).toBeNull();
  expect(titlesIn("En curso")).toContain(MENU);
  await waitFor(() => expect(document.activeElement).toBe(button(`Borrar ${MENU}`)));
});

test("confirmar el borrado quita la tarea, actualiza el contador, lo anuncia y enfoca su columna", async () => {
  const user = setup();
  const dialog = await openDeleteDialog(user, DOMINIO);
  await user.click(within(dialog).getByRole("button", { name: "Borrar" }));

  expect(screen.queryByRole("dialog")).toBeNull();
  expect(titlesIn("Hecho")).toEqual([]);
  expect(within(column("Hecho")).getByText("Sin tareas")).toBeTruthy();
  expect(counter("Hecho")).toBe("0 tareas");
  expect(status().textContent).toBe(`Tarea "${DOMINIO}" borrada.`);
  await waitFor(() => expect(document.activeElement).toBe(screen.getByRole("heading", { level: 2, name: "Hecho" })));
});

test("el filtro busca sin importar mayúsculas ni tildes y el contador muestra cuántas se ven", async () => {
  const user = setup();
  const search = screen.getByRole("searchbox", { name: "Buscar tareas" });

  await user.type(search, "  REVISION ");
  expect(titlesIn("Por hacer")).toEqual(["Revisión de accesibilidad del catálogo"]);
  expect(counter("Por hacer")).toBe("1 de 3 tareas");
  expect(within(column("En curso")).getByText("Sin coincidencias")).toBeTruthy();
  expect(counter("En curso")).toBe("0 de 2 tareas");
  expect(counter("Hecho")).toBe("0 de 1 tarea");

  await user.clear(search);
  await user.type(search, "menu");
  expect(titlesIn("En curso")).toEqual([MENU]);
  expect(titlesIn("Por hacer")).toEqual([]);

  await user.clear(search);
  expect(counter("Por hacer")).toBe("3 tareas");
  expect(titlesIn("Hecho")).toEqual([DOMINIO]);
});
