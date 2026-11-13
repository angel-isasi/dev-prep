import { expect } from "vitest";
import { act, renderHook } from "@testing-library/react";

export function probarUseCarrito(useCarrito) {
  // renderHook ejecuta el hook dentro de un componente de prueba.
  // result.current siempre tiene lo que devolvió el ÚLTIMO render.
  const { result } = renderHook(() => useCarrito());

  // 1. Estado inicial: vacío y en cero.
  expect(result.current.items).toEqual([]);
  expect(result.current.total).toBe(0);

  // 2. Agregar dos items: se acumulan y el total suma precios.
  //    Todo lo que cambia el estado va dentro de act().
  act(() => result.current.agregar({ nombre: "Margarita", precio: 28 }));
  act(() => result.current.agregar({ nombre: "Pepperoni", precio: 32 }));
  expect(result.current.items.length).toBe(2);
  expect(result.current.total).toBe(60);

  // 3. Vaciar: vuelve a cero.
  act(() => result.current.vaciar());
  expect(result.current.items).toEqual([]);
  expect(result.current.total).toBe(0);
}
