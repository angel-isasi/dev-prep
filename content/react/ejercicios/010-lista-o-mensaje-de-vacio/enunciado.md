Crea el componente `Pedido`, que recibe en la prop `items` un arreglo de textos (los nombres de las pizzas pedidas) y los muestra en una lista. Si el arreglo está vacío, en lugar de la lista muestra un mensaje.

## Reglas

- Exporta la función `Pedido`, que recibe la prop `items` (arreglo de textos).
- Si `items` está vacío, muestra **solo** un párrafo con el texto exacto: `Tu pedido está vacío. Agrega una pizza del menú.` En ese caso **no** debe haber ninguna `<ul>`.
- Si `items` tiene elementos, muestra una `<ul>` con un `<li>` por cada item, en el mismo orden en que llegan. En ese caso **no** se muestra el mensaje de vacío.
- Cada `<li>` necesita una `key`. Aquí puedes usar el propio texto del item.

## Ejemplo

```jsx
<Pedido items={[]} />
<Pedido items={["Margarita", "Pepperoni"]} />
```

| Uso | Se ve |
|---|---|
| `<Pedido items={[]} />` | Tu pedido está vacío. Agrega una pizza del menú. |
| `<Pedido items={["Margarita"]} />` | una lista con: Margarita |
| `<Pedido items={["Margarita", "Pepperoni"]} />` | una lista con: Margarita, Pepperoni |

## Por qué importa

Toda lista real puede llegar vacía: un carrito sin productos, una búsqueda sin resultados, una bandeja sin mensajes. Mostrar una lista vacía no le dice nada al usuario. En las entrevistas se fijan en si piensas en ese caso sin que te lo pidan.
