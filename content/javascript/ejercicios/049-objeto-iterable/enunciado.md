Escribe y exporta la clase `Playlist`, que guarda una lista de canciones. Un objeto normal no se puede recorrer con `for...of`; tu tarea es que una `Playlist` **sí** se pueda: con `for...of`, con spread (`[...playlist]`) y con `Array.from`.

## Reglas

- `new Playlist("A", "B", "C")` recibe las canciones como argumentos sueltos (cualquier cantidad, incluso ninguna).
- Las canciones se guardan en un campo privado.
- Recorrer la playlist entrega las canciones **en el orden** en que se pasaron.
- Se puede recorrer **varias veces**: cada recorrido empieza desde la primera canción.
- Hacer `[...playlist]` devuelve un arreglo nuevo: si lo modificas, la playlist no cambia.

## Ejemplos

```js
const lista = new Playlist("A", "B", "C");

[...lista];                // ["A", "B", "C"]
Array.from(lista);         // ["A", "B", "C"]

for (const cancion of lista) {
  console.log(cancion);    // "A", luego "B", luego "C"
}

const [primera] = lista;   // primera = "A"

[...new Playlist()];       // []
```

## Por qué importa

`for...of`, spread, `Array.from` y la desestructuración `[a, b] = ...` no funcionan solo con arreglos: funcionan con **cualquier objeto que tenga el método `Symbol.iterator`**. Así trabajan `Map`, `Set`, los strings y las `NodeList` del DOM. Saber hacer tus propios objetos iterables demuestra que entiendes el protocolo de iteración, no solo que sabes usar arreglos.
