// @vitest-environment jsdom
import { test, expect, vi, beforeEach, afterEach } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { BuscadorProductos } from "./solucion.jsx";

// Temporizadores falsos: los 400 ms del debounce pasan al instante.
beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

function respuesta(cuerpo, status = 200) {
  return { ok: status >= 200 && status < 300, status, json: async () => cuerpo };
}

const pagina = (datos) => ({ datos, pagina: 1, totalPaginas: 1, total: datos.length });

/** fetch falso: cada petición espera a que la resuelvas; si la abortan, se rechaza con AbortError. */
function fetchManual() {
  const pendientes = [];
  const fetchFalso = vi.fn(
    (url, opciones = {}) =>
      new Promise((resolver, rechazar) => {
        pendientes.push({ url, opciones, resolver });
        opciones.signal?.addEventListener("abort", () =>
          rechazar(new DOMException("The operation was aborted.", "AbortError")),
        );
      }),
  );
  return { fetchFalso, pendientes };
}

/** Avanza el reloj falso y deja que terminen las promesas pendientes. */
async function avanzar(ms) {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });
}

const escribir = (texto) => fireEvent.change(screen.getByRole("searchbox", { name: "Buscar productos" }), { target: { value: texto } });
const consultaDe = (url) => {
  const u = new URL(url, "http://localhost");
  return { ruta: u.pathname, q: u.searchParams.get("q") };
};

test("espera 400 ms desde la última tecla y hace UNA sola petición con el texto final", async () => {
  const { fetchFalso } = fetchManual();
  vi.stubGlobal("fetch", fetchFalso);
  render(<BuscadorProductos />);

  escribir("d");
  await avanzar(200);
  escribir("disco");
  await avanzar(200);
  escribir("disco ssd");
  await avanzar(399);
  expect(fetchFalso).not.toHaveBeenCalled();

  await avanzar(1);
  expect(fetchFalso).toHaveBeenCalledTimes(1);
  expect(consultaDe(fetchFalso.mock.calls[0][0])).toEqual({ ruta: "/api/practica/productos", q: "disco ssd" });
});

test('muestra "Buscando..." y luego los resultados', async () => {
  const { fetchFalso, pendientes } = fetchManual();
  vi.stubGlobal("fetch", fetchFalso);
  render(<BuscadorProductos />);

  escribir("monitor");
  await avanzar(0);
  expect(screen.getByRole("status").textContent).toBe("Buscando...");
  await avanzar(400);

  await act(async () =>
    pendientes[0].resolver(
      respuesta(pagina([{ id: 3, nombre: "Monitor 24 pulgadas" }, { id: 14, nombre: "Monitor 27 pulgadas 4K" }])),
    ),
  );
  await avanzar(0);
  const lista = screen.getByRole("list", { name: "Resultados" });
  expect([...lista.querySelectorAll("li")].map((li) => li.textContent)).toEqual([
    "Monitor 24 pulgadas",
    "Monitor 27 pulgadas 4K",
  ]);
  expect(screen.queryByRole("status")).toBeNull();
});

test('sin coincidencias muestra No hay resultados para "<texto>"', async () => {
  vi.stubGlobal("fetch", vi.fn(async () => respuesta(pagina([]))));
  render(<BuscadorProductos />);
  escribir("xyz");
  await avanzar(400);
  await avanzar(0);
  expect(screen.getByText('No hay resultados para "xyz"')).toBeTruthy();
  expect(screen.queryByRole("list")).toBeNull();
});

test("una búsqueda nueva aborta la petición anterior y su respuesta no se muestra", async () => {
  const { fetchFalso, pendientes } = fetchManual();
  vi.stubGlobal("fetch", fetchFalso);
  render(<BuscadorProductos />);

  escribir("mon");
  await avanzar(400);
  expect(fetchFalso).toHaveBeenCalledTimes(1);

  escribir("mouse");
  await avanzar(400);
  expect(fetchFalso).toHaveBeenCalledTimes(2);
  // La primera petición recibió un signal y quedó abortada.
  expect(pendientes[0].opciones.signal).toBeTruthy();
  expect(pendientes[0].opciones.signal.aborted).toBe(true);
  expect(pendientes[1].opciones.signal.aborted).toBe(false);

  await act(async () => pendientes[1].resolver(respuesta(pagina([{ id: 2, nombre: "Mouse inalámbrico" }]))));
  await avanzar(0);
  expect(screen.getByText("Mouse inalámbrico")).toBeTruthy();
  expect(screen.queryByRole("alert")).toBeNull();
});

test("con el campo vacío (o solo espacios) no pide nada y borra los resultados", async () => {
  const fetchFalso = vi.fn(async () => respuesta(pagina([{ id: 9, nombre: "Parlante bluetooth" }])));
  vi.stubGlobal("fetch", fetchFalso);
  render(<BuscadorProductos />);

  escribir("   ");
  await avanzar(1000);
  expect(fetchFalso).not.toHaveBeenCalled();

  escribir("parlante");
  await avanzar(400);
  await avanzar(0);
  expect(screen.getByText("Parlante bluetooth")).toBeTruthy();

  escribir("");
  await avanzar(1000);
  expect(screen.queryByRole("list")).toBeNull();
  expect(screen.queryByRole("status")).toBeNull();
  expect(fetchFalso).toHaveBeenCalledTimes(1);
});

test("si el servidor falla muestra una alerta", async () => {
  vi.stubGlobal("fetch", vi.fn(async () => respuesta({ error: "Error del servidor" }, 500)));
  render(<BuscadorProductos />);
  escribir("hub");
  await avanzar(400);
  await avanzar(0);
  expect(screen.getByRole("alert").textContent).toContain("Error 500");
});
