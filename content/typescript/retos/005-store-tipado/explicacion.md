## Idea clave

El estado vive en una variable **privada del closure** de `crearStore`; los tres métodos devueltos son la única forma de tocarla. `setState` acepta `Partial<S>` (o una función que lo devuelve), crea un **objeto nuevo** con spread y avisa a los suscriptores. El genérico `S` se infiere del estado inicial, así que todo queda tipado sin escribir tipos al usarlo.

## Paso a paso

1. **El tipo del cambio.** `Partial<S>` convierte todas las propiedades de `S` en opcionales, **conservando sus tipos**: `{ contador?: number; usuario?: string | null; tema?: "claro" | "oscuro" }`. La alternativa es una función `(actual: S) => Partial<S>`. Se unen con `|`.
2. **Estado en el closure.** `let estado = inicial;` dentro de `crearStore`. Cada store tiene su propia variable; nadie de afuera la ve.
3. **Los oyentes en un `Set`.** Un `Set` no repite elementos y `delete` es directo, ideal para registrar y dar de baja.
4. **`getState`** devuelve `estado`. Como `estado` cambia de referencia en cada `setState`, siempre devuelve el actual.
5. **`setState`.** Guarda `anterior`, resuelve el parcial (`typeof cambio === "function"` decide: es narrowing, TypeScript sabe que dentro del primer caso `cambio` se puede llamar), mezcla con `{ ...anterior, ...parcial }` y avisa a cada oyente con `(estado, anterior)`.
6. **`subscribe`** agrega el oyente y devuelve una función que lo quita. Es el mismo contrato que `useEffect`: "te doy la limpieza".

```ts
export type Cambio<S> = Partial<S> | ((actual: S) => Partial<S>);

export function crearStore<S extends object>(inicial: S): Store<S> {
  let estado = inicial;
  const oyentes = new Set<Oyente<S>>();

  return {
    getState: () => estado,
    setState(cambio) {
      const anterior = estado;
      const parcial = typeof cambio === "function" ? cambio(anterior) : cambio;
      estado = { ...anterior, ...parcial };
      oyentes.forEach((oyente) => oyente(estado, anterior));
    },
    subscribe(oyente) {
      oyentes.add(oyente);
      return () => {
        oyentes.delete(oyente);
      };
    },
  };
}
```

Como la función declara que devuelve `Store<S>`, los métodos del objeto se tipan solos: en `setState(cambio)` no hace falta anotar `cambio`, TypeScript ya sabe que es `Cambio<S>`.

## Por qué funciona

Recorrido con `crearStore({ contador: 0, usuario: null, tema: "claro" })` y un suscriptor:

| Llamada | `parcial` | `estado` después | Oyente recibe |
|---|---|---|---|
| (inicio) | | `{ contador: 0, usuario: null, tema: "claro" }` (objeto A) | |
| `setState({ usuario: "Angel" })` | `{ usuario: "Angel" }` | `{ contador: 0, usuario: "Angel", tema: "claro" }` (objeto B) | `(B, A)` |
| `setState((s) => ({ contador: s.contador + 1 }))` | la función recibe B y devuelve `{ contador: 1 }` | `{ contador: 1, usuario: "Angel", tema: "claro" }` (objeto C) | `(C, B)` |

A, B y C son **objetos distintos**: A sigue teniendo `usuario: null`. Esa es la inmutabilidad. React (y librerías como Zustand) detectan un cambio comparando referencias (`nuevo !== anterior`), que es muy rápido; si modificaras el mismo objeto, la referencia no cambiaría y la pantalla no se actualizaría.

En el spread, el orden importa: `{ ...anterior, ...parcial }` copia primero todo el estado y luego **pisa** con lo que trae el parcial.

Del lado de los tipos: `store.setState({ contador: "5" })` falla porque en `Partial<EstadoApp>`, `contador` es `number | undefined`, y `"5"` es texto.

## Errores comunes

- **`Cambio<S> = Partial<S> | Function`** o `any`. `Function` no dice qué recibe ni qué devuelve: la función que devuelve `{ contador: "1" }` compilaría. Falla el test de tipos.
- **Mutar el estado**: `Object.assign(estado, parcial)`. Los valores son correctos, pero `getState()` devuelve siempre el mismo objeto y falla "cada cambio crea un objeto nuevo". En React, la pantalla no se refrescaría.
- **Al revés el spread**: `{ ...parcial, ...anterior }`. El estado viejo pisa al cambio y nada cambia nunca.
- **Avisar antes de actualizar.** Si llamas a los oyentes antes de `estado = ...`, reciben el estado viejo dos veces y un `getState()` dentro del oyente también da el viejo.
- **Llamar la función con el estado inicial** en vez del actual (`cambio(inicial)`). El segundo `setState(s => s.contador + 1)` vuelve a dar 1.
- **`S` sin la restricción `extends object`.** Entonces `crearStore(5)` compilaría y el spread de un número no tiene sentido.

## Otra forma de resolverlo

**Como clase**, con campos privados de JavaScript (`#`):

```ts
export class StoreClase<S extends object> {
  #estado: S;
  #oyentes = new Set<Oyente<S>>();

  constructor(inicial: S) {
    this.#estado = inicial;
  }

  getState = () => this.#estado;

  setState = (cambio: Cambio<S>) => {
    const anterior = this.#estado;
    const parcial = typeof cambio === "function" ? cambio(anterior) : cambio;
    this.#estado = { ...anterior, ...parcial };
    this.#oyentes.forEach((o) => o(this.#estado, anterior));
  };

  subscribe = (oyente: Oyente<S>) => {
    this.#oyentes.add(oyente);
    return () => this.#oyentes.delete(oyente);
  };
}
```

Los métodos son **funciones flecha** asignadas como propiedades para que `this` no se pierda si alguien hace `const { setState } = store`.

**¿Cuándo conviene?** El closure es lo que usan Zustand y Redux, no tiene problemas con `this` y el estado es privado de verdad. La clase es más familiar si vienes de Java o C#, pero tienes que cuidar el `this`. En una entrevista de frontend, la versión con closure es la que más se espera.

Para conectar este store con React se usa `useSyncExternalStore(store.subscribe, store.getState)`: es literalmente lo que hace Zustand por dentro.

## Cómo explicarlo en la entrevista

> "`crearStore` es genérico en S, que TypeScript infiere del estado inicial. El estado vive en una variable del closure y solo se toca con los tres métodos. `setState` acepta un `Partial<S>` o una función que recibe el estado actual y lo devuelve; con `typeof` distingo cuál es. Mezclo con spread para crear siempre un objeto nuevo, porque React y estas librerías detectan cambios comparando referencias. Después aviso a los suscriptores con el estado nuevo y el anterior. `subscribe` devuelve la función para darse de baja, igual que la limpieza de un efecto. Es básicamente cómo funciona Zustand."

## Conceptos

- **Genéricos con restricción** `S extends object` (tema de Aprender: genéricos).
- **`Partial<T>`** (tema de Aprender: utility types).
- **Uniones con funciones** y narrowing con `typeof x === "function"`.
- **Closures** para estado privado.
- **Inmutabilidad** y comparación por referencia.
- **Spread** para mezclar objetos (el último gana).
- **`Set`**: `add`, `delete`, `forEach`.
- **Patrón observador** (suscribirse y darse de baja).
- **`useSyncExternalStore`**: el puente entre un store externo y React.
