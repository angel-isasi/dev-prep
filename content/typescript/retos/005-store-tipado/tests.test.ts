import { test, expect, expectTypeOf, vi } from "vitest";
import { crearStore } from "./solucion";

type EstadoApp = { contador: number; usuario: string | null; tema: "claro" | "oscuro" };

const inicial: EstadoApp = { contador: 0, usuario: null, tema: "claro" };

test("getState devuelve el estado inicial", () => {
  const store = crearStore(inicial);
  expect(store.getState()).toEqual({ contador: 0, usuario: null, tema: "claro" });
});

test("setState con un objeto parcial cambia solo esas propiedades", () => {
  const store = crearStore(inicial);
  store.setState({ usuario: "Angel" });
  store.setState({ tema: "oscuro" });
  expect(store.getState()).toEqual({ contador: 0, usuario: "Angel", tema: "oscuro" });
});

test("setState con una función calcula el cambio a partir del estado actual", () => {
  const store = crearStore(inicial);
  store.setState((s) => ({ contador: s.contador + 1 }));
  store.setState((s) => ({ contador: s.contador + 1 }));
  expect(store.getState().contador).toBe(2);
});

test("cada cambio crea un objeto nuevo y no modifica el anterior", () => {
  const store = crearStore(inicial);
  const antes = store.getState();
  store.setState({ contador: 5 });
  expect(store.getState()).not.toBe(antes);
  expect(antes.contador).toBe(0);
  expect(inicial.contador).toBe(0);
});

test("subscribe avisa a cada oyente con el estado nuevo y el anterior", () => {
  const store = crearStore(inicial);
  const a = vi.fn();
  const b = vi.fn();
  store.subscribe(a);
  store.subscribe(b);
  store.setState({ contador: 1 });
  expect(a).toHaveBeenCalledWith(
    { contador: 1, usuario: null, tema: "claro" },
    { contador: 0, usuario: null, tema: "claro" },
  );
  expect(b).toHaveBeenCalledTimes(1);
});

test("la función que devuelve subscribe da de baja al oyente", () => {
  const store = crearStore(inicial);
  const oyente = vi.fn();
  const darseDeBaja = store.subscribe(oyente);
  store.setState({ contador: 1 });
  darseDeBaja();
  store.setState({ contador: 2 });
  expect(oyente).toHaveBeenCalledTimes(1);
});

test("el estado queda tipado con el tipo del inicial (lo revisa tsc)", () => {
  const store = crearStore(inicial);
  expectTypeOf(store.getState()).toEqualTypeOf<EstadoApp>();
  store.subscribe((nuevo, anterior) => {
    expectTypeOf(nuevo).toEqualTypeOf<EstadoApp>();
    expectTypeOf(anterior).toEqualTypeOf<EstadoApp>();
  });
  const probar = () => {
    // @ts-expect-error contador es un número
    store.setState({ contador: "5" });
    // @ts-expect-error "azul" no es un tema válido
    store.setState({ tema: "azul" });
    // @ts-expect-error la función también debe devolver un parcial válido
    store.setState((s) => ({ contador: String(s.contador) }));
  };
  expect(typeof probar).toBe("function");
});
