// @vitest-environment jsdom
import { test, expect, vi, afterEach } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { ProductosPaginados } from "./solucion.jsx";

afterEach(() => {
  vi.unstubAllGlobals();
});

function respuesta(cuerpo, status = 200) {
  return { ok: status >= 200 && status < 300, status, json: async () => cuerpo };
}

/** Responde como la API de práctica: pagina la lista según ?pagina= y ?limite=. */
function cuerpoPara(url, total) {
  const p = new URL(url, "http://localhost").searchParams;
  const limite = Number(p.get("limite")) || 10;
  const totalPaginas = Math.max(1, Math.ceil(total / limite));
  const pagina = Math.min(Math.max(1, Number(p.get("pagina")) || 1), totalPaginas);
  const datos = [];
  for (let i = (pagina - 1) * limite + 1; i <= Math.min(total, pagina * limite); i++) {
    datos.push({ id: i, nombre: `Producto ${i}`, categoria: "accesorios", precio: 10, stock: 1 });
  }
  return { datos, pagina, totalPaginas, total };
}

/** fetch falso que responde al instante con `total` productos. */
function servidor(total) {
  return vi.fn(async (url) => respuesta(cuerpoPara(url, total)));
}

/** fetch falso cuyas respuestas sueltas tú, una por una. */
function servidorManual(total) {
  const pendientes = [];
  const fetchFalso = vi.fn((url) => new Promise((resolver) => pendientes.push({ url, resolver })));
  const soltar = (i) => act(async () => pendientes[i].resolver(respuesta(cuerpoPara(pendientes[i].url, total))));
  return { fetchFalso, pendientes, soltar };
}

const boton = (nombre) => screen.getByRole("button", { name: nombre });
const nombres = () => screen.getAllByRole("listitem").map((li) => li.textContent);
const params = (url) => Object.fromEntries(new URL(url, "http://localhost").searchParams);

test("pide la página 1 con limite=10, muestra 10 productos y Anterior deshabilitado", async () => {
  const fetchFalso = servidor(40);
  vi.stubGlobal("fetch", fetchFalso);
  render(<ProductosPaginados />);
  expect(screen.getByRole("status")).toBeTruthy();

  expect(await screen.findByText("Página 1 de 4")).toBeTruthy();
  expect(nombres()).toHaveLength(10);
  expect(nombres()[0]).toBe("Producto 1");
  expect(boton("Anterior").disabled).toBe(true);
  expect(boton("Siguiente").disabled).toBe(false);

  const url = fetchFalso.mock.calls[0][0];
  expect(new URL(url, "http://localhost").pathname).toBe("/api/practica/productos");
  expect(params(url)).toMatchObject({ pagina: "1", limite: "10" });
});

test("Siguiente pide la página 2; mientras carga, los dos botones se deshabilitan", async () => {
  const { fetchFalso, soltar } = servidorManual(40);
  vi.stubGlobal("fetch", fetchFalso);
  render(<ProductosPaginados />);
  await soltar(0);
  await screen.findByText("Página 1 de 4");

  fireEvent.click(boton("Siguiente"));
  expect(fetchFalso).toHaveBeenCalledTimes(2);
  expect(params(fetchFalso.mock.calls[1][0])).toMatchObject({ pagina: "2", limite: "10" });
  expect(boton("Anterior").disabled).toBe(true);
  expect(boton("Siguiente").disabled).toBe(true);

  await soltar(1);
  expect(await screen.findByText("Página 2 de 4")).toBeTruthy();
  expect(nombres()[0]).toBe("Producto 11");
  expect(boton("Anterior").disabled).toBe(false);
  expect(boton("Siguiente").disabled).toBe(false);
});

test("en la última página Siguiente queda deshabilitado y Anterior regresa", async () => {
  vi.stubGlobal("fetch", servidor(40));
  render(<ProductosPaginados />);
  await screen.findByText("Página 1 de 4");

  for (const n of [2, 3, 4]) {
    fireEvent.click(boton("Siguiente"));
    await screen.findByText(`Página ${n} de 4`);
  }
  expect(nombres()[0]).toBe("Producto 31");
  expect(boton("Siguiente").disabled).toBe(true);
  expect(boton("Anterior").disabled).toBe(false);

  fireEvent.click(boton("Anterior"));
  expect(await screen.findByText("Página 3 de 4")).toBeTruthy();
  expect(nombres()[0]).toBe("Producto 21");
});

test("con una sola página los dos botones están deshabilitados", async () => {
  vi.stubGlobal("fetch", servidor(3));
  render(<ProductosPaginados />);
  expect(await screen.findByText("Página 1 de 1")).toBeTruthy();
  expect(nombres()).toEqual(["Producto 1", "Producto 2", "Producto 3"]);
  expect(boton("Anterior").disabled).toBe(true);
  expect(boton("Siguiente").disabled).toBe(true);
});

test('sin productos muestra "No hay productos" y ningún botón', async () => {
  vi.stubGlobal("fetch", servidor(0));
  render(<ProductosPaginados />);
  expect(await screen.findByText("No hay productos")).toBeTruthy();
  expect(screen.queryByRole("button")).toBeNull();
});

test("si falla el cambio de página, la lista anterior se queda y Siguiente vuelve a intentarlo", async () => {
  const fetchFalso = vi
    .fn()
    .mockImplementationOnce(async (url) => respuesta(cuerpoPara(url, 40)))
    .mockImplementationOnce(async () => respuesta({ error: "Error del servidor" }, 500))
    .mockImplementationOnce(async (url) => respuesta(cuerpoPara(url, 40)));
  vi.stubGlobal("fetch", fetchFalso);
  render(<ProductosPaginados />);
  await screen.findByText("Página 1 de 4");

  fireEvent.click(boton("Siguiente"));
  expect((await screen.findByRole("alert")).textContent).toContain("Error 500");
  expect(screen.getByText("Página 1 de 4")).toBeTruthy();
  expect(nombres()[0]).toBe("Producto 1");

  // Mismo botón, misma página pedida: igual debe salir una petición nueva.
  fireEvent.click(boton("Siguiente"));
  expect(await screen.findByText("Página 2 de 4")).toBeTruthy();
  expect(fetchFalso).toHaveBeenCalledTimes(3);
  expect(params(fetchFalso.mock.calls[2][0])).toMatchObject({ pagina: "2" });
  expect(screen.queryByRole("alert")).toBeNull();
});

test("si falla la primera carga muestra una alerta", async () => {
  vi.stubGlobal("fetch", vi.fn(async () => respuesta({ error: "Error del servidor" }, 500)));
  render(<ProductosPaginados />);
  expect((await screen.findByRole("alert")).textContent).toContain("Error 500");
});
