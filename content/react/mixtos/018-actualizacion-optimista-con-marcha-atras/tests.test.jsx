// @vitest-environment jsdom
import { test, expect, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { MeGusta } from "./solucion.jsx";

const presionado = () => screen.getByRole("button").getAttribute("aria-pressed");

test('empieza sin presionar y con el texto "Me gusta"', () => {
  render(<MeGusta guardar={async () => {}} />);
  expect(presionado()).toBe("false");
  expect(screen.getByRole("button").textContent).toBe("Me gusta");
});

test("cambia al instante, antes de que responda el servidor", () => {
  const guardar = vi.fn(() => new Promise(() => {})); // nunca responde
  render(<MeGusta guardar={guardar} />);
  fireEvent.click(screen.getByRole("button"));
  expect(presionado()).toBe("true");
  expect(guardar).toHaveBeenCalledWith(true);
});

test("si guardar falla, vuelve atrás y muestra el aviso", async () => {
  render(
    <MeGusta
      guardar={async () => {
        throw new Error("sin red");
      }}
    />
  );
  fireEvent.click(screen.getByRole("button"));
  expect(presionado()).toBe("true");
  const alerta = await screen.findByRole("alert");
  expect(alerta.textContent).toBe("No se guardó. Inténtalo otra vez.");
  expect(presionado()).toBe("false");
});

test("si guardar sale bien, se queda activo y un segundo clic lo desactiva", async () => {
  const guardar = vi.fn(async () => {});
  render(<MeGusta guardar={guardar} />);
  await act(async () => fireEvent.click(screen.getByRole("button")));
  expect(presionado()).toBe("true");
  expect(screen.queryByRole("alert")).toBeNull();
  await act(async () => fireEvent.click(screen.getByRole("button")));
  expect(presionado()).toBe("false");
  expect(guardar).toHaveBeenLastCalledWith(false);
});
