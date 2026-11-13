Escribe y exporta la función `ejecutar(generadorFn)`. Recibe una **función generadora** que hace `yield` de promesas, la ejecuta paso a paso y le devuelve el resultado de cada promesa. Es, en pequeño, lo que hace JavaScript cuando usas `async`/`await`: el `yield` hace el papel de `await`.

## Reglas

- `ejecutar` devuelve **una promesa**.
- Llama a `generadorFn()` para obtener el generador y lo hace avanzar con `next()`.
- Cada vez que el generador hace `yield` de una promesa, `ejecutar` espera a que se resuelva y le **devuelve el resultado** al generador con `next(resultado)`. Así, dentro del generador, `const a = yield pedir(10)` deja `10` en `a`.
- Si se hace `yield` de un valor que no es promesa (por ejemplo `yield 5`), se trata como una promesa ya resuelta con ese valor.
- Cuando el generador termina con `return valor`, la promesa de `ejecutar` se resuelve con ese `valor`.
- Si una promesa del `yield` se rechaza, o si el generador lanza un error, la promesa de `ejecutar` se rechaza con ese error.

## Ejemplos

```js
const pedir = (v) => new Promise((resolver) => setTimeout(() => resolver(v), 5));

const total = await ejecutar(function* () {
  const a = yield pedir(10);     // a = 10
  const b = yield pedir(a * 2);  // b = 20
  return a + b;
});
total; // 30

// Es lo mismo que escribir:
const total2 = await (async () => {
  const a = await pedir(10);
  const b = await pedir(a * 2);
  return a + b;
})();

await ejecutar(function* () {
  yield Promise.reject(new Error("falló"));
}); // ❌ la promesa se rechaza con Error("falló")
```

## Por qué importa

Antes de que existiera `async`/`await`, librerías como `co` hacían exactamente esto, y los compiladores (Babel, TypeScript) todavía lo usan para que `async` funcione en entornos antiguos. Si entiendes este ejercicio, entiendes de verdad qué pasa cuando escribes `await`: la función se **pausa**, espera la promesa y **continúa** con el resultado. Es una pregunta de nivel avanzado para un junior, y te hace destacar.
