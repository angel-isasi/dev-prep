// Store con suscriptores
//
// crearStore(inicial) guarda un estado y devuelve { getState, setState, subscribe }.
// setState recibe un objeto parcial o una función que lo calcula desde el
// estado actual. Cada cambio crea un objeto nuevo y avisa a los suscriptores.
//
//   const store = crearStore({ contador: 0, tema: "claro" });
//   store.subscribe((nuevo, anterior) => console.log(anterior.contador, "->", nuevo.contador));
//   store.setState((s) => ({ contador: s.contador + 1 }));   // imprime 0 -> 1
//
// Guarda el archivo (Ctrl + S) y mira el resultado de los tests en la app.

export type Oyente<S> = (estado: S, anterior: S) => void;

// Cambia el `any`: un objeto con ALGUNAS propiedades de S, o una función
// que recibe el estado actual y devuelve ese objeto.
export type Cambio<S> = any;

export type Store<S> = {
  getState: () => S;
  setState: (cambio: Cambio<S>) => void;
  subscribe: (oyente: Oyente<S>) => () => void;
};

export function crearStore<S extends object>(inicial: S): Store<S> {
  // Tu código aquí
  return {
    getState: () => inicial,
    setState: () => {},
    subscribe: () => () => {},
  };
}
