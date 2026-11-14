## Idea clave

En TypeScript anotas el tipo de cada parámetro y lo que devuelve la función: `(precio: number, tasa: number = 0.18): number`. Un valor por defecto hace que el parámetro sea **opcional** para quien llama, y el compilador rechaza cualquier llamada con un tipo equivocado antes de que el código corra.

## Paso a paso

1. **Primero el JavaScript.** La cuenta es simple: `precio * (1 + tasa)`. Con 100 y 0.18 da 118.
2. **Anota los parámetros.** Sin tipo, TypeScript en modo estricto marca `precio` como "any implícito": no sabe qué es, así que no te protege. Escribe `precio: number`.
3. **El parámetro opcional con valor por defecto.** `tasa: number = 0.18` le da tipo y valor a la vez. Si quien llama no la pasa, vale 0.18. No hace falta el `?`: el valor por defecto ya la vuelve opcional.
4. **Anota el retorno.** `): number` después del paréntesis. TypeScript lo puede inferir, pero escribirlo es un contrato: si algún día devuelves un `string` por error, el error aparece en la función y no lejos, donde la usas.
5. **Redondea sin cambiar de tipo.** `Math.round(total * 100) / 100` sigue siendo un `number`.

```ts
export function precioConIgv(precio: number, tasa: number = 0.18): number {
  const total = precio * (1 + tasa);
  return Math.round(total * 100) / 100;
}
```

## Por qué funciona

Recorrido con `precioConIgv(50.5)`:

| Paso | Valor |
|---|---|
| `tasa` (no se pasó) | `0.18` |
| `precio * (1 + tasa)` | `50.5 * 1.18 = 59.589999999999996` |
| `total * 100` | `5958.9999999999996` |
| `Math.round(...)` | `5959` |
| `/ 100` | `59.59` |

Los decimales en JavaScript no son exactos (`59.589999...`), por eso redondeas al final y no a mano.

Y en tiempo de compilación, `precioConIgv("100")` falla porque `"100"` es `string` y el parámetro pide `number`. Sin la anotación, JavaScript haría `"100" * 1.18 = 118` (convierte solo) y el error pasaría escondido hasta el día que llegue `"cien"`.

## Errores comunes

- **Dejar los parámetros sin tipo.** En modo estricto es un error ("El parámetro 'precio' tiene un tipo 'any' implícitamente"). Lo verás en el caso de `tsc`.
- **Usar `toFixed(2)` para redondear.** `toFixed` devuelve un **string** (`"59.59"`). Tu función dejaría de cumplir `: number` y `tsc` te avisa: "El tipo 'string' no se puede asignar al tipo 'number'".
- **Escribir `tasa?: number = 0.18`.** No puedes usar `?` y valor por defecto juntos: TypeScript da error. Basta con el valor por defecto.
- **Poner `tasa?: number` sin valor y olvidar el caso `undefined`.** `precio * (1 + undefined)` da `NaN`. Si usas `?`, tienes que manejar tú el valor que falta (por ejemplo `tasa ?? 0.18`).
- **Redondear antes de multiplicar.** Redondea solo el resultado final.

## Otra forma de resolverlo

**Parámetro opcional con `?` y `??`**:

```ts
export function precioConIgv(precio: number, tasa?: number): number {
  const t = tasa ?? 0.18;
  return Math.round(precio * (1 + t) * 100) / 100;
}
```

Para quien llama es igual: `(precio: number, tasa?: number) => number`. Dentro de la función, `tasa` es `number | undefined` y tienes que resolver el `undefined` tú mismo.

**¿Cuál conviene?** El valor por defecto es más corto y deja `tasa` como `number` dentro de la función. El `?` sirve cuando "no me pasaron nada" significa algo distinto de un valor concreto (por ejemplo, "no aplicar descuento").

## Cómo explicarlo en la entrevista

> "Anoto los dos parámetros como number y el retorno como number. La tasa tiene valor por defecto 0.18, así que quien llama puede omitirla y TypeScript la muestra como opcional. Calculo precio por uno más la tasa y redondeo a dos decimales con Math.round, no con toFixed, porque toFixed devuelve un string y rompería el tipo de retorno. La ventaja de anotar es que una llamada con un texto falla al compilar y no en producción."

## Conceptos

- **Anotación de tipo**: `nombre: tipo` en parámetros, variables y retorno.
- **Tipo de retorno**: `function f(): number`, un contrato que el compilador revisa.
- **Parámetro con valor por defecto**: `tasa: number = 0.18`, opcional para quien llama.
- **Parámetro opcional `?`**: su tipo dentro de la función es `T | undefined`.
- **`any` implícito**: en modo estricto, un parámetro sin tipo es un error.
- **Redondeo**: `Math.round(x * 100) / 100` mantiene el `number`; `toFixed` devuelve `string`.
- Tema de Aprender: tipos básicos de TypeScript.
