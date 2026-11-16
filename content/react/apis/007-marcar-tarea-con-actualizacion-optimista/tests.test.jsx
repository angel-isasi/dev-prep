// @vitest-environment jsdom
import { test, expect, vi, afterEach } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { ListaTareas } from "./solucion.jsx";

afterEach(() => {
  vi.unstubAllGlobals();
});

function respuesta(cuerpo, status = 200) {
  return { ok: status >= 200 && status < 300, status, json: async () => cuerpo };
}

const TAREAS = [
  { id: 1, titulo: "Repasar closures", hecha: true },
  { id: 2, titulo: "Resolver un reto de React", hecha: false },
  { id: 3, titulo: "Practicar el pitch en inglés", hecha: false },
];

/**
 * fetch falso: el GET responde al instante con las tareas; cada PATCH queda
 * pendiente hasta que lo resuelves con `bien(id)`, `mal(id, status)` o `sinRed(id)`.
 */
function servidor() {
  const patches = {};
  const fetchFalso = vi.fn((url, opciones = {}) => {
    if (!opciones.method || opciones.method === "GET") {
      return Promise.resolve(respuesta(TAREAS.map((t) => ({ ...t }))));
    }
    const id = Number(url.split("/").pop());
    return new Promise((resolver, rechazar) => {
      patches[id] = { resolver, rechazar, cuerpo: JSON.parse(opciones.body) };
    });
  });
  return {
    fetchFalso,
    patches,
    bien: (id) =>
      act(async () => patches[id].resolver(respuesta({ ...TAREAS.find((t) => t.id === id), ...patches[id].cuerpo }))),
    mal: (id, status = 500) => act(async () => patches[id].resolver(respuesta({ error: "Error del servidor" }, status))),
    sinRed: (id) => act(async () => patches[id].rechazar(new TypeError("Failed to fetch"))),
  };
}

const casilla = (titulo) => screen.getByRole("checkbox", { name: titulo });

test("carga las tareas con un checkbox por tarea, marcado si está hecha", async () => {
  const { fetchFalso } = servidor();
  vi.stubGlobal("fetch", fetchFalso);
  render(<ListaTareas />);
  expect(screen.getByRole("status").textContent).toBe("Cargando tareas...");

  expect(await screen.findByRole("checkbox", { name: "Repasar closures" })).toBeTruthy();
  expect(casilla("Repasar closures").checked).toBe(true);
  expect(casilla("Resolver un reto de React").checked).toBe(false);
  expect(fetchFalso.mock.calls[0][0]).toBe("/api/practica/tareas");
});

test("al marcar, cambia AL INSTANTE (antes de que responda el servidor) y envía el PATCH", async () => {
  const { fetchFalso, patches } = servidor();
  vi.stubGlobal("fetch", fetchFalso);
  render(<ListaTareas />);
  await screen.findByRole("checkbox", { name: "Resolver un reto de React" });

  fireEvent.click(casilla("Resolver un reto de React"));
  // El PATCH sigue pendiente, pero la pantalla ya cambió.
  expect(casilla("Resolver un reto de React").checked).toBe(true);

  const [url, opciones] = fetchFalso.mock.calls[1];
  expect(url).toBe("/api/practica/tareas/2");
  expect(opciones.method).toBe("PATCH");
  expect(patches[2].cuerpo).toEqual({ hecha: true });
});

test("mientras su PATCH no responde, esa casilla se deshabilita (las demás no)", async () => {
  const { fetchFalso, bien } = servidor();
  vi.stubGlobal("fetch", fetchFalso);
  render(<ListaTareas />);
  await screen.findByRole("checkbox", { name: "Repasar closures" });

  fireEvent.click(casilla("Repasar closures"));
  expect(casilla("Repasar closures").checked).toBe(false);
  expect(casilla("Repasar closures").disabled).toBe(true);
  expect(casilla("Resolver un reto de React").disabled).toBe(false);

  await bien(1);
  expect(casilla("Repasar closures").disabled).toBe(false);
  expect(casilla("Repasar closures").checked).toBe(false);
  expect(screen.queryByRole("alert")).toBeNull();
});

test("si el PATCH falla, deshace el cambio y avisa con el título de la tarea", async () => {
  const { fetchFalso, mal } = servidor();
  vi.stubGlobal("fetch", fetchFalso);
  render(<ListaTareas />);
  await screen.findByRole("checkbox", { name: "Resolver un reto de React" });

  fireEvent.click(casilla("Resolver un reto de React"));
  expect(casilla("Resolver un reto de React").checked).toBe(true);

  await mal(2, 500);
  expect(casilla("Resolver un reto de React").checked).toBe(false);
  expect(casilla("Resolver un reto de React").disabled).toBe(false);
  expect(screen.getByRole("alert").textContent).toBe(
    'No se pudo actualizar "Resolver un reto de React". Inténtalo de nuevo.',
  );
});

test("sin conexión también deshace el cambio", async () => {
  const { fetchFalso, sinRed } = servidor();
  vi.stubGlobal("fetch", fetchFalso);
  render(<ListaTareas />);
  await screen.findByRole("checkbox", { name: "Repasar closures" });

  fireEvent.click(casilla("Repasar closures"));
  await sinRed(1);
  expect(casilla("Repasar closures").checked).toBe(true);
  expect(screen.getByRole("alert").textContent).toContain("Repasar closures");
});

test("con dos cambios a la vez, deshacer uno NO deshace el otro", async () => {
  const { fetchFalso, bien, mal } = servidor();
  vi.stubGlobal("fetch", fetchFalso);
  render(<ListaTareas />);
  await screen.findByRole("checkbox", { name: "Resolver un reto de React" });

  fireEvent.click(casilla("Resolver un reto de React")); // tarea 2: falla
  fireEvent.click(casilla("Practicar el pitch en inglés")); // tarea 3: sale bien
  expect(casilla("Resolver un reto de React").checked).toBe(true);
  expect(casilla("Practicar el pitch en inglés").checked).toBe(true);

  await bien(3);
  await mal(2);
  expect(casilla("Resolver un reto de React").checked).toBe(false);
  expect(casilla("Practicar el pitch en inglés").checked).toBe(true);
  expect(casilla("Repasar closures").checked).toBe(true);
});

test("un nuevo cambio borra el aviso anterior", async () => {
  const { fetchFalso, mal } = servidor();
  vi.stubGlobal("fetch", fetchFalso);
  render(<ListaTareas />);
  await screen.findByRole("checkbox", { name: "Resolver un reto de React" });

  fireEvent.click(casilla("Resolver un reto de React"));
  await mal(2);
  expect(screen.getByRole("alert")).toBeTruthy();

  fireEvent.click(casilla("Practicar el pitch en inglés"));
  expect(screen.queryByRole("alert")).toBeNull();
});
