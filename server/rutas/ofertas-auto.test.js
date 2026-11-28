import { afterEach, describe, expect, it, vi } from "vitest";

// buscarOfertas se reemplaza: así se prueba solo lo que hace la ruta con su caché
const buscar = vi.fn();
vi.mock("../ofertas-auto.js", () => ({ buscarOfertas: (...a) => buscar(...a) }));
const { rutasOfertasAuto } = await import("./ofertas-auto.js");

/** Llama al manejador de GET /ofertas/buscar sin levantar un servidor. */
async function pedir(router, query = {}) {
  const capa = router.stack.find((c) => c.route?.path === "/ofertas/buscar");
  let cuerpo = null;
  await capa.route.stack[0].handle({ query }, { json: (c) => (cuerpo = c) });
  return cuerpo;
}

afterEach(() => buscar.mockReset());

describe("GET /ofertas/buscar", () => {
  it("si todas las fuentes fallan, conserva la última búsqueda buena y avisa sin conexión", async () => {
    const router = rutasOfertasAuto();
    buscar.mockResolvedValueOnce({ ofertas: [{ id: 1 }], fuentes: [{ fuente: "a", ok: true }] });
    expect((await pedir(router)).ofertas).toEqual([{ id: 1 }]);

    buscar.mockResolvedValueOnce({ ofertas: [], fuentes: [{ fuente: "a", ok: false }] });
    const sinRed = await pedir(router, { nuevo: "1" });
    expect(sinRed.ofertas).toEqual([{ id: 1 }]);
    expect(sinRed.sinConexion).toBe(true);

    // La caché vacía no quedó guardada: al volver la red se busca de nuevo
    buscar.mockResolvedValueOnce({ ofertas: [{ id: 2 }], fuentes: [{ fuente: "a", ok: true }] });
    expect((await pedir(router, { nuevo: "1" })).ofertas).toEqual([{ id: 2 }]);
  });

  it("sin búsqueda previa y sin red, responde vacío sin guardarlo", async () => {
    const router = rutasOfertasAuto();
    buscar.mockResolvedValueOnce({ ofertas: [], fuentes: [{ fuente: "a", ok: false }] });
    expect((await pedir(router)).sinConexion).toBe(true);
    buscar.mockResolvedValueOnce({ ofertas: [{ id: 3 }], fuentes: [{ fuente: "a", ok: true }] });
    expect((await pedir(router)).ofertas).toEqual([{ id: 3 }]);
  });
});
