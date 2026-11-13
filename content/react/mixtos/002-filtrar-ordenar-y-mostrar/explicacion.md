## Idea clave

Encadena `filter` y `toSorted` para obtener una **lista nueva** y pinta esa. `toSorted` ordena una copia, así **nunca modificas las props**, que en React son de solo lectura.

## Paso a paso

1. **Filtra** con `pizzas.filter((pizza) => pizza.disponible)`. `filter` siempre devuelve un arreglo nuevo.
2. **Ordena** con `toSorted((a, b) => a.precio - b.precio)`. El comparador devuelve un número negativo si `a` va antes, positivo si va después y `0` si da igual.
3. **Pinta** una `<ol>` (es una lista con orden, el orden importa) con un `<li key={pizza.nombre}>` por pizza.

```jsx
export function Disponibles({ pizzas }) {
  const lista = pizzas
    .filter((pizza) => pizza.disponible)
    .toSorted((a, b) => a.precio - b.precio);

  return (
    <ol>
      {lista.map((pizza) => (
        <li key={pizza.nombre}>{pizza.nombre}</li>
      ))}
    </ol>
  );
}
```

## Por qué funciona

Con el ejemplo:

1. `filter` descarta "Agotada": queda `[Trufa (45), Margarita (28)]`.
2. `toSorted` compara `Trufa` con `Margarita`: `45 - 28 = 17`, positivo, así que Trufa va **después**. Resultado: `[Margarita, Trufa]`.
3. El `map` pinta dos `<li>` en ese orden.

¿Y si la prop llega congelada (`Object.freeze`)? `filter` y `toSorted` solo **leen** el arreglo original y crean otros nuevos, así que no hay problema. En cambio `pizzas.sort(...)` intentaría reordenar el arreglo congelado y lanzaría `TypeError: Cannot assign to read only property`.

Sobre los empates: `toSorted` (igual que `sort`) es **estable** desde ES2019: si el comparador devuelve `0`, los elementos mantienen su orden relativo. Por eso Hawaiana sigue antes que Napolitana.

## Errores comunes

- **Usar `sort` directamente sobre la prop.** Ordena el arreglo del padre. Lo reconoces porque en el test congelado sale un `TypeError`, y en una app real porque otra parte de la pantalla "se reordena sola".
- **Ordenar primero y filtrar después.** Funciona, pero ordenas elementos que luego vas a descartar. Filtrar primero es más barato.
- **Comparador con booleanos**: `(a, b) => a.precio > b.precio`. Devuelve `true`/`false` en vez de un número y el orden sale mal en algunos casos. Usa la resta.
- **Restar al revés** (`b.precio - a.precio`): ordena de la más cara a la más barata.
- **Guardar la lista ordenada en un `useState`.** Es estado derivado: se calcula en cada render.

## Otra forma de resolverlo

Si tu entorno no tiene `toSorted` (navegadores viejos), copia antes de ordenar:

```jsx
const lista = [...pizzas.filter((p) => p.disponible)].sort((a, b) => a.precio - b.precio);
```

Aquí la copia con `[...]` ni siquiera es obligatoria, porque `filter` ya devolvió un arreglo nuevo que es tuyo. Pero si ordenas **sin filtrar antes**, la copia es imprescindible: `[...pizzas].sort(...)`.

**¿Cuándo conviene?** `toSorted` es lo más claro en código moderno (Node 20+ y navegadores actuales). La copia con spread es la forma clásica y la que verás en muchos proyectos existentes.

## Cómo explicarlo en la entrevista

> "Primero filtro las disponibles y después las ordeno por precio con `toSorted`, que devuelve una copia ordenada. No uso `sort` sobre la prop porque `sort` muta el arreglo, y las props en React son de solo lectura: si mutara el arreglo del padre, podría romper otra parte de la interfaz sin que React se entere. La lista resultante no la guardo en estado porque se deriva de las props; la calculo en cada render."

## Conceptos

- **`filter`**: devuelve un arreglo nuevo con los elementos que cumplen la condición.
- **`toSorted`**: versión no mutante de `sort`, devuelve una copia ordenada.
- **Comparador de orden**: función `(a, b)` que devuelve negativo, cero o positivo.
- **Orden estable**: los elementos "iguales" conservan su orden original.
- **Props inmutables**: un componente nunca modifica lo que recibe.
- **`Object.freeze`**: congela un objeto o arreglo; cualquier intento de cambiarlo falla.
- **`<ol>` vs `<ul>`**: lista ordenada cuando el orden tiene significado.
