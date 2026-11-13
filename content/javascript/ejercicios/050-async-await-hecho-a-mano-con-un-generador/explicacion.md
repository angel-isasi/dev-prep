## Idea clave

Un generador se pausa en cada `yield` y se reanuda con `next(valor)`, y ese `valor` pasa a ser lo que "devuelve" el `yield`. `ejecutar` aprovecha eso: toma la promesa que salió del `yield`, espera a que se resuelva con `.then`, y le devuelve el resultado al generador con `next(resultado)`. Repite hasta que el generador termina. Eso es exactamente `await`: pausar, esperar la promesa y continuar con su resultado.

## Paso a paso

1. **Devuelve una promesa nueva**: `return new Promise((resolver, rechazar) => { ... })`. Quien llama a `ejecutar` podrá hacer `await` sobre ella.
2. **Crea el generador**: `const generador = generadorFn()`. Todavía no corre nada; está pausado al inicio.
3. **Define `avanzar(valorAnterior)`**, la función que da un paso:
   - Llama `generador.next(valorAnterior)` dentro de un `try`. Esto hace correr el generador hasta el próximo `yield` (o hasta el final). Si el código del generador lanza un error, lo atrapas y haces `rechazar(error)`.
   - Si `paso.done` es `true`, el generador llegó a su `return`: `resolver(paso.value)`.
   - Si no, `paso.value` es lo que se puso en el `yield`. Lo pasas por `Promise.resolve(...)` (así `yield 5` también funciona) y le enganchas `.then(avanzar, rechazar)`: cuando la promesa se resuelva, se llama `avanzar(resultado)` y se da el siguiente paso; si se rechaza, se rechaza todo.
4. **Arranca con `avanzar()`**. El primer `next()` no lleva valor porque todavía no hay ningún `yield` esperando respuesta.

```js
export function ejecutar(generadorFn) {
  return new Promise((resolver, rechazar) => {
    const generador = generadorFn();

    function avanzar(valorAnterior) {
      let paso;
      try {
        paso = generador.next(valorAnterior);
      } catch (error) {
        rechazar(error); // el generador lanzó un error
        return;
      }

      if (paso.done) {
        resolver(paso.value); // llegó al return
        return;
      }

      // Espera la promesa del yield y vuelve a avanzar con su resultado
      Promise.resolve(paso.value).then(avanzar, rechazar);
    }

    avanzar();
  });
}
```

## Por qué funciona

Recorrido con el ejemplo:

```js
ejecutar(function* () {
  const a = yield pedir(10);
  const b = yield pedir(a * 2);
  return a + b;
});
```

| Paso | Llamada | Qué corre dentro del generador | `paso` que devuelve `next` | Qué hace `ejecutar` |
|---|---|---|---|---|
| 1 | `avanzar()` → `next(undefined)` | corre hasta el primer `yield`, crea `pedir(10)` y se pausa | `{ value: <promesa de 10>, done: false }` | engancha `.then(avanzar)` y espera 5 ms |
| 2 | `avanzar(10)` → `next(10)` | el primer `yield` "devuelve" `10`, así que `a = 10`; corre hasta el segundo `yield` con `pedir(20)` | `{ value: <promesa de 20>, done: false }` | espera otros 5 ms |
| 3 | `avanzar(20)` → `next(20)` | `b = 20`; llega a `return 10 + 20` | `{ value: 30, done: true }` | `resolver(30)` |

La clave está en el paso 2: el valor que le pasas a `next(10)` **es el resultado del `yield` donde el generador estaba pausado**. Por eso `a` termina valiendo `10` y no una promesa.

Fíjate en que `avanzar` no se llama a sí misma directamente: se la pasas a `.then`, y es la promesa la que la llama cuando se resuelve. Por eso los pasos esperan uno al otro y salen en orden.

Con un rechazo: `yield Promise.reject(new Error("falló"))` da un `paso.value` que es una promesa rechazada; `.then(avanzar, rechazar)` llama al segundo argumento, `rechazar(error)`, y la promesa de `ejecutar` se rechaza con `"falló"`. Si el error se lanza **dentro** del generador (`throw`), sale por `generador.next(...)`, y el `try/catch` lo convierte en `rechazar(error)`.

## Errores comunes

- **No devolver una promesa.** Si `ejecutar` no hace `return new Promise(...)`, el `await` recibe `undefined` al instante. Lo reconoces porque el test dice "expected undefined to be 30".
- **Pasarle al generador la promesa en vez de su resultado:** `generador.next(paso.value)` directamente. Entonces `a` y `b` son promesas, y `a + b` las convierte a texto: el total sale `"[object Promise][object Promise]"`. Hay que esperar con `.then` y pasar lo que llega.
- **Hacer un `while (!paso.done)` sin esperar.** El bucle corre todo de golpe sin que ninguna promesa se resuelva. No se puede "esperar" en un bucle normal sin `await`; por eso se usa la función `avanzar` que se llama desde `.then`.
- **Olvidar el segundo argumento de `.then` (`rechazar`).** Si una promesa del `yield` falla, nadie se entera: la promesa de `ejecutar` se queda pendiente para siempre y el test termina por tiempo (timeout).
- **Olvidar el `return` después de `resolver` o `rechazar`.** El código sigue y, por ejemplo, después de un error en `next` intenta leer `paso.done` con `paso` en `undefined`: "Cannot read properties of undefined (reading 'done')".

## Otra forma de resolverlo

La versión de arriba, cuando una promesa falla, rechaza todo directamente. El `await` real hace algo mejor: **lanza el error dentro de la función**, en la línea del `await`, para que puedas atraparlo con `try/catch`. Con un generador eso se logra con `generador.throw(error)`:

```js
export function ejecutar(generadorFn) {
  return new Promise((resolver, rechazar) => {
    const generador = generadorFn();

    function paso(reanudar) {
      let resultado;
      try {
        resultado = reanudar(); // next(valor) o throw(error)
      } catch (error) {
        rechazar(error);
        return;
      }
      if (resultado.done) {
        resolver(resultado.value);
        return;
      }
      Promise.resolve(resultado.value).then(
        (valor) => paso(() => generador.next(valor)),
        (error) => paso(() => generador.throw(error)),
      );
    }

    paso(() => generador.next());
  });
}
```

Con esta versión, este código funciona igual que con `async`/`await`:

```js
await ejecutar(function* () {
  try {
    yield Promise.reject(new Error("falló"));
  } catch (error) {
    return "lo manejé"; // la promesa de ejecutar se resuelve con "lo manejé"
  }
});
```

Y, por supuesto, la forma moderna, que es la que usarás en tu código del día a día:

```js
async function calcular() {
  const a = await pedir(10);
  const b = await pedir(a * 2);
  return a + b;
}
```

**¿Cuál conviene?** En proyectos reales, siempre `async`/`await`. La primera versión de `ejecutar` es la más clara para explicar la idea en una entrevista. La versión con `generador.throw` es la fiel al comportamiento real; mencionarla muestra que sabes por qué un `try/catch` alrededor de un `await` atrapa los rechazos.

## Cómo explicarlo en la entrevista

> "Un generador se pausa en cada `yield` y lo reanudo con `next`, y el valor que le paso a `next` es lo que devuelve ese `yield`. Entonces `ejecutar` crea una promesa y una función `avanzar`: llama a `next`, si el generador terminó resuelvo con el valor final, y si no, tomo lo que salió del `yield`, lo convierto en promesa con `Promise.resolve` y en su `.then` vuelvo a llamar a `avanzar` con el resultado. Los errores, tanto los de las promesas como los que lanza el generador, rechazan la promesa. Es básicamente cómo funciona `await` por dentro: pausar, esperar la promesa y continuar con su valor."

## Conceptos

- **`generador.next(valor)`**: reanuda el generador; `valor` se convierte en el resultado del `yield` donde estaba pausado.
- **`generador.throw(error)`**: reanuda el generador lanzando `error` en la línea del `yield`.
- **`new Promise((resolver, rechazar) => ...)`**: crea una promesa que tú decides cuándo cumplir o rechazar.
- **`Promise.resolve(x)`**: si `x` ya es promesa la devuelve tal cual; si no, crea una promesa resuelta con `x`.
- **`.then(siCumple, siFalla)`**: registra qué hacer cuando la promesa se resuelve o se rechaza.
- **Recursión asíncrona**: una función que se vuelve a llamar desde un `.then`, en lugar de un bucle, para encadenar pasos que esperan.
- **`async`/`await`**: sintaxis que hace por ti lo mismo que `ejecutar`: pausar la función en cada `await` y continuar con el resultado.
