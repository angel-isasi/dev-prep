// @vitest-environment jsdom
import { test, expect } from "vitest";
import { render, screen, fireEvent, act, renderHook } from "@testing-library/react";
import { useFormulario } from "./solucion.jsx";

test("valores empieza con los valores iniciales", () => {
  const { result } = renderHook(() => useFormulario({ nombre: "", promo: false }));
  expect(result.current.valores).toEqual({ nombre: "", promo: false });
});

test("un campo de texto guarda value y no borra los demás", () => {
  const { result } = renderHook(() => useFormulario({ nombre: "", distrito: "Ica" }));
  act(() => result.current.cambiar({ target: { name: "nombre", type: "text", value: "Ana" } }));
  expect(result.current.valores).toEqual({ nombre: "Ana", distrito: "Ica" });
});

test("un checkbox guarda checked (booleano), no value", () => {
  const { result } = renderHook(() => useFormulario({ nombre: "", promo: false }));
  act(() => result.current.cambiar({ target: { name: "nombre", type: "text", value: "Ana" } }));
  act(() =>
    result.current.cambiar({ target: { name: "promo", type: "checkbox", value: "on", checked: true } }),
  );
  expect(result.current.valores).toEqual({ nombre: "Ana", promo: true });
});

test("reiniciar vuelve a los valores iniciales", () => {
  const { result } = renderHook(() => useFormulario({ nombre: "", promo: false }));
  act(() => result.current.cambiar({ target: { name: "nombre", type: "text", value: "Ana" } }));
  act(() => result.current.reiniciar());
  expect(result.current.valores).toEqual({ nombre: "", promo: false });
});

test("funciona conectado a inputs reales", () => {
  function Pedido() {
    const { valores, cambiar } = useFormulario({ nombre: "", promo: false });
    return (
      <form>
        <input aria-label="Nombre" name="nombre" value={valores.nombre} onChange={cambiar} />
        <input aria-label="Promo" name="promo" type="checkbox" checked={valores.promo} onChange={cambiar} />
        <p>{JSON.stringify(valores)}</p>
      </form>
    );
  }
  render(<Pedido />);
  fireEvent.change(screen.getByLabelText("Nombre"), { target: { value: "Luis" } });
  fireEvent.click(screen.getByLabelText("Promo"));
  expect(screen.getByLabelText("Nombre").value).toBe("Luis");
  expect(screen.getByLabelText("Promo").checked).toBe(true);
  expect(screen.getByText('{"nombre":"Luis","promo":true}')).toBeTruthy();
});
