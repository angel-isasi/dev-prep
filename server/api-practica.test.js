import { afterAll, beforeAll, describe, expect, test } from "vitest";
import express from "express";
import { comportamiento, listarProductos, PRODUCTOS, rutasApiPractica } from "./api-practica.js";

describe("reglas puras", () => {
  test("pagina y filtra sin importar tildes ni mayúsculas", () => {
    const r = listarProductos({ pagina: 2, limite: 15 });
    expect(r.datos).toHaveLength(15);
    expect(r.datos[0].id).toBe(16);
    expect(r.totalPaginas).toBe(3);
    expect(listarProductos({ q: "MÓNITOR" }).datos.every((p) => p.nombre.includes("Monitor"))).toBe(true);
    expect(listarProductos({ categoria: "audio" }).total).toBe(PRODUCTOS.filter((p) => p.categoria === "audio").length);
  });

  test("página fuera de rango se ajusta y vacío da lista vacía", () => {
    expect(listarProductos({ pagina: 99 }).pagina).toBe(4);
    expect(listarProductos({ vacio: true })).toEqual({ datos: [], pagina: 1, totalPaginas: 1, total: 0 });
  });

  test("comportamiento: retraso pedido, estado forzado y fallo por probabilidad", () => {
    expect(comportamiento({ retraso: "50" }).retraso).toBe(50);
    expect(comportamiento({ retraso: "999999" }).retraso).toBe(10_000);
    expect(comportamiento({ estado: "429" }, () => 0.5).estado).toBe(429);
    expect(comportamiento({ fallo: "0.3" }, () => 0.1).estado).toBe(500);
    expect(comportamiento({ fallo: "0.3" }, () => 0.9).estado).toBe(null);
    expect(comportamiento({ estado: "200" }, () => 0.9).estado).toBe(null);
  });
});

describe("rutas", () => {
  let servidor;
  let base;
  beforeAll(async () => {
    const app = express();
    app.use(express.json());
    app.use("/api/practica", rutasApiPractica({ esperar: async () => {}, azar: () => 0.99 }));
    await new Promise((listo) => (servidor = app.listen(0, listo)));
    base = `http://127.0.0.1:${servidor.address().port}/api/practica`;
  });
  afterAll(() => servidor.close());

  test("productos y producto por id", async () => {
    const lista = await (await fetch(`${base}/productos?limite=5`)).json();
    expect(lista.datos).toHaveLength(5);
    expect((await (await fetch(`${base}/productos/3`)).json()).nombre).toBe("Monitor 24 pulgadas");
    expect((await fetch(`${base}/productos/999`)).status).toBe(404);
  });

  test("errores forzados", async () => {
    const r = await fetch(`${base}/productos?estado=503`);
    expect(r.status).toBe(503);
    expect(await r.json()).toEqual({ error: "Servicio no disponible" });
  });

  test("crear, actualizar y borrar tareas", async () => {
    const vacia = await fetch(`${base}/tareas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ titulo: "  " }),
    });
    expect(vacia.status).toBe(400);
    const creada = await (
      await fetch(`${base}/tareas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titulo: "Nueva" }),
      })
    ).json();
    expect(creada).toEqual({ id: 4, titulo: "Nueva", hecha: false });
    const hecha = await (
      await fetch(`${base}/tareas/4`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hecha: true }),
      })
    ).json();
    expect(hecha.hecha).toBe(true);
    expect((await fetch(`${base}/tareas/4`, { method: "DELETE" })).status).toBe(204);
    expect((await fetch(`${base}/tareas/4`, { method: "DELETE" })).status).toBe(404);
    expect(await (await fetch(`${base}/tareas?vacio=1`)).json()).toEqual([]);
  });
});
