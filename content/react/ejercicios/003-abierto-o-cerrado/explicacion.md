## Idea clave

Dentro del JSX no puedes escribir un `if`, pero sí cualquier **expresión**. El **operador ternario** `condición ? a : b` es una expresión que elige entre dos valores, por eso es la forma natural de pintar una cosa u otra.

## Paso a paso

1. **Recibe la prop** `abierto` desestructurada. Es un booleano: `true` o `false`.
2. **Devuelve un `<p>`.** La etiqueta es siempre la misma; solo cambia el texto.
3. **Elige el texto con el ternario**: `abierto ? "Abierto ahora" : "Cerrado"`. Si `abierto` es verdadero, la expresión vale `"Abierto ahora"`; si no, vale `"Cerrado"`.
4. **Mételo entre llaves** dentro del `<p>` para que React pinte el resultado.

```jsx
export function Estado({ abierto }) {
  return <p>{abierto ? "Abierto ahora" : "Cerrado"}</p>;
}
```

## Por qué funciona

Cada vez que React renderiza `Estado`, evalúa el ternario con el valor actual de la prop:

| Prop `abierto` | `abierto ? "Abierto ahora" : "Cerrado"` | Se pinta |
|---|---|---|
| `true` | `"Abierto ahora"` | `<p>Abierto ahora</p>` |
| `false` | `"Cerrado"` | `<p>Cerrado</p>` |

En el último test, el padre vuelve a renderizar el componente con otra prop (`rerender`). React llama de nuevo a la función, el ternario da el otro texto y React **actualiza solo el texto** del `<p>` que ya estaba en pantalla. No tienes que borrar nada a mano: describes cómo debe verse según los datos y React se encarga del resto.

## Errores comunes

- **Poner un `if` dentro de las llaves**: `<p>{if (abierto) ...}</p>`. Es un error de sintaxis porque `if` es una sentencia, no una expresión.
- **Pasar el booleano como texto**: `<Estado abierto="false" />`. El texto `"false"` no está vacío, así que es *truthy* y se mostraría "Abierto ahora". Los booleanos se pasan con llaves: `abierto={false}`.
- **Pintar los dos textos** con dos `&&` mal armados, por ejemplo `{abierto && "Abierto ahora"}{"Cerrado"}`. Lo reconoces porque el test que verifica que el otro texto **no** aparece falla.
- **Cambiar el texto** ("Abierto", "Está cerrado"). Los tests buscan el texto exacto.

## Otra forma de resolverlo

Con un `if` **antes** del `return`, fuera del JSX:

```jsx
export function Estado({ abierto }) {
  if (abierto) {
    return <p>Abierto ahora</p>;
  }
  return <p>Cerrado</p>;
}
```

O guardando el texto en una variable:

```jsx
export function Estado({ abierto }) {
  const texto = abierto ? "Abierto ahora" : "Cerrado";
  return <p>{texto}</p>;
}
```

**¿Cuándo conviene?** El `if` con varios `return` es mejor cuando las dos ramas pintan estructuras muy distintas (por ejemplo, una lista completa o un mensaje de error). El ternario dentro del JSX es mejor cuando solo cambia un trozo pequeño, como aquí. Ternarios anidados (`a ? b : c ? d : e`) se vuelven ilegibles: en ese caso usa `if` o un objeto como tabla.

## Cómo explicarlo en la entrevista

> "Es renderizado condicional. Como dentro de JSX solo puedo poner expresiones, uso el operador ternario para elegir el texto según la prop `abierto`. Si las dos ramas fueran muy distintas, haría un `if` con `return` temprano antes del JSX. Y me aseguro de pasar el booleano con llaves, porque el texto `"false"` sería verdadero."

## Conceptos

- **Renderizado condicional**: pintar una cosa u otra según props o estado.
- **Operador ternario**: `condición ? a : b`, una expresión que devuelve `a` o `b`.
- **Expresión vs. sentencia**: en las llaves de JSX solo van expresiones (dan un valor); `if`, `for` y `while` son sentencias.
- **Truthy / falsy**: `"false"` (texto) es truthy; `false`, `0`, `""`, `null` y `undefined` son falsy.
- **Re-render**: cuando cambian las props, React vuelve a llamar al componente y actualiza solo lo que cambió.
