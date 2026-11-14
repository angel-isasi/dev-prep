import { test, expect, expectTypeOf, vi } from "vitest";
import { obtenerUsuarios, esUsuario, type Usuario, type FetchFn } from "./solucion";

// Un fetch falso: responde siempre con el status y el cuerpo que le digas.
const fetchFalso = (status: number, cuerpo: unknown) =>
  vi.fn<FetchFn>(async () => ({ ok: status >= 200 && status < 300, status, json: async () => cuerpo }));

const ana = { id: 1, nombre: "Ana", email: "ana@correo.com" };
const luis = { id: 2, nombre: "Luis", email: "luis@correo.com" };

test("pide /api/usuarios y devuelve la lista de usuarios", async () => {
  const fetchFn = fetchFalso(200, [ana, luis]);
  expect(await obtenerUsuarios(fetchFn)).toEqual([ana, luis]);
  expect(fetchFn).toHaveBeenCalledWith("/api/usuarios");
});

test("una lista vacía es válida", async () => {
  expect(await obtenerUsuarios(fetchFalso(200, []))).toEqual([]);
});

test('un error HTTP lanza "HTTP <status>"', async () => {
  await expect(obtenerUsuarios(fetchFalso(500, { error: "falló" }))).rejects.toThrow("HTTP 500");
  await expect(obtenerUsuarios(fetchFalso(404, null))).rejects.toThrow("HTTP 404");
});

test("si no llega una lista, lanza un error claro", async () => {
  await expect(obtenerUsuarios(fetchFalso(200, { usuarios: [ana] }))).rejects.toThrow(
    "Respuesta inválida: se esperaba una lista",
  );
});

test("si un usuario no tiene la forma correcta, dice en qué posición", async () => {
  const roto = { id: "2", nombre: "Luis", email: "luis@correo.com" }; // id como texto
  await expect(obtenerUsuarios(fetchFalso(200, [ana, roto]))).rejects.toThrow("Usuario inválido en la posición 1");
  await expect(obtenerUsuarios(fetchFalso(200, [null]))).rejects.toThrow("Usuario inválido en la posición 0");
});

test("descarta los campos que no son de Usuario", async () => {
  const conExtra = { ...ana, password: "secreta", rol: "admin" };
  const [usuario] = await obtenerUsuarios(fetchFalso(200, [conExtra]));
  expect(usuario).toEqual(ana);
  expect("password" in usuario).toBe(false);
});

test("esUsuario reconoce un Usuario y rechaza lo demás", () => {
  expect(esUsuario(ana)).toBe(true);
  expect(esUsuario({ id: 1, nombre: "Ana" })).toBe(false);
  expect(esUsuario("Ana")).toBe(false);
  expect(esUsuario(null)).toBe(false);
});

test("los tipos: devuelve Promise<Usuario[]> y esUsuario es un type guard (lo revisa tsc)", () => {
  expectTypeOf(obtenerUsuarios).returns.toEqualTypeOf<Promise<Usuario[]>>();
  // El fetch real del navegador también encaja en FetchFn.
  expectTypeOf(fetch).toExtend<FetchFn>();
  const valor: unknown = ana;
  if (esUsuario(valor)) expectTypeOf(valor).toEqualTypeOf<Usuario>();
});
