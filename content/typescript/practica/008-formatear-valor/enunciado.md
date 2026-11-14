Estás haciendo una tabla genérica para un panel de administración: cada celda puede traer un texto, un número, un sí/no o nada. Escribe `formatearValor(valor)` que convierta cualquiera de esos valores en el texto que se muestra en la celda.

Primero define el tipo:

```ts
export type ValorCelda = string | number | boolean | null;
```

Luego la función `formatearValor(valor: ValorCelda): string`, que usa **narrowing** (`typeof` y comparaciones) para tratar cada tipo por separado.

## Reglas

| Si el valor es... | Devuelve |
|---|---|
| `null` | `"Sin dato"` |
| un `boolean` | `"Sí"` si es `true`, `"No"` si es `false` |
| un `number` | el número con 2 decimales: `12.5` da `"12.50"` |
| un `string` | el texto sin espacios al inicio ni al final; si queda vacío, `"Sin dato"` |

- Ojo con los valores "falsy": `0` se muestra como `"0.00"` y `false` como `"No"`, no como `"Sin dato"`.
- Pasar `undefined`, un objeto o un array debe ser un **error de tipos**.

## Ejemplos

```ts
formatearValor(null);          // "Sin dato"
formatearValor(true);          // "Sí"
formatearValor(false);         // "No"
formatearValor(12.5);          // "12.50"
formatearValor(0);             // "0.00"
formatearValor("  Lima ");     // "Lima"
formatearValor("   ");         // "Sin dato"

formatearValor(undefined);     // error de TypeScript
formatearValor({ a: 1 });      // error de TypeScript
```

## Reto extra

Dentro de cada `if (typeof valor === "...")`, pasa el cursor sobre `valor` en VS Code. El tipo cambia: primero es la unión completa, dentro del `if` es solo `number`, y después del `if` ya no incluye `number`. Eso es el narrowing.
