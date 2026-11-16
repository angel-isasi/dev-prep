// @vitest-environment jsdom
import { test, expect, vi, afterEach } from "vitest";
import { act, render, screen } from "@testing-library/react";
import { DetalleProducto } from "./solucion.jsx";

afterEach(() => {
  vi.unstubAllGlobals();
});

const PRODUCTOS = {
  1: { id: 1, nombre: "Teclado mecánico", categoria: "accesorios", precio: 189.9, stock: 0 },
  2: { id: 2, nombre: "Mouse inalámbrico", categoria: "accesorios", precio: 59.9, stock: 7 },
  3: { id: 3, nombre: "Monitor 24 pulgadas", categoria: "pantallas", precio: 649, stock: 8 },
};

function respuesta(cuerpo, status = 200) {
  return { ok: status >= 200 && status < 300, status, json: async () => cuerpo };
}

/**
 * fetch falso: cada petición queda pendiente hasta que tú la resuelves con
 * `responder(url)` o `fallar(url, status)`. Si te pasan un `signal` y lo abortan,
 * la promesa se rechaza con AbortError, como el fetch real.
 */
function fetchManual() {
  const pendientes = {};
  const fetchFalso = vi.fn(
    (url, opciones = {}) =>
      new Promise((resolver, rechazar) => {
        pendientes[url] = { resolver, rechazar };
        opciones.signal?.addEventListener("abort", () =>
          rechazar(new DOMException("The operation was aborted.", "AbortError")),
        );
      }),
  );
  const idDe = (url) => Number(url.split("/").pop());
  return {
    fetchFalso,
    responder: (url) => act(async () => pendientes[url].resolver(respuesta(PRODUCTOS[idDe(url)]))),
    fallar: (url, status) => act(async () => pendientes[url].resolver(respuesta({ error: "x" }, status))),
  };
}

test("pide /api/practica/productos/<id> y muestra el detalle", async () => {
  vi.stubGlobal("fetch", vi.fn(async () => respuesta(PRODUCTOS[3])));
  render(<DetalleProducto id={3} />);
  expect(screen.getByRole("status").textContent).toBe("Cargando producto...");

  expect((await screen.findByRole("heading", { level: 2 })).textContent).toBe("Monitor 24 pulgadas");
  expect(screen.getByText("Categoría: pantallas")).toBeTruthy();
  expect(screen.getByText("Precio: S/ 649.00")).toBeTruthy();
  expect(screen.getByText("Stock: 8")).toBeTruthy();
  expect(globalThis.fetch.mock.calls[0][0]).toBe("/api/practica/productos/3");
});

test('con stock 0 muestra "Agotado"', async () => {
  vi.stubGlobal("fetch", vi.fn(async () => respuesta(PRODUCTOS[1])));
  render(<DetalleProducto id={1} />);
  expect(await screen.findByText("Agotado")).toBeTruthy();
  expect(screen.queryByText(/Stock:/)).toBeNull();
});

test('un 404 muestra "Producto no encontrado" y otro error un mensaje genérico', async () => {
  vi.stubGlobal("fetch", vi.fn(async () => respuesta({ error: "No encontrado" }, 404)));
  const { unmount } = render(<DetalleProducto id={99} />);
  expect((await screen.findByRole("alert")).textContent).toBe("Producto no encontrado");
  unmount();

  vi.stubGlobal(
    "fetch",
    vi.fn(async () => {
      throw new TypeError("Failed to fetch");
    }),
  );
  render(<DetalleProducto id={2} />);
  expect((await screen.findByRole("alert")).textContent).toBe("No se pudo cargar el producto");
});

test("al cambiar de id vuelve a pedir y no deja a la vista el producto anterior", async () => {
  const { fetchFalso, responder } = fetchManual();
  vi.stubGlobal("fetch", fetchFalso);
  const { rerender } = render(<DetalleProducto id={3} />);
  await responder("/api/practica/productos/3");
  expect(await screen.findByText("Monitor 24 pulgadas")).toBeTruthy();

  rerender(<DetalleProducto id={1} />);
  expect(screen.getByRole("status").textContent).toBe("Cargando producto...");
  expect(screen.queryByText("Monitor 24 pulgadas")).toBeNull();

  await responder("/api/practica/productos/1");
  expect(await screen.findByText("Teclado mecánico")).toBeTruthy();
  expect(fetchFalso).toHaveBeenCalledTimes(2);
});

test("una respuesta vieja que llega tarde no pisa a la nueva", async () => {
  const { fetchFalso, responder } = fetchManual();
  vi.stubGlobal("fetch", fetchFalso);
  const { rerender } = render(<DetalleProducto id={1} />);
  rerender(<DetalleProducto id={2} />);

  // El 2 responde primero...
  await responder("/api/practica/productos/2");
  expect(await screen.findByText("Mouse inalámbrico")).toBeTruthy();

  // ...y el 1 llega tarde: debe ignorarse.
  await responder("/api/practica/productos/1");
  await act(async () => {
    await new Promise((r) => setTimeout(r, 0));
  });
  expect(screen.getByRole("heading", { level: 2 }).textContent).toBe("Mouse inalámbrico");
  expect(screen.queryByText("Teclado mecánico")).toBeNull();
});

test("un error viejo que llega tarde tampoco pisa al producto nuevo", async () => {
  const { fetchFalso, responder, fallar } = fetchManual();
  vi.stubGlobal("fetch", fetchFalso);
  const { rerender } = render(<DetalleProducto id={1} />);
  rerender(<DetalleProducto id={3} />);

  await responder("/api/practica/productos/3");
  expect(await screen.findByText("Monitor 24 pulgadas")).toBeTruthy();

  await fallar("/api/practica/productos/1", 500);
  await act(async () => {
    await new Promise((r) => setTimeout(r, 0));
  });
  expect(screen.queryByRole("alert")).toBeNull();
  expect(screen.getByText("Monitor 24 pulgadas")).toBeTruthy();
});
