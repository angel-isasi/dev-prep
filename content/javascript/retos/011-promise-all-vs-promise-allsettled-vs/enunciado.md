JavaScript trae cuatro formas de combinar varias promesas: `Promise.all`, `Promise.allSettled`, `Promise.race` y `Promise.any`. Escribe **cuatro funciones**, cada una con la herramienta que corresponde. Todas reciben un arreglo de promesas y devuelven una promesa.

## Reglas

- `todasONada(promesas)`: se cumple con el arreglo de **todos** los valores. Si **una** falla, se rechaza con ese error.
- `resumenDeEstados(promesas)`: espera a que **todas** terminen, salgan bien o mal, y se cumple con un arreglo de estados: `"fulfilled"` (cumplida) o `"rejected"` (rechazada), en el orden original. **Nunca** se rechaza.
- `primeraEnTerminar(promesas)`: se queda con la **primera que termine**, bien o mal. Si la primera en terminar falla, se rechaza con ese error.
- `primeraExitosa(promesas)`: se cumple con la **primera que salga bien**, ignorando las que fallan. Solo se rechaza si **todas** fallan.
- Cada una se resuelve con una sola línea si eliges bien la herramienta.

## Ejemplos

```js
const ok = (v, ms) => new Promise((r) => setTimeout(() => r(v), ms));
const ko = (m, ms) => new Promise((_, rej) => setTimeout(() => rej(new Error(m)), ms));

await todasONada([ok("a", 5), ok("b", 1)]);              // ["a", "b"]
await todasONada([ok("a", 5), ko("b", 1)]);              // rechaza con "b"

await resumenDeEstados([ok("a", 5), ko("b", 1)]);        // ["fulfilled", "rejected"]

await primeraEnTerminar([ok("lenta", 30), ok("rápida", 5)]);   // "rápida"
await primeraEnTerminar([ko("falló", 1), ok("lenta", 30)]);    // rechaza con "falló"

await primeraExitosa([ko("x", 1), ok("primera ok", 10)]);      // "primera ok"
await primeraExitosa([ko("x", 1), ko("y", 2)]);                // rechaza (todas fallaron)
```

## Por qué importa

"¿Qué diferencia hay entre `Promise.all` y `Promise.allSettled`?" es una pregunta muy común. En el trabajo eliges entre ellas a diario: `all` cuando necesitas todos los datos para mostrar la pantalla, `allSettled` cuando cada parte es independiente, `race` para poner un tiempo límite y `any` para usar el primer servidor que responda.
