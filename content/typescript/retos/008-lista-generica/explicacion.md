## Idea clave

Un componente genérico es una **función genérica** que devuelve JSX: `function Lista<T>(props: ListaProps<T>)`. TypeScript **infiere** `T` a partir de `items` y lo usa para tipar el parámetro de `renderItem` y de `obtenerClave`. El componente no sabe qué es `T`; solo lo recorre y delega en quien lo usa cómo pintarlo (**render prop**).

## Paso a paso

1. **Props genéricas.** `ListaProps<T>` usa `T` en tres lugares: `items: T[]`, el parámetro de `renderItem` y el de `obtenerClave`. Eso **ata** los tres: si `items` es `Producto[]`, los otros dos reciben `Producto`.
2. **Componente genérico.** `function Lista<T>({ ... }: ListaProps<T>)`. Al escribir `<Lista items={productos} ... />`, TypeScript ve que `items` es `Producto[]` y deduce `T = Producto`.
3. **`renderItem` devuelve `ReactNode`.** Así puede devolver texto (`p.nombre`), JSX (`<strong>...`) o incluso `null`.
4. **`obtenerClave` devuelve `string | number`.** Es lo que acepta `key` y obliga a dar algo estable (el `id`), no el objeto entero.
5. **El caso vacío primero.** `if (items.length === 0) return <p>{vacio}</p>;`. Un `return` temprano deja el resto del componente más limpio.
6. **El `map`.** Por cada elemento, un `<li>` con su `key` y el contenido de `renderItem(item, indice)`.

```tsx
import type { ReactNode } from "react";

export type ListaProps<T> = {
  items: T[];
  renderItem: (item: T, indice: number) => ReactNode;
  obtenerClave: (item: T) => string | number;
  vacio?: ReactNode;
};

export function Lista<T>({ items, renderItem, obtenerClave, vacio = "No hay elementos" }: ListaProps<T>) {
  if (items.length === 0) return <p>{vacio}</p>;

  return (
    <ul>
      {items.map((item, indice) => (
        <li key={obtenerClave(item)}>{renderItem(item, indice)}</li>
      ))}
    </ul>
  );
}
```

## Por qué funciona

Cómo infiere TypeScript con dos usos distintos:

| Uso | `T` inferido | Tipo de `p` en `renderItem` | `p.titulo` |
|---|---|---|---|
| `<Lista items={productos} ... />` | `Producto` | `Producto` | error: no existe |
| `<Lista items={["rojo", "verde"]} ... />` | `string` | `string` | error: no existe |
| `<Lista items={[]} ... />` | `never` | `never` | (por eso el test escribe `[] as Producto[]`) |

Recorrido en ejecución con tres productos y `renderItem={(p, i) => \`${i + 1}. ${p.nombre}\`}`:

| `indice` | `item` | `key` | Contenido del `<li>` |
|---|---|---|---|
| 0 | Teclado | `1` | `1. Teclado` |
| 1 | Mouse | `2` | `2. Mouse` |
| 2 | Monitor | `3` | `3. Monitor` |

La `key` le sirve a React para saber **qué elemento es cuál** entre renders. Si se borra el Mouse, React ve que la key `2` desapareció y quita solo ese `<li>`, en vez de reescribir todos. Por eso debe ser estable y única (un `id`), no el índice.

## Errores comunes

- **Props con `any`.** Todo funciona en ejecución, pero `p.titulo` compila y devuelve `undefined`: el error lo ves en pantalla. Fallan los `@ts-expect-error`.
- **`items: unknown[]` sin genérico.** Ahora `p` es `unknown` y no puedes leer `p.nombre` sin comprobarlo: la lista se vuelve incómoda de usar. Es el genérico el que conserva el tipo.
- **Usar el índice como `key`** (`key={indice}`). Funciona mientras la lista no cambie de orden; al borrar o reordenar, React confunde elementos (por ejemplo, un input con texto queda en la fila equivocada).
- **Olvidar la `key`.** React muestra la advertencia "Each child in a list should have a unique key prop".
- **Pintar `<ul>` vacío** cuando no hay elementos. El test busca que no exista la lista (`queryByRole("list")` es `null`).
- **Arrow function genérica en `.tsx`**: `const Lista = <T>(props: ListaProps<T>) => ...` se confunde con una etiqueta JSX `<T>`. Se escribe `<T,>(props...)` (con coma) o se usa `function`, como en la solución.

## Otra forma de resolverlo

**Con `children` como función** en vez de `renderItem`:

```tsx
type ListaProps<T> = {
  items: T[];
  obtenerClave: (item: T) => string | number;
  children: (item: T, indice: number) => ReactNode;
};

export function Lista<T>({ items, obtenerClave, children }: ListaProps<T>) {
  return <ul>{items.map((item, i) => <li key={obtenerClave(item)}>{children(item, i)}</li>)}</ul>;
}

// Uso:
<Lista items={productos} obtenerClave={(p) => p.id}>
  {(p) => <span>{p.nombre}</span>}
</Lista>
```

**¿Cuándo conviene?** Es el mismo patrón (render prop) con otra sintaxis. `renderItem` es más explícito y permite tener varias render props (`renderItem`, `renderVacio`, `renderCabecera`). `children` como función se lee bonito con una sola, pero confunde a quien espera que `children` sea JSX. Librerías como React Native (`FlatList`) usan `renderItem` y `keyExtractor`, casi igual que este ejercicio.

## Cómo explicarlo en la entrevista

> "Hice el componente genérico en T, el tipo de cada elemento. Las props usan T en `items`, en `renderItem` y en `obtenerClave`, así que TypeScript infiere T de `items` y el callback recibe el tipo correcto con autocompletado, sin anotar nada. El componente solo recorre y delega cómo se pinta cada elemento con una render prop. La key la saco con `obtenerClave`, que debe devolver string o number, para tener una clave estable y no usar el índice. Si no hay elementos, muestro un mensaje configurable."

## Conceptos

- **Componentes genéricos** (tema de Aprender: React con TypeScript).
- **Genéricos e inferencia** desde las props (tema de Aprender: genéricos).
- **Render props**: pasar una función que decide qué pintar.
- **`ReactNode`** como tipo de retorno de esa función.
- **`key` en listas**: estable y única, no el índice.
- **Return temprano** para el caso vacío.
- **`<T,>` en arrow functions** dentro de `.tsx`.
