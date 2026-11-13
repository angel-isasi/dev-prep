## Idea clave

Primero **transformas los datos** con JavaScript puro (de arreglo plano a objeto agrupado) y después el JSX **solo recorre** el resultado. El componente no "piensa", solo pinta.

## Paso a paso

1. **Agrupa con `reduce`.** Empiezas con un objeto vacío `{}`. En cada pizza lees su categoría (`item[clave]`) y la agregas al arreglo de ese grupo.
2. **Crea el grupo si no existe.** `grupos[valor] ??= []` significa: "si `grupos[valor]` es `null` o `undefined`, asígnale `[]`". La expresión devuelve el arreglo (nuevo o existente), así que puedes encadenar `.push(item)`.
3. **Devuelve el acumulador** en cada vuelta (`return grupos`). Si lo olvidas, en la siguiente vuelta `grupos` vale `undefined`.
4. **En el componente**, llama a `agrupar(pizzas, "categoria")` en el cuerpo, sin estado: es un cálculo derivado de las props.
5. **Recorre el objeto** con `Object.entries`, que devuelve pares `[clave, valor]` en el orden en que se crearon las claves.
6. **Pinta cada sección** con `key={categoria}` (las categorías son únicas porque son claves de un objeto) y `aria-label` para que tenga nombre accesible.

```jsx
export function agrupar(lista, clave) {
  return lista.reduce((grupos, item) => {
    const valor = item[clave];
    (grupos[valor] ??= []).push(item);
    return grupos;
  }, {});
}

export function MenuPorCategoria({ pizzas }) {
  const grupos = agrupar(pizzas, "categoria");

  return (
    <>
      {Object.entries(grupos).map(([categoria, items]) => (
        <section key={categoria} aria-label={categoria}>
          <h2>{categoria}</h2>
          <ul>
            {items.map((pizza) => (
              <li key={pizza.nombre}>{pizza.nombre}</li>
            ))}
          </ul>
        </section>
      ))}
    </>
  );
}
```

¿`push` no es mutar? Sí, pero mutas el **acumulador**, un objeto nuevo que creó `reduce` en esta misma llamada. La lista original (`pizzas`) no se toca, por eso la función sigue siendo pura desde afuera.

## Por qué funciona

Recorrido de `reduce` con las 3 pizzas del ejemplo:

| Vuelta | `item.categoria` | `grupos` después |
|---|---|---|
| inicio | | `{}` |
| 1 | `"Clásicas"` | `{ Clásicas: [Margarita] }` |
| 2 | `"Veggie"` | `{ Clásicas: [Margarita], Veggie: [Vegana] }` |
| 3 | `"Clásicas"` | `{ Clásicas: [Margarita, Pepperoni], Veggie: [Vegana] }` |

Luego `Object.entries(grupos)` da `[["Clásicas", [...]], ["Veggie", [...]]]`. Las claves de texto se guardan en orden de inserción, por eso "Clásicas" sale primero: fue la primera categoría que apareció.

Con `pizzas = []`, `reduce` devuelve el valor inicial `{}`, `Object.entries({})` es `[]` y el `map` no pinta nada.

## Errores comunes

- **Olvidar el valor inicial de `reduce`.** Sin `{}`, el primer acumulador sería la primera pizza y todo se rompe. Con un arreglo vacío, además, lanza `TypeError: Reduce of empty array with no initial value`.
- **No devolver el acumulador.** Si escribes `(grupos, item) => { ...push(item) }` sin `return`, en la segunda vuelta `grupos` es `undefined` y sale "Cannot read properties of undefined".
- **Agrupar dentro del JSX con `filter` por cada categoría.** Funciona, pero recorres la lista una vez por categoría y el JSX se llena de lógica. Agrupar una sola vez y luego pintar es más claro.
- **Usar `Object.keys` y después buscar los items a mano.** `Object.entries` ya te da clave y valor juntos.
- **Usar el índice como `key`.** Aquí tienes un valor único y estable (la categoría y el nombre), úsalo.

## Otra forma de resolverlo

Con **`Object.groupBy`**, que ya existe en JavaScript moderno (Node 21+, navegadores actuales) y hace exactamente esto:

```jsx
export function agrupar(lista, clave) {
  return Object.groupBy(lista, (item) => item[clave]);
}
```

**¿Cuándo conviene?** Siempre que tu entorno lo soporte: es más corto y expresa la intención. En entrevista es bueno saber escribir la versión con `reduce` (te la pueden pedir "sin métodos nuevos") y mencionar que `Object.groupBy` existe. Ojo: devuelve un objeto sin prototipo, así que no tiene métodos como `hasOwnProperty`, pero `Object.entries` funciona igual.

## Cómo explicarlo en la entrevista

> "Separé el problema en dos. Primero, una función pura `agrupar` que con `reduce` convierte el arreglo en un objeto `{ categoria: [pizzas] }`; como es pura, la puedo probar sin React. Después, el componente solo llama a esa función en cada render y recorre el resultado con `Object.entries` y `map`. No guardo los grupos en estado porque se pueden calcular a partir de las props. Uso la categoría como `key` porque es única y estable, y le pongo `aria-label` a cada sección para que sea accesible."

## Conceptos

- **`reduce`**: recorre un arreglo acumulando un resultado; aquí, un objeto de grupos.
- **`??=` (asignación con nulish)**: asigna solo si el valor actual es `null` o `undefined`.
- **`Object.entries`**: convierte un objeto en un arreglo de pares `[clave, valor]`.
- **Estado derivado**: lo que se calcula a partir de props no se guarda en `useState`.
- **Fragmento `<>...</>`**: agrupa varios elementos sin agregar un nodo extra al DOM.
- **`key` en listas**: identificador único y estable para que React reconozca cada elemento.
- **`Object.groupBy`**: versión nativa de agrupar.
