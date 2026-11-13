## Idea clave

Un componente puede tener **varios `return`**. Atender primero el caso especial (la lista vacía) con un **return temprano** deja el resto del código limpio: lo que viene después ya sabe que hay items. Para pintar la lista, `map` convierte cada dato en un `<li>` con su `key`.

## Paso a paso

1. **Recibe la prop.** `function Pedido({ items })` saca el arreglo de las props.
2. **Pregunta por el caso vacío.** `items.length === 0` es `true` cuando no hay nada. En ese caso devuelves el párrafo con el mensaje y la función termina ahí.
3. **Pinta la lista.** Si el código llega a esta línea, hay al menos un item. `items.map((item) => <li key={item}>{item}</li>)` devuelve un arreglo de elementos JSX, y React sabe pintar arreglos.
4. **Pon la `key`.** React la usa para identificar cada `<li>` entre un render y otro. Como los nombres de pizza no se repiten en este ejercicio, el propio texto es una buena `key`.

```jsx
export function Pedido({ items }) {
  // Caso vacío primero: return temprano y listo.
  if (items.length === 0) {
    return <p>Tu pedido está vacío. Agrega una pizza del menú.</p>;
  }

  return (
    <ul>
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}
```

## Por qué funciona

React llama a `Pedido` con las props y pinta lo que devuelve. Según lo que llegue en `items`, la función toma un camino u otro:

| `items` | `items.length === 0` | Qué devuelve | Se pinta |
|---|---|---|---|
| `[]` | `true` | el `<p>` (return temprano) | Tu pedido está vacío. Agrega una pizza del menú. |
| `["Margarita"]` | `false` | `<ul>` con 1 `<li>` | Margarita |
| `["Margarita", "Pepperoni"]` | `false` | `<ul>` con 2 `<li>` | Margarita, Pepperoni |

`map` no cambia el arreglo original: crea uno nuevo, por ejemplo `[<li key="Margarita">Margarita</li>, <li key="Pepperoni">Pepperoni</li>]`, y React pinta cada elemento en orden.

## Errores comunes

- **Pintar la `<ul>` vacía.** Si solo haces el `map`, con `[]` se pinta una lista sin hijos y el usuario no ve nada. El test de "no pinta ninguna lista" lo detecta.
- **Escribir `{items.length && <ul>...</ul>}`.** Con `[]`, `items.length` es `0` y React pinta un **"0"** en pantalla. Si usas `&&`, compara de verdad: `items.length > 0 && ...`.
- **Olvidar la `key`.** Funciona, pero React muestra en la consola "Each child in a list should have a unique key prop". Con listas que cambian, sin `key` React puede confundir qué elemento es cuál.
- **Usar el índice como `key`** (`key={i}`) en listas que se reordenan o donde se borran elementos. Si el orden cambia, el índice cambia y React reutiliza mal los elementos.
- **Olvidar el `return` dentro del `map`** si usas llaves: `items.map((item) => { <li>{item}</li> })` devuelve `undefined` en cada vuelta. Usa paréntesis `( )` o escribe `return`.

## Otra forma de resolverlo

Con un solo `return` y el operador ternario dentro del JSX:

```jsx
export function Pedido({ items }) {
  return items.length === 0 ? (
    <p>Tu pedido está vacío. Agrega una pizza del menú.</p>
  ) : (
    <ul>
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}
```

**¿Cuándo conviene?** Cuando el caso vacío es solo una parte de un componente más grande (por ejemplo, el título del carrito siempre se ve y solo la zona de items cambia). Ahí no puedes salir de la función y el ternario dentro del JSX es lo natural. Si el caso vacío reemplaza **todo** el componente, el return temprano se lee mejor.

## Cómo explicarlo en la entrevista

> "Primero atiendo el caso borde: si el arreglo viene vacío, hago un return temprano con un mensaje, porque una lista vacía no le comunica nada al usuario. Si hay items, uso `map` para convertir cada uno en un `<li>` y le doy una `key` única y estable, que aquí es el propio nombre. No uso el índice como `key` porque si la lista se reordena React puede confundir los elementos. Y evito `items.length && ...` porque con cero pintaría un 0 en pantalla."

## Conceptos

- **Renderizado condicional**: devolver JSX distinto según una condición.
- **Return temprano**: salir de la función apenas se resuelve un caso especial.
- **`map` en JSX**: transforma un arreglo de datos en un arreglo de elementos.
- **`key`**: identificador único y estable de cada elemento de una lista.
- **Caso borde**: una entrada especial (vacía, nula, enorme) que hay que manejar aparte.
- **Trampa del `&&` con números**: `0 && algo` da `0`, y React pinta ese 0.
