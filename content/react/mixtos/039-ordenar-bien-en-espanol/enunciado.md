Crea el componente **`Distritos`** que recibe la prop `nombres` (un arreglo de textos) y los muestra en una lista `<ul>` **ordenados alfabéticamente como en un diccionario en español**.

Exporta también **`comparar(a, b)`**, la función de comparación que usas para ordenar.

## Reglas

- Las mayúsculas y minúsculas no cuentan: `"ica"` va entre `"Áncash"` y `"Nasca"`, no al final.
- Las tildes no cuentan para el orden: `"Áncash"` se ordena como `"Ancash"`.
- La `ñ` es una letra propia que va **después de la `n`** y antes de la `o`.
- `comparar` devuelve un número negativo si `a` va antes, positivo si va después y `0` si son "iguales" para el orden (por ejemplo `comparar("a", "Á")` es `0`).
- **No modifiques** el arreglo que llega por props: ordena una copia.
- Un `<li>` por nombre, mostrando el texto original (con sus tildes y mayúsculas).

## Ejemplo

```jsx
<Distritos nombres={["Ñaña", "Ocucaje", "ica", "Áncash", "Nasca"]} />
```

| Orden por defecto (`sort()`) | Orden correcto |
|---|---|
| Nasca, Ocucaje, ica, Áncash, Ñaña | Áncash, ica, Nasca, Ñaña, Ocucaje |

## Por qué importa

El `sort()` por defecto compara códigos Unicode: pone las mayúsculas antes que las minúsculas y manda las tildes y la ñ al final. En una app para usuarios peruanos eso se ve como un bug. Saber usar `Intl.Collator` (o `localeCompare`) y no mutar las props son detalles que un entrevistador nota.
