## Idea clave

**Recursión por tipo de valor**: si es primitivo, lo devuelves; si es fecha, creas una nueva; si es arreglo, clonas cada elemento; si es objeto, clonas cada valor. Como cada pieza interna pasa otra vez por `clonar`, la copia es nueva en **todos** los niveles.

## Paso a paso

1. **Caso base**: si `valor` es `null` o su `typeof` no es `"object"`, es un primitivo. Los primitivos no se comparten por referencia, así que lo devuelves igual. Se revisa `null` aparte porque `typeof null` es `"object"` (un error histórico de JavaScript).
2. **Fechas**: `new Date(valor)` crea una fecha nueva con el mismo momento. Va antes que el caso de objeto, porque una fecha también es un objeto, pero sus datos no están en propiedades que `Object.entries` pueda ver.
3. **Arreglos**: `valor.map(clonar)` crea un arreglo nuevo donde cada elemento pasó por `clonar`.
4. **Objetos**: creas `{}` y, por cada par `[clave, interno]` de `Object.entries(valor)`, guardas `clonar(interno)`.

```js
export function clonar(valor) {
  if (valor === null || typeof valor !== "object") return valor;
  if (valor instanceof Date) return new Date(valor);
  if (Array.isArray(valor)) return valor.map(clonar);

  const copia = {};
  for (const [clave, interno] of Object.entries(valor)) {
    copia[clave] = clonar(interno);
  }
  return copia;
}
```

## Por qué funciona

Recorrido con `clonar({ a: 1, b: { c: [2, { d: 3 }] } })`:

| Llamada | Tipo | Qué hace |
|---|---|---|
| `clonar({ a, b })` | objeto | crea `{}` y clona cada valor |
| `clonar(1)` | primitivo | devuelve `1` |
| `clonar({ c: [...] })` | objeto | crea `{}` y clona `c` |
| `clonar([2, { d: 3 }])` | arreglo | `map(clonar)` sobre sus elementos |
| `clonar(2)` | primitivo | devuelve `2` |
| `clonar({ d: 3 })` | objeto | crea `{}`, clona `d` |
| `clonar(3)` | primitivo | devuelve `3` |

Cada `{}` y cada `map` crean un objeto **nuevo**. Al final, la copia no comparte ni un solo objeto con el original: por eso `copia.b.c[1].d = 99` no toca el original.

Compáralo con el spread: `{ ...original }` crea un objeto nuevo solo en el **primer nivel**; `copia.b` sigue siendo exactamente el mismo objeto que `original.b`. Eso es una copia superficial.

## Errores comunes

- **Olvidar el caso de `null`.** `typeof null` es `"object"`, así que entras al caso de objeto y `Object.entries(null)` lanza "Cannot convert undefined or null to object". Lo reconoces porque falla el test de primitivos.
- **Revisar las fechas después de los objetos, o no revisarlas.** Una fecha pasa por `Object.entries`, que no encuentra propiedades, y devuelve `{}`. Lo reconoces porque `copia.f` no es instancia de `Date`.
- **Copiar los valores sin llamar a `clonar`: `copia[clave] = interno`.** Solo copias un nivel, igual que el spread. Lo reconoces porque al cambiar `copia.b.c[2].d` también cambia el original.
- **Usar `{ ...valor }` o `[...valor]` como solución.** Mismo problema: copia superficial.
- **Usar `JSON.parse(JSON.stringify(valor))`.** Convierte las fechas en textos y borra las claves con `undefined`. Lo reconoces porque `copia.f` es un string.

## Otra forma de resolverlo

En código real se usa `structuredClone`, que ya viene en el navegador y en Node:

```js
export function clonar(valor) {
  return structuredClone(valor);
}
```

Copia fechas, `Map`, `Set`, arreglos tipados e incluso referencias circulares (un objeto que se contiene a sí mismo). No copia funciones ni el prototipo de tus clases. Conviene siempre que exista; la versión a mano es para demostrar que entiendes cómo funciona por dentro.

Si te piden soportar **referencias circulares** a mano, la mejora es llevar un `WeakMap` de "originales ya clonados": antes de clonar un objeto, miras si ya lo copiaste y devuelves esa copia en vez de entrar en un bucle infinito.

## Cómo explicarlo en la entrevista

> "El spread solo copia el primer nivel: los objetos internos siguen compartidos. Para una copia profunda uso recursión según el tipo: los primitivos los devuelvo igual, las fechas las recreo con `new Date`, los arreglos los mapeo con `clonar` y los objetos los reconstruyo clave por clave clonando cada valor. Reviso `null` aparte porque `typeof null` es `object`. Recorre cada valor una vez, así que es O(n) en la cantidad total de valores. En producción usaría `structuredClone`, que además soporta `Map`, `Set` y referencias circulares."

## Conceptos

- **Copia superficial**: objeto nuevo en el primer nivel, pero los internos se comparten (`{ ...obj }`, `[...arr]`, `Object.assign`).
- **Copia profunda**: todos los niveles son objetos nuevos.
- **Referencia**: las variables con objetos guardan "dónde está" el objeto, no el objeto en sí.
- **Recursión**: una función que se llama a sí misma con un problema más pequeño, con un caso base que la detiene.
- **`typeof null === "object"`**: rareza histórica; siempre revisa `null` aparte.
- **`Object.entries(obj)`**: arreglo de pares `[clave, valor]`.
- **`structuredClone`**: copia profunda nativa del navegador y de Node.
