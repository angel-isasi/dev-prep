// @vitest-environment jsdom
import { test, expect, expectTypeOf, vi } from "vitest";
import { render, screen, renderHook, waitFor, act } from "@testing-library/react";
import { useFetch, ListaUsuarios, type EstadoFetch, type FetchFn, type Usuario } from "./solucion";

// Un fetch falso que responde 200 con el cuerpo que le digas.
const respuestaOk = (cuerpo: unknown) => ({ ok: true, status: 200, json: async () => cuerpo });

const usuarios: Usuario[] = [
  { id: 1, nombre: "Ana" },
  { id: 2, nombre: "Luis" },
];

test("empieza cargando y luego pasa a exito con los datos", async () => {
  const fetchFn = vi.fn<FetchFn>(async () => respuestaOk(usuarios));
  const { result } = renderHook(() => useFetch<Usuario[]>("/api/usuarios", fetchFn));
  expect(result.current).toEqual({ estado: "cargando" });
  await waitFor(() => expect(result.current).toEqual({ estado: "exito", datos: usuarios }));
  expect(fetchFn).toHaveBeenCalledWith("/api/usuarios");
});

test('un error HTTP termina en estado "error" con "HTTP <status>"', async () => {
  const fetchFn = vi.fn<FetchFn>(async () => ({ ok: false, status: 404, json: async () => ({}) }));
  const { result } = renderHook(() => useFetch<Usuario[]>("/no-existe", fetchFn));
  await waitFor(() => expect(result.current).toEqual({ estado: "error", error: "HTTP 404" }));
});

test("un fallo de red también termina en error, con su mensaje", async () => {
  const fetchFn = vi.fn<FetchFn>(async () => {
    throw new Error("Sin conexión");
  });
  const { result } = renderHook(() => useFetch<Usuario[]>("/api/usuarios", fetchFn));
  await waitFor(() => expect(result.current).toEqual({ estado: "error", error: "Sin conexión" }));
});

test("si la url cambia, vuelve a cargando y pide la nueva", async () => {
  const fetchFn = vi.fn<FetchFn>(async (url) => respuestaOk(url));
  const { result, rerender } = renderHook(({ url }) => useFetch<string>(url, fetchFn), {
    initialProps: { url: "/a" },
  });
  await waitFor(() => expect(result.current).toEqual({ estado: "exito", datos: "/a" }));
  rerender({ url: "/b" });
  await waitFor(() => expect(result.current).toEqual({ estado: "exito", datos: "/b" }));
  expect(fetchFn).toHaveBeenCalledTimes(2);
});

test("una respuesta vieja que llega tarde no pisa a la nueva", async () => {
  const pendientes: Record<string, () => void> = {};
  const fetchFn = vi.fn<FetchFn>(
    (url) =>
      new Promise((resolver) => {
        pendientes[url] = () => resolver(respuestaOk(url));
      }),
  );
  const { result, rerender } = renderHook(({ url }) => useFetch<string>(url, fetchFn), {
    initialProps: { url: "/lenta" },
  });
  rerender({ url: "/rapida" });
  await act(async () => {
    pendientes["/rapida"]();
  });
  await waitFor(() => expect(result.current).toEqual({ estado: "exito", datos: "/rapida" }));
  await act(async () => {
    pendientes["/lenta"]();
    await new Promise((r) => setTimeout(r, 0));
  });
  expect(result.current).toEqual({ estado: "exito", datos: "/rapida" });
});

test("ListaUsuarios muestra Cargando… y luego los nombres", async () => {
  const fetchFn = vi.fn<FetchFn>(async () => respuestaOk(usuarios));
  render(<ListaUsuarios fetchFn={fetchFn} />);
  expect(screen.getByText("Cargando…")).toBeTruthy();
  expect(await screen.findByText("Ana")).toBeTruthy();
  expect(screen.getAllByRole("listitem").map((li) => li.textContent)).toEqual(["Ana", "Luis"]);
});

test("ListaUsuarios muestra el error en un role=alert", async () => {
  const fetchFn = vi.fn<FetchFn>(async () => ({ ok: false, status: 500, json: async () => null }));
  render(<ListaUsuarios fetchFn={fetchFn} />);
  expect((await screen.findByRole("alert")).textContent).toBe("HTTP 500");
});

test("el estado es una unión discriminada (lo revisa tsc)", () => {
  expectTypeOf(useFetch<Usuario[]>).returns.toEqualTypeOf<EstadoFetch<Usuario[]>>();
  expectTypeOf(fetch).toExtend<FetchFn>();
  const probar = (r: EstadoFetch<Usuario[]>) => {
    if (r.estado === "exito") expectTypeOf(r.datos).toEqualTypeOf<Usuario[]>();
    if (r.estado === "error") expectTypeOf(r.error).toEqualTypeOf<string>();
    // @ts-expect-error sin revisar r.estado no sabes si hay datos
    const datos = r.datos;
    // @ts-expect-error "listo" no es un estado válido
    const otro: EstadoFetch<Usuario[]> = { estado: "listo" };
    return [datos, otro];
  };
  expect(typeof probar).toBe("function");
});
