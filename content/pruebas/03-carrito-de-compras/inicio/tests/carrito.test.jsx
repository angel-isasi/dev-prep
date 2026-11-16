// @vitest-environment jsdom
// Tests de aceptación: prueban lo que ve y hace el usuario, no cómo está hecho por dentro.
import { test, expect, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../src/App.jsx";

const STORAGE_KEY = "cafe-altura:cart";
const VILLA_RICA = "Café Villa Rica 250 g"; // S/ 32.00
const CHANCHAMAYO = "Café Chanchamayo 500 g"; // S/ 55.00
const PRENSA = "Prensa francesa 600 ml"; // S/ 89.90

beforeEach(() => {
  localStorage.clear();
});

function setup() {
  const user = userEvent.setup();
  const view = render(<App />);
  return { user, ...view };
}

/** El <li> de un producto del catálogo. */
function product(name) {
  const list = screen.getByRole("list", { name: "Productos" });
  return within(list).getByRole("heading", { name, level: 3 }).closest("li");
}

const addButton = (name) => within(product(name)).getByRole("button", { name: "Agregar al carrito" });
const cart = () => screen.getByRole("region", { name: "Tu carrito" });
const quantity = (name) => within(cart()).getByLabelText(`Cantidad de ${name}`).textContent;
const cartLines = () => within(cart()).queryAllByRole("listitem");

/** Valor de una fila del resumen (<dt>etiqueta</dt><dd>valor</dd>). */
function summary(label) {
  return within(cart()).getByText(label, { selector: "dt" }).nextElementSibling.textContent;
}

async function add(user, name, times = 1) {
  for (let i = 0; i < times; i++) await user.click(addButton(name));
}

async function applyCoupon(user, code) {
  const input = within(cart()).getByLabelText("Cupón de descuento");
  await user.clear(input);
  await user.type(input, code);
  await user.click(within(cart()).getByRole("button", { name: "Aplicar" }));
}

test("empieza con el carrito vacío y sin resumen", () => {
  setup();
  expect(within(cart()).getByText("Tu carrito está vacío.")).toBeTruthy();
  expect(within(cart()).queryByText("Total", { selector: "dt" })).toBeNull();
  expect(within(product(VILLA_RICA)).getByText("S/ 32.00")).toBeTruthy();
});

test("agregar un producto lo pone en el carrito y agregarlo otra vez suma la cantidad", async () => {
  const { user } = setup();
  await add(user, VILLA_RICA, 2);

  expect(cartLines()).toHaveLength(1);
  expect(quantity(VILLA_RICA)).toBe("2");
  expect(cartLines()[0].textContent).toContain("S/ 64.00");
  expect(summary("Subtotal")).toBe("S/ 64.00");
  expect(screen.queryByText("Tu carrito está vacío.")).toBeNull();
});

test("aumentar, disminuir y quitar respetan los límites de 1 y 10 unidades", async () => {
  const { user } = setup();
  await add(user, VILLA_RICA);
  const increase = () => screen.getByRole("button", { name: `Aumentar cantidad de ${VILLA_RICA}` });
  const decrease = () => screen.getByRole("button", { name: `Disminuir cantidad de ${VILLA_RICA}` });

  expect(decrease().disabled).toBe(true);
  await user.click(increase());
  expect(quantity(VILLA_RICA)).toBe("2");
  await user.click(decrease());
  expect(quantity(VILLA_RICA)).toBe("1");

  for (let i = 0; i < 9; i++) await user.click(increase());
  expect(quantity(VILLA_RICA)).toBe("10");
  expect(increase().disabled).toBe(true);
  expect(addButton(VILLA_RICA).disabled).toBe(true);

  await user.click(screen.getByRole("button", { name: `Quitar ${VILLA_RICA}` }));
  expect(within(cart()).getByText("Tu carrito está vacío.")).toBeTruthy();
  expect(addButton(VILLA_RICA).disabled).toBe(false);
});

test("calcula subtotal, envío y total, con envío gratis desde S/ 150", async () => {
  const { user } = setup();
  await add(user, CHANCHAMAYO, 2);

  expect(summary("Subtotal")).toBe("S/ 110.00");
  expect(summary("Envío")).toBe("S/ 10.00");
  expect(summary("Total")).toBe("S/ 120.00");
  expect(within(cart()).queryByText("Descuento", { selector: "dt" })).toBeNull();

  await add(user, PRENSA);
  expect(summary("Subtotal")).toBe("S/ 199.90");
  expect(summary("Envío")).toBe("Gratis");
  expect(summary("Total")).toBe("S/ 199.90");
});

test("CAFE10 aplica 10% sin importar mayúsculas ni espacios, y un código inválido muestra un error", async () => {
  const { user } = setup();
  await add(user, CHANCHAMAYO, 2);

  await applyCoupon(user, "NOEXISTE");
  expect(screen.getByRole("alert").textContent).toContain("Cupón no válido.");

  await applyCoupon(user, "  cafe10 ");
  expect(screen.queryByRole("alert")).toBeNull();
  expect(screen.getByText("Cupón CAFE10 aplicado")).toBeTruthy();
  expect(summary("Descuento")).toBe("- S/ 11.00");
  expect(summary("Total")).toBe("S/ 109.00");

  await user.click(screen.getByRole("button", { name: "Quitar cupón" }));
  expect(within(cart()).queryByText("Descuento", { selector: "dt" })).toBeNull();
  expect(summary("Total")).toBe("S/ 120.00");
});

test("BIENVENIDA20 exige S/ 100 de compra y deja de aplicar si el subtotal baja", async () => {
  const { user } = setup();
  await add(user, VILLA_RICA, 2); // S/ 64.00

  await applyCoupon(user, "BIENVENIDA20");
  expect(screen.getByRole("alert").textContent).toContain("Este cupón requiere una compra mínima de S/ 100.00.");
  expect(screen.queryByText("Cupón BIENVENIDA20 aplicado")).toBeNull();

  await add(user, CHANCHAMAYO); // S/ 119.00
  await applyCoupon(user, "bienvenida20");
  expect(summary("Descuento")).toBe("- S/ 20.00");
  expect(summary("Total")).toBe("S/ 109.00");

  await user.click(screen.getByRole("button", { name: `Quitar ${CHANCHAMAYO}` })); // vuelve a S/ 64.00
  expect(within(cart()).queryByText("Descuento", { selector: "dt" })).toBeNull();
  expect(screen.getByText("Agrega S/ 36.00 más para usar BIENVENIDA20.")).toBeTruthy();
  expect(summary("Total")).toBe("S/ 74.00");
});

test("ENVIOGRATIS deja el envío gratis y aplicar otro cupón lo reemplaza", async () => {
  const { user } = setup();
  await add(user, VILLA_RICA);

  await applyCoupon(user, "envioGratis");
  expect(summary("Envío")).toBe("Gratis");
  expect(summary("Total")).toBe("S/ 32.00");

  await applyCoupon(user, "CAFE10");
  expect(screen.queryByText("Cupón ENVIOGRATIS aplicado")).toBeNull();
  expect(screen.getByText("Cupón CAFE10 aplicado")).toBeTruthy();
  expect(summary("Envío")).toBe("S/ 10.00");
  expect(summary("Total")).toBe("S/ 38.80"); // 32.00 - 3.20 + 10.00
});

test("guarda el carrito y el cupón en localStorage y los recupera al volver", async () => {
  const { user, unmount } = setup();
  await add(user, VILLA_RICA, 3);
  await add(user, PRENSA);
  await applyCoupon(user, "CAFE10");

  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
  expect(JSON.stringify(saved)).not.toContain("3200"); // no guarda precios
  unmount();

  setup();
  expect(cartLines()).toHaveLength(2);
  expect(quantity(VILLA_RICA)).toBe("3");
  expect(quantity(PRENSA)).toBe("1");
  expect(screen.getByText("Cupón CAFE10 aplicado")).toBeTruthy();
  expect(summary("Subtotal")).toBe("S/ 185.90");
});

test("con datos corruptos o desactualizados en localStorage no se rompe", () => {
  localStorage.setItem(STORAGE_KEY, "{esto no es JSON");
  const first = setup();
  expect(within(cart()).getByText("Tu carrito está vacío.")).toBeTruthy();
  first.unmount();

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ items: [{ productId: 999, quantity: 2 }, { productId: 1, quantity: 50 }], couponCode: "FALSO" }),
  );
  setup();
  expect(cartLines()).toHaveLength(1);
  expect(quantity(VILLA_RICA)).toBe("10");
  expect(screen.queryByText(/Cupón .* aplicado/)).toBeNull();
});
