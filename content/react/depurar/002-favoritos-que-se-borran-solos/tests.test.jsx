// @vitest-environment jsdom
import { test, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ListaFavoritos } from "./solucion.jsx";

const favoritos = [
  { id: 1, nombre: "Curso de React" },
  { id: 2, nombre: "Guía de CSS" },
];

test("al abrir la lista no se quita ningún favorito", () => {
  const onQuitar = vi.fn();
  render(<ListaFavoritos favoritos={favoritos} onQuitar={onQuitar} />);
  expect(onQuitar).not.toHaveBeenCalled();
});

test('el botón "Quitar" avisa con el id de ese favorito', () => {
  const onQuitar = vi.fn();
  render(<ListaFavoritos favoritos={favoritos} onQuitar={onQuitar} />);
  fireEvent.click(screen.getAllByRole("button", { name: "Quitar" })[1]);
  expect(onQuitar).toHaveBeenCalledTimes(1);
  expect(onQuitar).toHaveBeenCalledWith(2);
});

test("muestra el nombre de cada favorito", () => {
  render(<ListaFavoritos favoritos={favoritos} onQuitar={() => {}} />);
  const textos = screen.getAllByRole("listitem").map((li) => li.textContent);
  expect(textos).toEqual(["Curso de ReactQuitar", "Guía de CSSQuitar"]);
});
