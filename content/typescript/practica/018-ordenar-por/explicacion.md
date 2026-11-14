## Idea clave

`K extends keyof T` limita el campo a nombres de propiedades reales, y `T[K]` es el tipo del valor de esa propiedad. Con eso una sola función ordena por cualquier columna y `valoresDe(productos, "precio")` sabe que devuelve `number[]`. La lógica es un `sort` sobre una copia con un comparador que distingue textos de números.

## Paso a paso

1. **El tipo de la dirección.** No es cualquier texto, son dos valores posibles. Una unión de literales lo expresa y hace que `"arriba"` sea un error:

   ```ts
   export type Direccion = "asc" | "desc";
   ```

2. **Acceso tipado con `T[K]`.** Si `T` es `Producto` y `K` es `"precio"`, `T[K]` es `Producto["precio"]`, o sea `number`. Por eso `valoresDe` puede prometer `T[K][]`:

   ```ts
   export function valoresDe<T, K extends keyof T>(lista: T[], campo: K): T[K][] {
     return lista.map((elemento) => elemento[campo]);
   }
   ```

   TypeScript infiere `K` como el literal que pasaste (`"precio"`, no `string`), y de ahí sale `number[]`.

3. **Copia antes de ordenar.** `sort` ordena **en el mismo arreglo** y lo devuelve. Si haces `lista.sort(...)`, desordenas la lista de quien te llamó (en React, el estado). `[...lista]` crea una copia.

4. **Escribe el comparador.** `sort` llama a tu función con dos elementos `a` y `b`; si devuelves negativo, `a` va antes; positivo, `b` va antes; cero, se quedan como están.
   - Para textos, `localeCompare` ya devuelve ese número y ordena bien `"audífonos"` o `"ñandú"`.
   - Para lo demás, `x < y ? -1 : x > y ? 1 : 0`.
   - Para comprobar si es texto usas `typeof x === "string"`: también estrecha `T[K]` a `string` dentro del `if`, por eso puedes llamar `x.localeCompare(y)`.

5. **La dirección invierte el signo.** Si el orden ascendente dice "-1, a va antes", el descendente dice "1, b va antes". `return direccion === "asc" ? orden : -orden;`.

## Por qué funciona

`ordenarPor(productos, "precio", "desc")` con teclado (120), mouse (45) y audífonos (80). Algunas comparaciones que hace `sort`:

| `a` | `b` | `x < y` | `orden` (asc) | Devuelve (desc) | Significado |
|---|---|---|---|---|---|
| mouse (45) | teclado (120) | sí | -1 | 1 | teclado antes que mouse |
| audífonos (80) | mouse (45) | no | 1 | -1 | audífonos antes que mouse |
| audífonos (80) | teclado (120) | sí | -1 | 1 | teclado antes que audífonos |

Resultado: teclado, audífonos, mouse.

Con `"stock"`, teclado y audífonos tienen 5: el comparador devuelve 0 y, como `sort` es **estable** en JavaScript moderno, conservan su orden original (teclado antes que audífonos). Mouse (20) va al final.

Sin `localeCompare`, `"audífonos" < "mouse"` también funciona aquí, pero comparar con `<` usa códigos Unicode: `"Zapato" < "auto"` es `true` (las mayúsculas van antes) y `"ñ"` va después de `"z"`.

## Errores comunes

- **Ordenar el original** (`return lista.sort(...)`). Devuelve la misma referencia y el test "no modifica la lista original" falla.
- **Devolver `true`/`false` en el comparador** (`(a, b) => a.precio > b.precio`). `sort` espera un número; con booleanos el orden sale mal en algunos casos.
- **Restar siempre** (`x - y`). Funciona con números, pero con textos da `NaN`. Por eso se separan los dos casos.
- **Tipar `campo: string`.** Pierdes la revisión del campo y `elemento[campo]` no compila con `T`. tsc avisa con la directiva `@ts-expect-error` no usada.
- **Tipar el retorno de `valoresDe` como `unknown[]` o `any[]`.** Compila, pero quien la use no sabe que son números: el test de tipos espera `number[]` para `"precio"`.

## Otra forma de resolverlo

**Con `toSorted`** (ES2023), que ya devuelve una copia ordenada sin tocar el original:

```ts
return lista.toSorted((a, b) => {
  // el mismo comparador
});
```

Es lo más limpio si tu entorno lo soporta (Node 20 o más y navegadores modernos). `[...lista].sort(...)` funciona en todos lados y es lo que más verás en código existente.

**Una función de comparación genérica aparte** (`compararValores(x, y)`) y reutilizarla en otras tablas. Conviene cuando ordenas en varios lugares de la app.

## Cómo explicarlo en la entrevista

> "Hice la función genérica con K extends keyof T, así el campo solo puede ser una propiedad real del objeto, y el valor se lee con tipo T[K]; por eso valoresDe devuelve number[] cuando el campo es precio. Para la dirección usé una unión de literales asc o desc. Como sort muta el arreglo, ordeno una copia. El comparador usa localeCompare para textos, por tildes y mayúsculas, y menor/mayor para lo demás; para desc solo invierto el signo. Y como sort es estable, los empates conservan su orden."

## Conceptos

- **`keyof T`**: unión de los nombres de propiedades de `T`.
- **Tipo de acceso indexado (`T[K]`)**: el tipo del valor de la propiedad `K`; `T[K][]` es un arreglo de esos valores.
- **Unión de literales**: `"asc" | "desc"` como tipo con solo dos valores válidos.
- **Parámetro por defecto**: `direccion: Direccion = "asc"`.
- **`sort` y comparador**: muta el arreglo; el comparador devuelve negativo, cero o positivo.
- **`localeCompare`**: compara textos según el idioma (tildes, ñ, mayúsculas).
- **Ordenamiento estable**: los empates conservan el orden original.
- Repasa el tema de Aprender "TS: utility types" (y "TS: genéricos") y, en la Referencia, `sort`, `toSorted` y `localeCompare`.
