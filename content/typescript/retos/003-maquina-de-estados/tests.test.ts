import { test, expect, expectTypeOf } from "vitest";
import { transicionar, mensajeDeEstado, type Pedido } from "./solucion";

const nuevo: Pedido = { estado: "pendiente", id: "P-1" };

test("pagar un pedido pendiente lo deja pagado con su fecha", () => {
  expect(transicionar(nuevo, { tipo: "pagar", fecha: "2026-11-14" })).toEqual({
    estado: "pagado",
    id: "P-1",
    pagadoEn: "2026-11-14",
  });
});

test("flujo completo: pendiente, pagado, enviado y entregado", () => {
  const pagado = transicionar(nuevo, { tipo: "pagar", fecha: "2026-11-14" });
  const enviado = transicionar(pagado, { tipo: "enviar", codigoSeguimiento: "OLV-123" });
  expect(enviado).toEqual({ estado: "enviado", id: "P-1", pagadoEn: "2026-11-14", codigoSeguimiento: "OLV-123" });
  const entregado = transicionar(enviado, { tipo: "entregar" });
  expect(entregado).toEqual({ estado: "entregado", id: "P-1", pagadoEn: "2026-11-14", codigoSeguimiento: "OLV-123" });
});

test("se puede cancelar un pedido pendiente o pagado", () => {
  expect(transicionar(nuevo, { tipo: "cancelar", motivo: "Me equivoqué" })).toEqual({
    estado: "cancelado",
    id: "P-1",
    motivo: "Me equivoqué",
  });
  const pagado: Pedido = { estado: "pagado", id: "P-2", pagadoEn: "2026-11-10" };
  expect(transicionar(pagado, { tipo: "cancelar", motivo: "Sin stock" })).toEqual({
    estado: "cancelado",
    id: "P-2",
    motivo: "Sin stock",
  });
});

test("una transición inválida lanza un error que lo explica", () => {
  expect(() => transicionar(nuevo, { tipo: "enviar", codigoSeguimiento: "X" })).toThrow(
    "No se puede enviar un pedido pendiente",
  );
  const enviado: Pedido = { estado: "enviado", id: "P-3", pagadoEn: "2026-11-10", codigoSeguimiento: "X" };
  expect(() => transicionar(enviado, { tipo: "cancelar", motivo: "Ya no lo quiero" })).toThrow(
    "No se puede cancelar un pedido enviado",
  );
  const cancelado: Pedido = { estado: "cancelado", id: "P-4", motivo: "Duplicado" };
  expect(() => transicionar(cancelado, { tipo: "pagar", fecha: "2026-11-14" })).toThrow(
    "No se puede pagar un pedido cancelado",
  );
});

test("no modifica el pedido original", () => {
  const pedido: Pedido = { estado: "pendiente", id: "P-5" };
  transicionar(pedido, { tipo: "pagar", fecha: "2026-11-14" });
  expect(pedido).toEqual({ estado: "pendiente", id: "P-5" });
});

test("mensajeDeEstado describe cada estado con sus datos", () => {
  expect(mensajeDeEstado(nuevo)).toBe("Pendiente de pago");
  expect(mensajeDeEstado({ estado: "pagado", id: "1", pagadoEn: "2026-11-14" })).toBe("Pagado el 2026-11-14");
  expect(
    mensajeDeEstado({ estado: "enviado", id: "1", pagadoEn: "2026-11-14", codigoSeguimiento: "OLV-123" }),
  ).toBe("En camino (seguimiento OLV-123)");
  expect(
    mensajeDeEstado({ estado: "entregado", id: "1", pagadoEn: "2026-11-14", codigoSeguimiento: "OLV-123" }),
  ).toBe("Entregado");
  expect(mensajeDeEstado({ estado: "cancelado", id: "1", motivo: "Sin stock" })).toBe("Cancelado: Sin stock");
});

test("Pedido es una unión discriminada (lo revisa tsc)", () => {
  const p = transicionar(nuevo, { tipo: "pagar", fecha: "2026-11-14" });
  if (p.estado === "enviado") expectTypeOf(p.codigoSeguimiento).toEqualTypeOf<string>();
  if (p.estado === "cancelado") expectTypeOf(p.motivo).toEqualTypeOf<string>();
  const probar = () => {
    // @ts-expect-error un pedido enviado necesita su codigoSeguimiento
    const a: Pedido = { estado: "enviado", id: "1", pagadoEn: "2026-11-14" };
    // @ts-expect-error un pedido pendiente no tiene motivo
    const b: Pedido = { estado: "pendiente", id: "1", motivo: "x" };
    // @ts-expect-error "perdido" no es un estado válido
    const c: Pedido = { estado: "perdido", id: "1" };
    // @ts-expect-error sin revisar el estado no sabes si hay código de seguimiento
    const d = p.codigoSeguimiento;
    return [a, b, c, d];
  };
  expect(typeof probar).toBe("function");
});
