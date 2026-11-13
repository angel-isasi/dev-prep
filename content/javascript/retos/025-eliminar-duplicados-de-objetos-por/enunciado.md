Escribe dos funciones para quitar duplicados:

- `unicos(lista)`: recibe un arreglo de **primitivos** (números, textos) y devuelve uno nuevo sin repetidos.
- `unicosPor(lista, clave)`: recibe un arreglo de **objetos** y devuelve uno nuevo donde no se repite el valor de la propiedad `clave`.

## Reglas

- En las dos, si un valor se repite, se queda **el primero** que aparece.
- El orden de los que quedan es el orden original.
- No modifiques la lista original.
- En `unicosPor`, los objetos que quedan son los mismos de la lista (no copias).

## Ejemplos

```js
unicos([3, 1, 3, 2, 1]);         // [3, 1, 2]
unicos(["a", "b", "a"]);         // ["a", "b"]

const votos = [
  { id: 1, corto: "A" },
  { id: 2, corto: "B" },
  { id: 1, corto: "C" },
];
unicosPor(votos, "id");
// [{ id: 1, corto: "A" }, { id: 2, corto: "B" }]
```

## Por qué importa

Datos repetidos llegan todo el tiempo: una API que pagina mal y te devuelve el mismo producto dos veces, votos duplicados, etiquetas repetidas. Si los pintas en React con su `id` como `key`, además te sale un aviso de claves duplicadas. La pregunta "¿por qué `new Set` no sirve para quitar objetos repetidos?" es un clásico de entrevista.
