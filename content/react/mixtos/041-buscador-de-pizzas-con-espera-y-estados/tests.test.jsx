// @vitest-environment jsdom
import { test, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { BuscadorPizzas } from "./solucion.jsx";

const PIZZAS = ["Margarita", "Marinera", "Hawaiana"];
const buscarEnMenu = async (texto) => PIZZAS.filter((p) => p.toLowerCase().includes(texto.toLowerCase()));

afterEach(() => {
  vi.useRealTimers();
});

function escribir(texto) {
  fireEvent.change(screen.getByLabelText("Buscar pizza"), { target: { value: texto } });
}

// Avanza el reloj falso y deja que se resuelvan las promesas pendientes.
async function avanzar(ms) {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });
}

function pizzasVisibles() {
  return screen.queryAllByRole("listitem").map((li) => li.textContent);
}

test("al inicio invita a escribir y no busca", () => {
  vi.useFakeTimers();
  const buscar = vi.fn(buscarEnMenu);
  render(<BuscadorPizzas buscar={buscar} />);
  expect(screen.getByText("Escribe el nombre de una pizza.")).toBeTruthy();
  expect(buscar).not.toHaveBeenCalled();
});

test("espera 300 ms después de la última tecla y busca una sola vez", async () => {
  vi.useFakeTimers();
  const buscar = vi.fn(buscarEnMenu);
  render(<BuscadorPizzas buscar={buscar} />);
  escribir("m");
  escribir("ma");
  escribir("mar");
  await avanzar(299);
  expect(buscar).not.toHaveBeenCalled();
  await avanzar(1);
  expect(buscar).toHaveBeenCalledTimes(1);
  expect(buscar).toHaveBeenCalledWith("mar");
  expect(pizzasVisibles()).toEqual(["Margarita", "Marinera"]);
});

test('muestra "Buscando…" mientras espera la respuesta', async () => {
  vi.useFakeTimers();
  const buscar = vi.fn(() => new Promise(() => {}));
  render(<BuscadorPizzas buscar={buscar} />);
  escribir("mar");
  await avanzar(300);
  expect(screen.getByText("Buscando…")).toBeTruthy();
});

test("avisa cuando no hay resultados", async () => {
  vi.useFakeTimers();
  render(<BuscadorPizzas buscar={buscarEnMenu} />);
  escribir("  sushi ");
  await avanzar(300);
  expect(screen.getByText(/^No hay pizzas con/).textContent).toBe("No hay pizzas con “sushi”.");
  expect(pizzasVisibles()).toEqual([]);
});

test("si la búsqueda falla, muestra un alert", async () => {
  vi.useFakeTimers();
  const buscar = vi.fn(async () => {
    throw new Error("sin red");
  });
  render(<BuscadorPizzas buscar={buscar} />);
  escribir("mar");
  await avanzar(300);
  expect(screen.getByRole("alert").textContent).toBe("No pudimos buscar. Revisa tu conexión.");
});

test("ignora la respuesta de una búsqueda vieja que llega tarde", async () => {
  vi.useFakeTimers();
  // "ma" tarda 1000 ms en responder; "mar" solo 100 ms.
  const buscar = vi.fn(
    (texto) => new Promise((resolver) => setTimeout(() => resolver([`resultado de ${texto}`]), texto === "ma" ? 1000 : 100)),
  );
  render(<BuscadorPizzas buscar={buscar} />);
  escribir("ma");
  await avanzar(300); // empieza la búsqueda de "ma"
  escribir("mar");
  await avanzar(300); // empieza la búsqueda de "mar"
  await avanzar(1000); // ya respondieron las dos
  expect(buscar).toHaveBeenCalledTimes(2);
  expect(pizzasVisibles()).toEqual(["resultado de mar"]);
});
