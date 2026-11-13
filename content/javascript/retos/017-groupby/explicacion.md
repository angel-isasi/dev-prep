## Idea clave

Usas un objeto como **diccionario de grupos**: la clave es el nombre del grupo y el valor es un arreglo. Recorres la lista una vez; para cada elemento calculas su grupo, creas el arreglo si no existía y le agregas el elemento.

## Paso a paso

1. **Recorre con `reduce`**, empezando con un objeto vacío `{}` como acumulador (`grupos`).
2. **Calcula el grupo**: si `clave` es una función, `clave(item)`; si es un texto, `item[clave]`.
3. **Crea el grupo si no existe y agrega**: `(grupos[grupo] ||= []).push(item)`. El operador `||=` asigna `[]` solo si `grupos[grupo]` está vacío (es `undefined`), y en cualquier caso devuelve el arreglo, al que le haces `push`.
4. **Devuelve `grupos`** en cada vuelta para que pase a la siguiente.

```js
export function agruparPor(lista, clave) {
  return lista.reduce((grupos, item) => {
    const grupo = typeof clave === "function" ? clave(item) : item[clave];
    (grupos[grupo] ||= []).push(item);
    return grupos;
  }, {});
}
```

## Por qué funciona

Recorrido con `agruparPor(gente, "ciudad")`:

| Vuelta | `item` | `grupo` | ¿Existía? | `grupos` al terminar |
|---|---|---|---|---|
| inicio | | | | `{}` |
| 1 | Ana | `"Ica"` | no: crea `[]` | `{ Ica: [Ana] }` |
| 2 | Luis | `"Lima"` | no: crea `[]` | `{ Ica: [Ana], Lima: [Luis] }` |
| 3 | Rosa | `"Ica"` | sí | `{ Ica: [Ana, Rosa], Lima: [Luis] }` |

Los grupos quedan en orden de aparición porque los objetos guardan las claves de texto en el orden en que se agregaron. Y los elementos son los mismos objetos de la lista: `push(item)` guarda la referencia, no una copia.

Un detalle: las claves de un objeto siempre son textos. Si la función devuelve números, como `p.length`, el grupo `3` queda guardado como `"3"`.

## Errores comunes

- **Crear el arreglo en cada vuelta: `grupos[grupo] = [item]`.** Cada elemento pisa al anterior y cada grupo termina con uno solo. Lo reconoces porque `Ica` tiene solo a Rosa.
- **Hacer `push` sin crear el grupo.** La primera vez `grupos[grupo]` es `undefined` y salta "Cannot read properties of undefined (reading 'push')".
- **Escribir `item.clave` en vez de `item[clave]`.** Buscas una propiedad llamada literalmente "clave". Lo reconoces porque todo cae en un grupo llamado `undefined`.
- **Olvidar `return grupos` dentro del `reduce`.** En la segunda vuelta el acumulador es `undefined` y salta un error.
- **No contemplar que `clave` sea función.** Haces `item[clave]` con una función como clave: el elemento no tiene esa propiedad y todo cae en un único grupo llamado `"undefined"`. Lo reconoces porque el test de pares e impares recibe `{ undefined: [1, 2, 3, 4] }`.

## Otra forma de resolverlo

Con `for...of` y un `if`, más fácil de leer en voz alta:

```js
export function agruparPor(lista, clave) {
  const obtenerGrupo = typeof clave === "function" ? clave : (item) => item[clave];
  const grupos = {};

  for (const item of lista) {
    const grupo = obtenerGrupo(item);
    if (!grupos[grupo]) grupos[grupo] = [];
    grupos[grupo].push(item);
  }

  return grupos;
}
```

Aquí se convierte el texto en una función **una sola vez**, antes del bucle, y así el bucle siempre llama a `obtenerGrupo` sin preguntar el tipo cada vez. Hoy existe `Object.groupBy(lista, fn)` nativo, que hace lo mismo con una función. Conviene mencionarlo, pero en la entrevista te piden escribirlo a mano.

## Cómo explicarlo en la entrevista

> "Recorro la lista una vez con `reduce` y voy armando un objeto donde cada clave es un grupo y su valor un arreglo. Para cada elemento calculo el grupo: si me pasaron una función la llamo, y si me pasaron un texto leo esa propiedad. Si el grupo no existe lo creo vacío y luego agrego el elemento. Es O(n). Hoy también existe `Object.groupBy`, pero así se ve cómo funciona."

## Conceptos

- **Objeto como diccionario**: guardar y leer con `obj[clave]` cuando la clave está en una variable.
- **`typeof x === "function"`**: la forma de saber si algo es una función.
- **`reduce` con objeto inicial**: el acumulador empieza en `{}` y se va llenando.
- **Operador `||=`**: `a ||= b` asigna `b` a `a` solo si `a` es falsy.
- **Claves de objeto**: siempre se guardan como texto (o símbolo); los números se convierten.
- **`Object.groupBy`**: versión nativa reciente de este mismo patrón.
