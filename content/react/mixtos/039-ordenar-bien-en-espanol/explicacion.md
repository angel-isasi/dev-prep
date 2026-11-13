## Idea clave

`sort()` sin argumentos compara **códigos Unicode**, no letras de un idioma. `Intl.Collator("es")` sabe ordenar en español, y con `sensitivity: "base"` ignora mayúsculas y tildes pero respeta la ñ como letra propia. Ordenas una **copia** con `toSorted` para no tocar la prop.

## Paso a paso

1. **Crear el comparador una vez.** `new Intl.Collator("es", { sensitivity: "base" })` arma las reglas del español. Se hace fuera del componente porque crearlo cuesta más que usarlo, y no depende de props ni estado.
2. **Tomar su `compare`.** `.compare` es una función `(a, b) => número` con `this` ya fijado al collator, así que se puede pasar suelta a `sort` o `toSorted`.
3. **`sensitivity: "base"`.** Solo importa la letra base: `"a"`, `"A"` y `"á"` valen lo mismo. La `ñ` no es "n con adorno" en español, es otra letra, así que sigue yendo después de la `n`.
4. **Ordenar una copia.** `nombres.toSorted(comparar)` devuelve un arreglo nuevo. `sort` en cambio ordena **en el sitio** y modificaría la prop del padre.
5. **Memorizar.** `useMemo(..., [nombres])` evita reordenar si el componente se vuelve a renderizar con el mismo arreglo.
6. **Pintar.** Un `<li key={nombre}>` por nombre, con el texto original.

```jsx
import { useMemo } from "react";

export const comparar = new Intl.Collator("es", { sensitivity: "base" }).compare;

export function Distritos({ nombres }) {
  const ordenados = useMemo(() => nombres.toSorted(comparar), [nombres]);

  return (
    <ul>
      {ordenados.map((nombre) => (
        <li key={nombre}>{nombre}</li>
      ))}
    </ul>
  );
}
```

## Por qué funciona

Mira los códigos Unicode de la primera letra de cada nombre:

| Nombre | Primera letra | Código Unicode | Para el Collator es |
|---|---|---|---|
| `"Nasca"` | N | 78 | n |
| `"Ocucaje"` | O | 79 | o |
| `"ica"` | i | 105 | i |
| `"Áncash"` | Á | 193 | a |
| `"Ñaña"` | Ñ | 209 | ñ (entre n y o) |

- `sort()` ordena por la columna de códigos: **Nasca, Ocucaje, ica, Áncash, Ñaña**. Las minúsculas (97 a 122) van después de todas las mayúsculas (65 a 90) y las letras con tilde (más de 190) al final.
- El Collator ordena por la última columna: a, i, n, ñ, o, es decir **Áncash, ica, Nasca, Ñaña, Ocucaje**.

Y `comparar("a", "Á")` da `0` porque con `sensitivity: "base"` son la misma letra base.

## Errores comunes

- **`nombres.sort()` sin comparador.** Ordena por código: mayúsculas primero, tildes y ñ al final. Falla el primer test.
- **`nombres.sort(comparar)` directo sobre la prop.** El orden se ve bien, pero modificaste el arreglo del padre. Es un bug difícil de rastrear: otro componente que use ese mismo arreglo cambia "solo". Lo detecta el test "no modifica el arreglo".
- **Comparar con `toLowerCase()` y `<`:** `(a, b) => a.toLowerCase() < b.toLowerCase() ? -1 : 1`. Arregla las mayúsculas, pero `"á"` (225) sigue después de `"z"` (122) y la `ñ` también.
- **Crear el Collator dentro del componente** sin memorizar. Funciona, pero lo reconstruye en cada render.
- **Quitar las tildes con `normalize("NFD")` para ordenar.** Así la `ñ` se convierte en `n` y `"Ñaña"` quedaría mezclada con las palabras de la n.

## Otra forma de resolverlo

Con `localeCompare`, que usa las mismas reglas por dentro:

```jsx
const ordenados = [...nombres].sort((a, b) => a.localeCompare(b, "es", { sensitivity: "base" }));
```

**¿Cuándo conviene?** Para ordenar una vez o pocos elementos, `localeCompare` es más corto y fácil de leer. Para listas grandes o que se ordenan seguido, `Intl.Collator` es más rápido porque prepara las reglas una sola vez en lugar de en cada comparación. `[...nombres].sort(...)` es la forma clásica de copiar y ordenar si el entorno no tiene `toSorted` (navegadores anteriores a 2023).

## Cómo explicarlo en la entrevista

> "El `sort` por defecto compara códigos Unicode, así que pone las mayúsculas antes y manda las tildes y la ñ al final. Uso `Intl.Collator` con el idioma español y `sensitivity: 'base'`, que ignora mayúsculas y tildes pero respeta la ñ como letra aparte. Lo creo una sola vez fuera del componente y paso su `compare` a `toSorted`, que devuelve una copia: no quiero mutar las props, porque son del padre. Lo envuelvo en `useMemo` para no reordenar en cada render."

## Conceptos

- **Orden por código Unicode**: lo que hace `sort()` sin comparador.
- **Función de comparación**: devuelve negativo, cero o positivo para decidir el orden de dos elementos.
- **`Intl.Collator`**: comparador de textos que respeta las reglas de un idioma.
- **`sensitivity: "base"`**: solo distingue letras base; ignora mayúsculas y tildes.
- **`toSorted`**: versión de `sort` que no muta y devuelve un arreglo nuevo (ES2023).
- **Props inmutables**: un componente nunca modifica lo que recibe por props.
- **`localeCompare`**: comparación por idioma desde un string.
- **`useMemo`**: evita repetir el ordenamiento si `nombres` no cambió.
