// @vitest-environment jsdom
import { test, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Boton } from "./solucion.jsx";

test("pasa onClick y aria-label al botón real", () => {
  const onClick = vi.fn();
  render(
    <Boton variante="peligro" onClick={onClick} aria-label="Borrar pedido">
      Borrar
    </Boton>
  );
  fireEvent.click(screen.getByLabelText("Borrar pedido"));
  expect(onClick).toHaveBeenCalledTimes(1);
  expect(screen.getByRole("button").textContent).toBe("Borrar");
});

test("arma la clase con la variante, sin espacios sobrantes", () => {
  render(<Boton variante="peligro">Borrar</Boton>);
  expect(screen.getByRole("button").className).toBe("boton boton-peligro");
});

test('sin variante usa "primario" y agrega el className extra', () => {
  render(<Boton className="ancho">Enviar</Boton>);
  expect(screen.getByRole("button").className).toBe("boton boton-primario ancho");
});

test("pasa disabled y type sin nombrarlos", () => {
  const onClick = vi.fn();
  render(
    <Boton type="submit" disabled onClick={onClick}>
      Enviar
    </Boton>
  );
  const boton = screen.getByRole("button");
  expect(boton.disabled).toBe(true);
  expect(boton.getAttribute("type")).toBe("submit");
  fireEvent.click(boton);
  expect(onClick).not.toHaveBeenCalled();
});
