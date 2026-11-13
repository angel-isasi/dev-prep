Escribe la función `intentarEnOrden(fuentes)`. Recibe un arreglo de **fuentes**: funciones asíncronas sin argumentos (por ejemplo, distintos servidores que tienen el mismo dato). Pruébalas **una por una, en orden**, y devuelve el resultado de la **primera que funcione**. Si todas fallan, rechaza con el error de la última.

## Reglas

- Se prueban en orden y de a una: la segunda solo se llama si la primera falló.
- Apenas una fuente funciona, devuelves su resultado y **no llamas** a las que siguen.
- "Funcionar" es que su promesa se cumpla (aunque sea con `null` o `0`); "fallar" es que se rechace.
- Si todas fallan, la promesa de `intentarEnOrden` se rechaza con el error de la **última** fuente.
- Si el arreglo está vacío, se rechaza con `new Error("No hay fuentes")`.

## Ejemplos

```js
const caido = async () => { throw new Error("caído"); };
const respaldo = async () => "respaldo";
const otra = async () => "nunca";

await intentarEnOrden([caido, respaldo, otra]);   // "respaldo" (otra no se llama)
await intentarEnOrden([respaldo, caido]);         // "respaldo" (caido no se llama)

await intentarEnOrden([caido]);                   // lanza Error("caído")
await intentarEnOrden([]);                        // lanza Error("No hay fuentes")
```

## Por qué importa

Las apps reales tienen planes B: si el servidor principal no responde, usan un espejo; si la API falla, leen la caché. Este ejercicio te enseña la regla más importante del manejo de errores asíncronos: un `try/catch` solo atrapa el rechazo de una promesa si haces `await` **dentro** del `try`.
