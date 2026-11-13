// @vitest-environment jsdom
import { test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { soles, ResumenPedido } from "./solucion.jsx";

// Devuelve el texto del <dd> que sigue al <dt> con ese concepto.
function montoDe(concepto) {
  return screen.getByText(concepto).nextElementSibling.textContent;
}

test("soles da formato con 2 decimales", () => {
  expect(soles(118)).toBe("S/ 118.00");
  expect(soles(5.5)).toBe("S/ 5.50");
});

test("muestra subtotal, IGV y total", () => {
  render(<ResumenPedido items={[{ precio: 30, cantidad: 2 }, { precio: 40, cantidad: 1 }]} />);
  expect(montoDe("Subtotal")).toBe("S/ 100.00");
  expect(montoDe("IGV (18%)")).toBe("S/ 18.00");
  expect(montoDe("Total")).toBe("S/ 118.00");
});

test("redondea a 2 decimales con precios con céntimos", () => {
  render(<ResumenPedido items={[{ precio: 9.9, cantidad: 3 }]} />);
  expect(montoDe("Subtotal")).toBe("S/ 29.70");
  expect(montoDe("IGV (18%)")).toBe("S/ 5.35");
  expect(montoDe("Total")).toBe("S/ 35.05");
});

test("con el carrito vacío todo es S/ 0.00", () => {
  render(<ResumenPedido items={[]} />);
  expect(screen.getAllByText("S/ 0.00").length).toBe(3);
});
