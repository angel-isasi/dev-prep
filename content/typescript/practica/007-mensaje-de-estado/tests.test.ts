import { test, expect, expectTypeOf } from "vitest";
import { mensajeDeEstado, puedeCancelarse, type EstadoPedido } from "./solucion";

test("pendiente y pagado tienen su mensaje", () => {
  expect(mensajeDeEstado("pendiente")).toBe("Esperando el pago");
  expect(mensajeDeEstado("pagado")).toBe("Pago recibido, estamos preparando tu pedido");
});

test("enviado, entregado y cancelado tienen su mensaje", () => {
  expect(mensajeDeEstado("enviado")).toBe("Tu pedido está en camino");
  expect(mensajeDeEstado("entregado")).toBe("Pedido entregado");
  expect(mensajeDeEstado("cancelado")).toBe("Pedido cancelado");
});

test("se puede cancelar si está pendiente o pagado", () => {
  expect(puedeCancelarse("pendiente")).toBe(true);
  expect(puedeCancelarse("pagado")).toBe(true);
});

test("no se puede cancelar si ya salió o ya terminó", () => {
  expect(puedeCancelarse("enviado")).toBe(false);
  expect(puedeCancelarse("entregado")).toBe(false);
  expect(puedeCancelarse("cancelado")).toBe(false);
});

test("EstadoPedido es la unión de los 5 estados (lo revisa tsc)", () => {
  expectTypeOf<EstadoPedido>().toEqualTypeOf<"pendiente" | "pagado" | "enviado" | "entregado" | "cancelado">();
  const estado: EstadoPedido = "enviado";
  expect(mensajeDeEstado(estado)).toBe("Tu pedido está en camino");
});

test("no acepta un estado inventado (lo revisa tsc)", () => {
  const probar = () => {
    // @ts-expect-error "enviado-al-espacio" no es un EstadoPedido
    mensajeDeEstado("enviado-al-espacio");
    // @ts-expect-error las mayúsculas cuentan: "Pagado" no es "pagado"
    puedeCancelarse("Pagado");
  };
  expect(typeof probar).toBe("function");
});

test("un string cualquiera no es un EstadoPedido (lo revisa tsc)", () => {
  const probar = (textoDeLaApi: string) => {
    // @ts-expect-error un string puede ser cualquier texto, no solo un estado
    mensajeDeEstado(textoDeLaApi);
  };
  expect(typeof probar).toBe("function");
});
