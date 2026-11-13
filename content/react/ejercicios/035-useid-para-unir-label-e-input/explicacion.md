## Idea clave

`useId` genera un **id único por cada instancia** del componente. Con él unes `<label htmlFor={id}>` e `<input id={id}>` sin riesgo de ids repetidos, aunque uses `Campo` muchas veces. El resto de props se reenvía al input con `...props`.

## Paso a paso

1. **Separa la etiqueta del resto** con desestructuración y parámetro rest: `{ etiqueta, ...props }`. `props` queda como un objeto con todo lo demás (`type`, `placeholder`, `onChange`...).
2. **Pide un id** con `const id = useId()`. Cada `Campo` renderizado recibe uno diferente, y se mantiene igual entre renders.
3. **Une label e input**: `htmlFor={id}` en el label (en JSX se escribe `htmlFor` porque `for` es palabra reservada de JavaScript) e `id={id}` en el input.
4. **Reenvía las props**: `<input id={id} {...props} />`. El spread en JSX pasa cada propiedad del objeto como un atributo.

```jsx
import { useId } from "react";

// `...props` junta todas las props que no son `etiqueta`.
export function Campo({ etiqueta, ...props }) {
  const id = useId(); // único por cada Campo renderizado

  return (
    <div>
      <label htmlFor={id}>{etiqueta}</label>
      <input id={id} {...props} />
    </div>
  );
}
```

## Por qué funciona

Con `<Campo etiqueta="Nombre" />` y `<Campo etiqueta="Teléfono" type="tel" />`:

| Campo | `etiqueta` | `props` | `useId()` | HTML resultante |
|---|---|---|---|---|
| 1 | `"Nombre"` | `{}` | `"_r_1_"` (ejemplo) | `<label for="_r_1_">` + `<input id="_r_1_">` |
| 2 | `"Teléfono"` | `{ type: "tel" }` | `"_r_2_"` (ejemplo) | `<label for="_r_2_">` + `<input id="_r_2_" type="tel">` |

React asigna el id según la **posición del componente en el árbol**, no según sus props. Por eso dos `Campo` con la misma etiqueta reciben ids distintos. El formato exacto del id (`_r_1_`, `:r1:`, etc.) depende de la versión de React y no debes depender de él.

Cuando el navegador ve `for="_r_2_"`, sabe que ese label nombra al input con ese id: un clic en "Teléfono" enfoca su input y un lector de pantalla dice "Teléfono, cuadro de edición". `getByLabelText("Teléfono")` usa exactamente esa relación.

## Errores comunes

- **Escribir `for` en lugar de `htmlFor`.** React muestra la advertencia "Invalid DOM property `for`. Did you mean `htmlFor`?". En JSX siempre es `htmlFor` (igual que `className` en vez de `class`).
- **Usar la etiqueta como id** (`id={etiqueta}`). Dos campos "Nombre" comparten id y el segundo label apunta al primer input. Además, "Teléfono" con tilde y espacios no es un buen id. Falla el test de "misma etiqueta".
- **Generar el id con `Math.random()` o un contador global.** Cambia en cada render (el input pierde la relación) y no coincide entre servidor y cliente si usas renderizado en servidor. `useId` resuelve ambas cosas.
- **Olvidar `...props` en el input.** El `type="tel"` se pierde y el input queda como texto. Falla el test de "pasa el resto de props".
- **Usar `useId` para las `key` de una lista.** No sirve: `useId` es para atributos de accesibilidad; las `key` deben salir de tus datos.

## Otra forma de resolverlo

**Envolver el input dentro del label**: no necesita id, porque la relación es implícita.

```jsx
export function Campo({ etiqueta, ...props }) {
  return (
    <label>
      {etiqueta}
      <input {...props} />
    </label>
  );
}
```

**¿Cuándo conviene?** Es más simple y válido para accesibilidad, y lo verás mucho. Pero no siempre puedes anidar: a veces el diseño pone el label en otra columna, o necesitas el id para otras relaciones, como `aria-describedby` que une el input con un mensaje de error (`<p id={idError}>`). Ahí `useId` es la herramienta. En este ejercicio el enunciado pide label e input separados.

## Cómo explicarlo en la entrevista

> "Para que el label quede unido al input uso `htmlFor` y un `id`. Como `Campo` se puede usar muchas veces, no puedo escribir el id a mano ni sacarlo de la etiqueta, porque se repetiría. `useId` me da un id único y estable por cada instancia, que además coincide entre servidor y cliente. Las demás props las recojo con el parámetro rest y las paso al input con spread, así el componente sirve para cualquier tipo de campo."

## Conceptos

- **`useId`**: id único y estable por instancia; pensado para atributos de accesibilidad.
- **`htmlFor`**: el atributo `for` del label en JSX.
- **Accesibilidad de formularios**: cada input necesita un nombre accesible.
- **Parámetro rest** `{ a, ...resto }`: junta las propiedades restantes en un objeto.
- **Spread de props** `<input {...props} />`: pasa cada propiedad como atributo.
- **Componente reutilizable**: sin valores escritos a mano que choquen entre instancias.
- **`aria-describedby`**: une un input con un texto de ayuda o error (otro uso típico de `useId`).
