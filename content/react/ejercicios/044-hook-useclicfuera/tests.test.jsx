// @vitest-environment jsdom
import { test, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { useRef } from "react";
import { useClicFuera, Desplegable } from "./solucion.jsx";

// Componente de prueba para usar el hook directamente.
function Caja({ alFuera }) {
  const ref = useRef(null);
  useClicFuera(ref, alFuera);
  return (
    <div ref={ref}>
      <p>
        <span>Adentro</span>
      </p>
    </div>
  );
}

test("el desplegable empieza abierto y un clic adentro no lo cierra", () => {
  render(
    <>
      <Desplegable />
      <button>Afuera</button>
    </>,
  );
  fireEvent.mouseDown(screen.getByText("Opciones"));
  expect(screen.getByText("Opciones")).toBeTruthy();
  expect(screen.queryByText("Cerrado")).toBeNull();
});

test('un clic afuera lo cierra y muestra "Cerrado"', () => {
  render(
    <>
      <Desplegable />
      <button>Afuera</button>
    </>,
  );
  fireEvent.mouseDown(screen.getByText("Afuera"));
  expect(screen.getByText("Cerrado")).toBeTruthy();
});

test("un clic en un hijo muy anidado cuenta como adentro", () => {
  const alFuera = vi.fn();
  render(<Caja alFuera={alFuera} />);
  fireEvent.mouseDown(screen.getByText("Adentro"));
  expect(alFuera).not.toHaveBeenCalled();
});

test("un clic en cualquier otra parte avisa", () => {
  const alFuera = vi.fn();
  render(
    <>
      <Caja alFuera={alFuera} />
      <p>Otra cosa</p>
    </>,
  );
  fireEvent.mouseDown(screen.getByText("Otra cosa"));
  fireEvent.mouseDown(document.body);
  expect(alFuera).toHaveBeenCalledTimes(2);
});

test("al desmontar quita el listener del document", () => {
  const alFuera = vi.fn();
  const { unmount } = render(<Caja alFuera={alFuera} />);
  unmount();
  fireEvent.mouseDown(document.body);
  expect(alFuera).not.toHaveBeenCalled();
});
