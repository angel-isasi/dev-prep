// @vitest-environment jsdom
import { test, expect, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { ListaProductos } from "./solucion.jsx";

afterEach(() => {
  vi.unstubAllGlobals();
});

// Una respuesta falsa de fetch: solo lo que el componente usa.
function respuesta(cuerpo, status = 200) {
  return { ok: status >= 200 && status < 300, status, json: async () => cuerpo };
}

const PRODUCTOS = [
  { id: 1, nombre: "Teclado mecánico", categoria: "accesorios", precio: 189.9, stock: 0 },
  { id: 3, nombre: "Monitor 24 pulgadas", categoria: "pantallas", precio: 649, stock: 8 },
];

test('muestra "Cargando productos..." con role="status" mientras espera', () => {
  vi.stubGlobal("fetch", vi.fn(() => new Promise(() => {}))); // nunca responde
  render(<ListaProductos />);
  expect(screen.getByRole("status").textContent).toBe("Cargando productos...");
});

test("pide /api/practica/productos una vez y muestra nombre, precio con 2 decimales y el total", async () => {
  const fetchFalso = vi.fn(async () => respuesta({ datos: PRODUCTOS, pagina: 1, totalPaginas: 4, total: 40 }));
  vi.stubGlobal("fetch", fetchFalso);
  render(<ListaProductos />);

  const lista = await screen.findByRole("list", { name: "Productos" });
  const items = [...lista.querySelectorAll("li")].map((li) => li.textContent);
  expect(items).toEqual(["Teclado mecánico: S/ 189.90", "Monitor 24 pulgadas: S/ 649.00"]);
  expect(screen.getByText("Mostrando 2 de 40 productos")).toBeTruthy();
  expect(fetchFalso).toHaveBeenCalledTimes(1);
  expect(fetchFalso.mock.calls[0][0]).toBe("/api/practica/productos");
  expect(screen.queryByRole("status")).toBeNull();
});

test('si datos llega vacío muestra "No hay productos" y ninguna lista', async () => {
  vi.stubGlobal("fetch", vi.fn(async () => respuesta({ datos: [], pagina: 1, totalPaginas: 1, total: 0 })));
  render(<ListaProductos />);
  expect(await screen.findByText("No hay productos")).toBeTruthy();
  expect(screen.queryByRole("list")).toBeNull();
});

test("con un 500 muestra el mensaje de error que manda el servidor", async () => {
  vi.stubGlobal("fetch", vi.fn(async () => respuesta({ error: "Error del servidor" }, 500)));
  render(<ListaProductos />);
  const alerta = await screen.findByRole("alert");
  expect(alerta.textContent).toBe("No se pudieron cargar los productos: Error del servidor");
  expect(screen.queryByRole("list")).toBeNull();
});

test('si el error no trae mensaje (o no es JSON) usa "Error <status>"', async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => ({
      ok: false,
      status: 404,
      json: async () => {
        throw new SyntaxError("Unexpected token < in JSON");
      },
    })),
  );
  render(<ListaProductos />);
  const alerta = await screen.findByRole("alert");
  expect(alerta.textContent).toBe("No se pudieron cargar los productos: Error 404");
});

test("sin conexión (fetch se rechaza) pide revisar la conexión", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => {
      throw new TypeError("Failed to fetch");
    }),
  );
  render(<ListaProductos />);
  const alerta = await screen.findByRole("alert");
  expect(alerta.textContent).toBe("No se pudieron cargar los productos: revisa tu conexión");
});
