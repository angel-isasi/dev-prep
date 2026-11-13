// @vitest-environment jsdom
import { test, expect, vi } from "vitest";
import { render, screen, fireEvent, renderHook } from "@testing-library/react";
import { TemaProvider, BotonTema, Tarjeta, useTema } from "./solucion.jsx";

function App() {
  return (
    <TemaProvider>
      <BotonTema />
      <Tarjeta />
    </TemaProvider>
  );
}

test("empieza en tema claro", () => {
  render(<App />);
  expect(screen.getByRole("button").textContent).toBe("Tema: claro");
  expect(screen.getByTestId("tarjeta").className).toBe("bg-white");
});

test("al hacer clic cambia a oscuro y la tarjeta también", () => {
  render(<App />);
  fireEvent.click(screen.getByText("Tema: claro"));
  expect(screen.getByText("Tema: oscuro")).toBeTruthy();
  expect(screen.getByTestId("tarjeta").className).toBe("bg-navy");
});

test("un segundo clic vuelve a claro", () => {
  render(<App />);
  fireEvent.click(screen.getByRole("button"));
  fireEvent.click(screen.getByRole("button"));
  expect(screen.getByRole("button").textContent).toBe("Tema: claro");
  expect(screen.getByTestId("tarjeta").className).toBe("bg-white");
});

test("todos los componentes del Provider comparten el mismo tema", () => {
  render(
    <TemaProvider>
      <BotonTema />
      <BotonTema />
    </TemaProvider>
  );
  const [primero, segundo] = screen.getAllByRole("button");
  fireEvent.click(primero);
  expect(primero.textContent).toBe("Tema: oscuro");
  expect(segundo.textContent).toBe("Tema: oscuro");
});

test("useTema lanza un error claro si se usa fuera del Provider", () => {
  // React escribe el error en la consola; lo silenciamos para no ensuciar la salida.
  const espia = vi.spyOn(console, "error").mockImplementation(() => {});
  try {
    expect(() => renderHook(() => useTema())).toThrow(
      "useTema debe usarse dentro de TemaProvider"
    );
  } finally {
    espia.mockRestore();
  }
});
