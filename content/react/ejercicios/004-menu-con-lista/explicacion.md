## Idea clave

Para pintar una lista en React **transformas el arreglo de datos en un arreglo de elementos con `map`**. Cada elemento necesita una **`key` única y estable** (aquí, el `id`) para que React pueda identificarlo entre renders.

## Paso a paso

1. **Devuelve el contenedor** `<ul>`.
2. **Dentro, entre llaves, usa `map`.** `pizzas.map((pizza) => <li>...</li>)` devuelve un arreglo nuevo de elementos `<li>`. React sabe pintar un arreglo: pone cada elemento uno tras otro.
3. **Pon el nombre como texto**: `{pizza.nombre}`.
4. **Agrega la `key`** en el elemento que devuelve el `map` (el `<li>`, no el `<ul>`): `key={pizza.id}`. No se ve en la página: es información interna para React.
5. **Paréntesis en la flecha.** `(pizza) => ( <li>...</li> )` devuelve el JSX directamente. Si usas llaves `{ }` en la flecha, necesitas escribir `return`.

```jsx
export function Menu({ pizzas }) {
  return (
    <ul>
      {pizzas.map((pizza) => (
        <li key={pizza.id}>{pizza.nombre}</li>
      ))}
    </ul>
  );
}
```

## Por qué funciona

Con `pizzas = [{ id: "m", nombre: "Margarita" }, { id: "p", nombre: "Pepperoni" }]`:

| Paso | Valor |
|---|---|
| `pizzas.map(...)` recibe `{ id: "m", ... }` | `<li key="m">Margarita</li>` |
| `pizzas.map(...)` recibe `{ id: "p", ... }` | `<li key="p">Pepperoni</li>` |
| Resultado del `map` | `[<li key="m">…</li>, <li key="p">…</li>]` |
| Lo que se pinta | `<ul><li>Margarita</li><li>Pepperoni</li></ul>` |

Con `[]`, el `map` devuelve `[]` y React no pinta nada dentro del `<ul>`.

**¿Para qué la `key`?** Cuando la lista cambia (se agrega, quita o reordena una pizza), React compara la lista nueva con la anterior. Con las `key` sabe que `"m"` sigue siendo Margarita aunque haya cambiado de posición, y solo mueve ese `<li>` en vez de rehacer todos. Sin `key` (o con el índice), si quitas el primer elemento React cree que todos cambiaron, y si los `<li>` tuvieran estado propio (un input, un checkbox) ese estado quedaría pegado al elemento equivocado.

## Errores comunes

- **Olvidar la `key`.** Se ve bien, pero la consola muestra "Each child in a list should have a unique "key" prop". Lo reconoces porque falla el test de las advertencias.
- **Usar el índice como `key`** (`map((pizza, i) => <li key={i}>)`). Quita la advertencia, pero si la lista se reordena o se borra un elemento, los índices se corren y React confunde los elementos. Úsalo solo si la lista nunca cambia y no tienes un id.
- **Poner la `key` en el elemento equivocado**, por ejemplo en un hijo del `<li>`. Va en el elemento que devuelve directamente el `map`.
- **Usar `forEach` en vez de `map`.** `forEach` devuelve `undefined`, así que no se pinta nada.
- **Flecha con llaves y sin `return`**: `pizzas.map((pizza) => { <li>...</li> })` devuelve `undefined` por cada pizza. La lista sale vacía.

## Otra forma de resolverlo

Desestructurar cada pizza dentro del `map` y sacar el elemento a su propio componente:

```jsx
function ItemMenu({ nombre }) {
  return <li>{nombre}</li>;
}

export function Menu({ pizzas }) {
  return (
    <ul>
      {pizzas.map(({ id, nombre }) => (
        <ItemMenu key={id} nombre={nombre} />
      ))}
    </ul>
  );
}
```

**¿Cuándo conviene?** Cuando cada fila crece (imagen, precio, botón "Agregar"): separarla en un componente deja el `Menu` corto y legible. Fíjate que la `key` se pone en `<ItemMenu>`, que es lo que devuelve el `map`, y que `key` **no llega como prop** a `ItemMenu`: es solo para React.

## Cómo explicarlo en la entrevista

> "Recorro el arreglo con `map` y devuelvo un `li` por pizza; React pinta arreglos de elementos sin problema. Le pongo a cada uno una `key` con el id, porque React la usa para saber qué elemento es cuál cuando la lista cambia y así actualizar solo lo necesario. Evito el índice como key porque si se reordena o se borra un elemento, los índices se corren y React puede mezclar el estado de los elementos."

## Conceptos

- **`map`**: crea un arreglo nuevo transformando cada elemento; ideal para pasar de datos a JSX.
- **Arreglos en JSX**: React pinta cada elemento de un arreglo en orden.
- **`key`**: identificador único y estable de cada elemento de una lista; lo usa React para comparar renders (reconciliación).
- **Índice como `key`**: solo aceptable en listas que nunca cambian.
- **Retorno implícito**: `(x) => (<li />)` devuelve el JSX sin escribir `return`.
