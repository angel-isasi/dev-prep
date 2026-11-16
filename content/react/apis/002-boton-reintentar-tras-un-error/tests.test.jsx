// @vitest-environment jsdom
import { test, expect, vi, afterEach } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { TareasConReintento } from "./solucion.jsx";

afterEach(() => {
  vi.unstubAllGlobals();
});

function respuesta(cuerpo, status = 200) {
  return { ok: status >= 200 && status < 300, status, json: async () => cuerpo };
}

const TAREAS = [
  { id: 1, titulo: "Repasar closures", hecha: true },
  { id: 2, titulo: "Resolver un reto de React", hecha: false },
];

/** fetch falso cuyas respuestas resuelves tú a mano, en orden. */
function fetchManual() {
  const pendientes = [];
  const fetchFalso = vi.fn(
    () =>
      new Promise((resolver, rechazar) => {
        pendientes.push({ resolver, rechazar });
      }),
  );
  return { fetchFalso, pendientes };
}

test("pide /api/practica/tareas una vez y muestra la lista marcando las hechas", async () => {
  const fetchFalso = vi.fn(async () => respuesta(TAREAS));
  vi.stubGlobal("fetch", fetchFalso);
  render(<TareasConReintento />);
  expect(screen.getByRole("status").textContent).toBe("Cargando tareas...");

  await screen.findByText("Repasar closures (hecha)");
  expect(screen.getAllByRole("listitem").map((li) => li.textContent)).toEqual([
    "Repasar closures (hecha)",
    "Resolver un reto de React",
  ]);
  expect(fetchFalso).toHaveBeenCalledTimes(1);
  expect(fetchFalso.mock.calls[0][0]).toBe("/api/practica/tareas");
  expect(screen.queryByRole("button", { name: "Reintentar" })).toBeNull();
});

test("con un 500 muestra la alerta y el botón Reintentar", async () => {
  vi.stubGlobal("fetch", vi.fn(async () => respuesta({ error: "Error del servidor" }, 500)));
  render(<TareasConReintento />);
  const alerta = await screen.findByRole("alert");
  expect(alerta.textContent).toBe("No se pudieron cargar las tareas.");
  expect(screen.getByRole("button", { name: "Reintentar" })).toBeTruthy();
  expect(screen.queryByRole("list")).toBeNull();
});

test("si fetch se rechaza (sin conexión) también ofrece reintentar", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => {
      throw new TypeError("Failed to fetch");
    }),
  );
  render(<TareasConReintento />);
  expect(await screen.findByRole("button", { name: "Reintentar" })).toBeTruthy();
  expect(screen.getByRole("alert").textContent).toBe("No se pudieron cargar las tareas.");
});

test("Reintentar vuelve a mostrar Cargando, hace otra petición y muestra la lista", async () => {
  const { fetchFalso, pendientes } = fetchManual();
  vi.stubGlobal("fetch", fetchFalso);
  render(<TareasConReintento />);

  await act(async () => pendientes[0].resolver(respuesta({ error: "Error del servidor" }, 500)));
  fireEvent.click(await screen.findByRole("button", { name: "Reintentar" }));

  // Mientras llega la segunda respuesta: cargando, sin error ni botón.
  expect(screen.getByRole("status").textContent).toBe("Cargando tareas...");
  expect(screen.queryByRole("alert")).toBeNull();
  expect(screen.queryByRole("button", { name: "Reintentar" })).toBeNull();
  expect(fetchFalso).toHaveBeenCalledTimes(2);

  await act(async () => pendientes[1].resolver(respuesta(TAREAS)));
  expect(await screen.findByText("Resolver un reto de React")).toBeTruthy();
  expect(screen.queryByRole("alert")).toBeNull();
});

test("si el reintento también falla, vuelve el error y se puede reintentar otra vez", async () => {
  const fetchFalso = vi
    .fn()
    .mockResolvedValueOnce(respuesta({}, 503))
    .mockRejectedValueOnce(new TypeError("Failed to fetch"))
    .mockResolvedValueOnce(respuesta(TAREAS));
  vi.stubGlobal("fetch", fetchFalso);
  render(<TareasConReintento />);

  fireEvent.click(await screen.findByRole("button", { name: "Reintentar" }));
  fireEvent.click(await screen.findByRole("button", { name: "Reintentar" }));
  expect(await screen.findByText("Repasar closures (hecha)")).toBeTruthy();
  expect(fetchFalso).toHaveBeenCalledTimes(3);
});

test("no hace peticiones de más: solo al montar y en cada clic", async () => {
  const fetchFalso = vi.fn(async () => respuesta(TAREAS));
  vi.stubGlobal("fetch", fetchFalso);
  render(<TareasConReintento />);
  await screen.findByText("Repasar closures (hecha)");
  // Dejamos pasar unas vueltas del event loop por si el efecto se repite solo.
  await act(async () => {
    await new Promise((r) => setTimeout(r, 20));
  });
  expect(fetchFalso).toHaveBeenCalledTimes(1);
});
