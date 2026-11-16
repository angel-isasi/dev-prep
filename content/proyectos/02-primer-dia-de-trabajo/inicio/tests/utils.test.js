// Tests del equipo para src/utils/. Deben seguir pasando después de cada ticket.
import { describe, expect, test } from "vitest";
import { calcOrderTotal, formatPrice } from "../src/utils/money.js";
import { countByStatus, getActionLabel, getNextStatus } from "../src/utils/status.js";
import { matchesQuery, normalize } from "../src/utils/text.js";

describe("money", () => {
  test("formatPrice muestra soles con dos decimales", () => {
    expect(formatPrice(38)).toBe("S/ 38.00");
    expect(formatPrice(9.5)).toBe("S/ 9.50");
    expect(formatPrice(0)).toBe("S/ 0.00");
  });

  test("calcOrderTotal suma los precios de los items", () => {
    const items = [
      { dishId: 2, name: "Lomo saltado", price: 42, quantity: 1 },
      { dishId: 8, name: "Inca Kola 1 L", price: 9.5, quantity: 1 },
    ];
    expect(calcOrderTotal(items)).toBe(51.5);
  });
});

describe("status", () => {
  test("getNextStatus sigue el flujo del pedido", () => {
    expect(getNextStatus("pendiente")).toBe("en_cocina");
    expect(getNextStatus("en_cocina")).toBe("listo");
    expect(getNextStatus("listo")).toBe("entregado");
    expect(getNextStatus("entregado")).toBeNull();
  });

  test("getActionLabel da el texto del botón y null al final", () => {
    expect(getActionLabel("pendiente")).toBe("Enviar a cocina");
    expect(getActionLabel("entregado")).toBeNull();
  });

  test("countByStatus cuenta los pedidos de cada estado", () => {
    const orders = [{ status: "pendiente" }, { status: "pendiente" }, { status: "listo" }];
    expect(countByStatus(orders)).toEqual({ pendiente: 2, en_cocina: 0, listo: 1, entregado: 0 });
  });
});

describe("text", () => {
  test("normalize quita tildes, mayúsculas y espacios", () => {
    expect(normalize("  José Ñahui ")).toBe("jose nahui");
  });

  test("matchesQuery ignora tildes y funciona con números", () => {
    expect(matchesQuery("Ají de gallina", "aji")).toBe(true);
    expect(matchesQuery(1043, "104")).toBe(true);
    expect(matchesQuery("Lomo saltado", "ceviche")).toBe(false);
  });
});
