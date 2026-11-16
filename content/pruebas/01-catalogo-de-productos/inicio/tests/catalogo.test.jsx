// @vitest-environment jsdom
// Tests de aceptación: prueban lo que ve y hace el usuario, no cómo está hecho por dentro.
import { test, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../src/App.jsx";
import { fetchProducts } from "../src/api.js";

// Reemplazamos la API falsa por una controlada: sin esperas ni fallos al azar.
vi.mock("../src/api.js", () => ({ fetchProducts: vi.fn() }));

const PRODUCTS = [
  { id: 1, name: "Arroz extra 5 kg", category: "Abarrotes", price: 24.9 },
  { id: 2, name: "Café tostado 250 g", category: "Bebidas", price: 18.5 },
  { id: 3, name: "Leche evaporada 400 g", category: "Lácteos", price: 4.2 },
  { id: 4, name: "Chicha morada 1 L", category: "Bebidas", price: 6 },
  { id: 5, name: "Quinua 500 g", category: "Abarrotes", price: 9.8 },
  { id: 6, name: "Yogur de fresa 1 L", category: "Lácteos", price: 7.5 },
];

beforeEach(() => {
  fetchProducts.mockReset();
});

async function renderLoaded() {
  fetchProducts.mockResolvedValue(PRODUCTS);
  const user = userEvent.setup();
  render(<App />);
  await screen.findByRole("list", { name: "Productos" });
  return user;
}

/** Nombres de los productos visibles, en el orden en que aparecen. */
function visibleNames() {
  const list = screen.queryByRole("list", { name: "Productos" });
  if (!list) return [];
  return within(list)
    .queryAllByRole("listitem")
    .map((item) => within(item).getByRole("heading", { level: 3 }).textContent);
}

test('muestra "Cargando productos..." y luego la lista, pidiendo los datos una sola vez', async () => {
  fetchProducts.mockResolvedValue(PRODUCTS);
  render(<App />);
  expect(screen.getByText("Cargando productos...")).toBeTruthy();

  await screen.findByRole("list", { name: "Productos" });
  expect(visibleNames()).toHaveLength(6);
  expect(screen.queryByText("Cargando productos...")).toBeNull();
  expect(fetchProducts).toHaveBeenCalledTimes(1);
});

test("cada producto muestra su nombre, su categoría y el precio con formato S/ 0.00", async () => {
  await renderLoaded();
  const items = within(screen.getByRole("list", { name: "Productos" })).getAllByRole("listitem");

  expect(within(items[0]).getByRole("heading", { level: 3 }).textContent).toBe("Arroz extra 5 kg");
  expect(items[0].textContent).toContain("Abarrotes");
  expect(items[0].textContent).toContain("S/ 24.90");
  expect(items[3].textContent).toContain("S/ 6.00");
  expect(screen.getByText("Mostrando 6 de 6 productos")).toBeTruthy();
});

test("si la API falla muestra un error y Reintentar vuelve a pedir los productos", async () => {
  // La segunda petición queda pendiente hasta que llamemos a respond().
  let respond;
  fetchProducts
    .mockRejectedValueOnce(new Error("Error 503"))
    .mockReturnValueOnce(new Promise((resolve) => (respond = resolve)));
  const user = userEvent.setup();
  render(<App />);

  const alert = await screen.findByRole("alert");
  expect(alert.textContent).toContain("No pudimos cargar los productos.");
  expect(screen.queryByRole("list", { name: "Productos" })).toBeNull();

  await user.click(screen.getByRole("button", { name: "Reintentar" }));
  expect(screen.getByText("Cargando productos...")).toBeTruthy();
  expect(screen.queryByRole("alert")).toBeNull();

  respond(PRODUCTS);
  await screen.findByRole("list", { name: "Productos" });

  expect(screen.queryByRole("alert")).toBeNull();
  expect(visibleNames()).toHaveLength(6);
  expect(fetchProducts).toHaveBeenCalledTimes(2);
});

test("la búsqueda filtra por nombre sin importar mayúsculas ni tildes", async () => {
  const user = await renderLoaded();
  const search = screen.getByRole("searchbox", { name: "Buscar productos" });

  await user.type(search, "CAFE");
  expect(visibleNames()).toEqual(["Café tostado 250 g"]);
  expect(screen.getByText("Mostrando 1 de 6 productos")).toBeTruthy();

  await user.clear(search);
  await user.type(search, "  quinua ");
  expect(visibleNames()).toEqual(["Quinua 500 g"]);
});

test("el filtro de categoría sale de los datos y muestra solo esa categoría", async () => {
  const user = await renderLoaded();
  const category = screen.getByRole("combobox", { name: "Categoría" });

  const options = within(category).getAllByRole("option").map((option) => option.textContent);
  expect(options).toEqual(["Todas", "Abarrotes", "Bebidas", "Lácteos"]);

  await user.selectOptions(category, "Lácteos");
  expect(visibleNames()).toEqual(["Leche evaporada 400 g", "Yogur de fresa 1 L"]);

  await user.selectOptions(category, "Todas");
  expect(visibleNames()).toHaveLength(6);
});

test("ordena por precio en ambos sentidos y Relevancia vuelve al orden original", async () => {
  const user = await renderLoaded();
  const sort = screen.getByRole("combobox", { name: "Ordenar por" });

  await user.selectOptions(sort, "Precio: menor a mayor");
  expect(visibleNames()).toEqual([
    "Leche evaporada 400 g",
    "Chicha morada 1 L",
    "Yogur de fresa 1 L",
    "Quinua 500 g",
    "Café tostado 250 g",
    "Arroz extra 5 kg",
  ]);

  await user.selectOptions(sort, "Precio: mayor a menor");
  expect(visibleNames()[0]).toBe("Arroz extra 5 kg");
  expect(visibleNames()[5]).toBe("Leche evaporada 400 g");

  await user.selectOptions(sort, "Relevancia");
  expect(visibleNames()).toEqual(PRODUCTS.map((product) => product.name));
});

test("búsqueda, categoría y orden se combinan", async () => {
  const user = await renderLoaded();

  await user.selectOptions(screen.getByRole("combobox", { name: "Categoría" }), "Bebidas");
  await user.selectOptions(screen.getByRole("combobox", { name: "Ordenar por" }), "Precio: menor a mayor");
  expect(visibleNames()).toEqual(["Chicha morada 1 L", "Café tostado 250 g"]);

  await user.type(screen.getByRole("searchbox", { name: "Buscar productos" }), "café");
  expect(visibleNames()).toEqual(["Café tostado 250 g"]);
  expect(screen.getByText("Mostrando 1 de 6 productos")).toBeTruthy();
});

test("sin coincidencias muestra un mensaje y Limpiar filtros deja todo como al inicio", async () => {
  const user = await renderLoaded();
  const search = screen.getByRole("searchbox", { name: "Buscar productos" });
  const category = screen.getByRole("combobox", { name: "Categoría" });

  await user.selectOptions(category, "Abarrotes");
  await user.type(search, "pizza");
  expect(screen.getByText("No encontramos productos que coincidan con tu búsqueda.")).toBeTruthy();
  expect(screen.queryByRole("list", { name: "Productos" })).toBeNull();

  await user.click(screen.getByRole("button", { name: "Limpiar filtros" }));
  expect(search.value).toBe("");
  expect(category.value).not.toBe("Abarrotes");
  expect(visibleNames()).toHaveLength(6);
});

test("no modifica el arreglo que devuelve la API al ordenar", async () => {
  const data = PRODUCTS.map((product) => ({ ...product }));
  fetchProducts.mockResolvedValue(data);
  const user = userEvent.setup();
  render(<App />);
  await screen.findByRole("list", { name: "Productos" });

  await user.selectOptions(screen.getByRole("combobox", { name: "Ordenar por" }), "Precio: mayor a menor");
  expect(data.map((product) => product.id)).toEqual([1, 2, 3, 4, 5, 6]);
});
