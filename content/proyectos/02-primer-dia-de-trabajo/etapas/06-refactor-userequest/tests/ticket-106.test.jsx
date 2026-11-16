// @vitest-environment jsdom
// TICKET-106: extraer la carga de datos a un hook useRequest.
import { beforeEach, expect, test } from "vitest";
import { act, render, renderHook, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import codigoApp from "../src/App.jsx?raw"; // el código fuente como texto
import codigoMenu from "../src/components/MenuPanel.jsx?raw";
import { MenuPanel } from "../src/components/MenuPanel.jsx";
import { failNextRequest, getOrders, resetDatabase, updateOrderStatus } from "../src/api.js";

// Se carga así para que, mientras el archivo no exista, cada test falle con un mensaje claro.
const hooks = import.meta.glob("../src/hooks/useRequest.js", { eager: true });
const useRequest =
  hooks["../src/hooks/useRequest.js"]?.useRequest ??
  (() => {
    throw new Error("Todavía no existe src/hooks/useRequest.js con export function useRequest");
  });

beforeEach(() => resetDatabase());

async function hookListo() {
  const hook = renderHook(() => useRequest(getOrders, []));
  await waitFor(() => expect(hook.result.current.status).not.toBe("loading"));
  return hook.result;
}

test('empieza en "loading" con initialData y luego trae los datos', async () => {
  const { result } = renderHook(() => useRequest(getOrders, []));
  expect(result.current.status).toBe("loading");
  expect(result.current.data).toEqual([]);

  await waitFor(() => expect(result.current.status).toBe("ready"));
  expect(result.current.data).toHaveLength(6);
  expect(result.current.data[0].id).toBe(1041);
});

test('si la petición falla queda en "error" y reload la recupera', async () => {
  failNextRequest("getOrders");
  const result = await hookListo();
  expect(result.current.status).toBe("error");
  expect(result.current.data).toEqual([]);

  await act(() => result.current.reload());
  expect(result.current.status).toBe("ready");
  expect(result.current.data).toHaveLength(6);
});

test("reload vuelve a pedir y trae los datos nuevos del servidor", async () => {
  const result = await hookListo();
  await updateOrderStatus(1042, "en_cocina");

  await act(() => result.current.reload());
  expect(result.current.data.find((o) => o.id === 1042).status).toBe("en_cocina");
});

test("setData acepta un valor o una función, como useState", async () => {
  const result = await hookListo();
  act(() => result.current.setData((actual) => actual.filter((o) => o.id !== 1041)));
  expect(result.current.data).toHaveLength(5);

  act(() => result.current.setData([]));
  expect(result.current.data).toEqual([]);
  expect(result.current.status).toBe("ready");
});

test("funciona con cualquier petición, no solo con pedidos", async () => {
  const pedirSaludo = () => Promise.resolve("hola");
  const { result } = renderHook(() => useRequest(pedirSaludo, null));
  expect(result.current.data).toBeNull();
  await waitFor(() => expect(result.current.data).toBe("hola"));
});

test("App.jsx y MenuPanel.jsx usan useRequest y ya no tienen su propio useEffect", () => {
  for (const codigo of [codigoApp, codigoMenu]) {
    expect(codigo).toMatch(/useRequest\s*\(/);
    expect(codigo).not.toMatch(/useEffect\s*\(/);
  }
});

test("la carta mantiene sus textos de error y su reintento", async () => {
  const user = userEvent.setup();
  failNextRequest("getMenu");
  render(<MenuPanel />);
  const alerta = await screen.findByRole("alert");
  expect(alerta.textContent).toContain("No se pudo cargar la carta.");

  await user.click(within(alerta).getByRole("button", { name: "Reintentar" }));
  expect(screen.getByText("Cargando carta...")).toBeTruthy();
  expect(await screen.findByText("Ceviche clásico")).toBeTruthy();
  expect(screen.queryByRole("alert")).toBeNull();
});
