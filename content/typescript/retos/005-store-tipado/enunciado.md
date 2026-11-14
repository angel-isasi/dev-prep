Construye un **store** de estado global mínimo, como el corazón de Zustand o Redux: `crearStore(inicial)` guarda un estado, permite leerlo, cambiarlo y **suscribirse** para enterarse de cada cambio. Todo tipado con un genérico `S` que TypeScript infiere del estado inicial.

## Tipos

```ts
type Oyente<S> = (estado: S, anterior: S) => void;   // ya viene en el inicio
type Cambio<S> = ...                                 // tú lo escribes

type Store<S> = {
  getState: () => S;
  setState: (cambio: Cambio<S>) => void;
  subscribe: (oyente: Oyente<S>) => () => void;
};
```

`Cambio<S>` es una de dos cosas: un **objeto parcial** de `S` (algunas de sus propiedades, con sus tipos correctos) o una **función** que recibe el estado actual y devuelve ese objeto parcial.

## Reglas

- `crearStore<S extends object>(inicial: S): Store<S>`.
- `getState()` devuelve el estado actual.
- `setState(cambio)`:
  - Si `cambio` es una función, la llama con el estado actual para obtener el parcial.
  - **Mezcla** el parcial con el estado: las propiedades que no vienen se conservan.
  - Crea un **objeto nuevo**: el estado anterior (y el `inicial`) no se modifican.
  - Avisa a todos los suscriptores con `(estadoNuevo, estadoAnterior)`.
- `subscribe(oyente)` registra un oyente y devuelve una función que lo da de baja.
- TypeScript debe rechazar `setState({ contador: "5" })` si `contador` es número, y una función que devuelva un tipo incorrecto.

## Ejemplos

```ts
type EstadoApp = { contador: number; usuario: string | null; tema: "claro" | "oscuro" };

const store = crearStore<EstadoApp>({ contador: 0, usuario: null, tema: "claro" });

const darseDeBaja = store.subscribe((nuevo, anterior) => {
  console.log(`contador: ${anterior.contador} -> ${nuevo.contador}`);
});

store.setState({ usuario: "Angel" });                    // imprime "contador: 0 -> 0"
store.setState((s) => ({ contador: s.contador + 1 }));   // imprime "contador: 0 -> 1"
store.getState();  // { contador: 1, usuario: "Angel", tema: "claro" }

darseDeBaja();
store.setState({ tema: "oscuro" });   // ya no imprime nada

store.setState({ contador: "5" });    // Error de TypeScript
store.setState({ tema: "azul" });     // Error de TypeScript
```

## Por qué importa

"¿Cómo funciona por dentro un manejador de estado?" es una pregunta frecuente cuando en tu CV aparece Redux o Zustand. Este reto junta tres ideas que se usan en todas partes: **closures** para esconder el estado, **inmutabilidad** (React detecta cambios comparando referencias, por eso cada cambio debe ser un objeto nuevo) y el **patrón observador**. Y del lado de TypeScript, ver cómo `Partial<S>` hace que `setState` solo acepte cambios válidos.
