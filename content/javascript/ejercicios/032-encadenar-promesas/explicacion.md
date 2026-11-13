## Idea clave

Cuando un paso asíncrono necesita el resultado del anterior, los **encadenas**: esperas el primero con `await`, usas su valor en el segundo y devuelves el segundo. Una función `async` siempre devuelve una promesa, así que lo que hagas `return` se convierte en el valor final de esa promesa.

## Paso a paso

1. **Primera suma**: `await sumarLento(a, b)`. La función se pausa hasta que la promesa se cumple y te deja el número en `parcial`.
2. **Segunda suma**: `sumarLento(parcial, c)` usa el resultado anterior. Esta llamada solo puede hacerse después del paso 1.
3. **Devuelve la segunda promesa** con `return`. No hace falta `await` aquí: si una función `async` devuelve una promesa, su propia promesa "se engancha" a ella y se cumple con el mismo valor.

```js
export async function sumarTres(a, b, c) {
  const parcial = await sumarLento(a, b);
  return sumarLento(parcial, c);
}
```

## Por qué funciona

Línea de tiempo de `sumarTres(1, 2, 3)`:

| Momento | Qué pasa |
|---|---|
| t = 0 ms | Se llama a `sumarTres`. Como es `async`, devuelve **de inmediato** una promesa pendiente (llamémosla P). |
| t = 0 ms | Dentro, `sumarLento(1, 2)` programa un temporizador de 10 ms. `await` pausa `sumarTres`. |
| t = 10 ms | El temporizador llama a `resolver(3)`. La función se reanuda con `parcial = 3`. |
| t = 10 ms | `sumarLento(3, 3)` programa otro temporizador de 10 ms y se devuelve esa promesa. P queda esperando a esa promesa. |
| t = 20 ms | El segundo temporizador llama a `resolver(6)`. P se cumple con `6`. |

Por eso el test con temporizadores falsos comprueba que a los 10 ms todavía no hay total y a los 20 ms sí: las dos sumas van **en serie**.

Un detalle importante: `return sumarLento(...)` devuelve una promesa, pero quien llama a `sumarTres` no recibe "una promesa de una promesa". Las promesas se **aplanan**: si cumples una promesa con otra promesa, la de afuera adopta el resultado de la de adentro.

## Errores comunes

- **Olvidar el `await` en la primera llamada.** `const parcial = sumarLento(a, b)` guarda la promesa, no el número. Luego `a + b` termina siendo algo como `"[object Promise]3"`. Lo reconoces porque recibes un texto raro en vez de un número.
- **Sumar a mano: `return a + b + c`.** Da el número correcto, pero no usa `sumarLento` y se cumple al instante. Lo reconoces porque falla el test "tarda 20 ms": a los 10 ms ya hay total.
- **Olvidar el `return`.** La función `async` termina sin devolver nada y su promesa se cumple con `undefined`. Lo reconoces por "expected undefined to be 6".
- **Anidar `.then` sin devolver.** Escribir `sumarLento(a, b).then((p) => { sumarLento(p, c); })` con llaves y sin `return`: la cadena no espera a la segunda suma y el valor final es `undefined`.

## Otra forma de resolverlo

Con `.then`, sin `async/await`:

```js
export function sumarTres(a, b, c) {
  return sumarLento(a, b).then((parcial) => sumarLento(parcial, c));
}
```

Cada `.then` devuelve una promesa nueva. Si el callback del `.then` devuelve una promesa (aquí, la segunda `sumarLento`), la cadena espera a que esa promesa termine antes de seguir. Así se encadenan pasos sin anidar.

**¿Cuál conviene?** `async/await` se lee de arriba hacia abajo como código normal y es lo que se usa hoy en casi todos los proyectos. `.then` sigue siendo útil para cadenas cortas y aparece mucho en código existente, así que tienes que leer los dos. En una entrevista, usa `await` y menciona que también sabes hacerlo con `.then`.

## Cómo explicarlo en la entrevista

> "Las dos sumas dependen una de otra, así que van en serie. Con `await` espero la primera y guardo el resultado parcial; con ese valor hago la segunda llamada y la devuelvo. Como la función es `async`, siempre devuelve una promesa, y al devolver otra promesa la de afuera se cumple con el mismo valor. Tarda unos 20 ms en total porque cada llamada tarda 10."

## Conceptos

- **Función `async`**: siempre devuelve una promesa; lo que haces `return` es el valor con el que se cumple.
- **`await`**: pausa la función hasta que la promesa termine y te da su valor.
- **Encadenar promesas**: usar el resultado de una operación asíncrona para lanzar la siguiente.
- **`.then(callback)`**: registra qué hacer cuando la promesa se cumpla; devuelve una promesa nueva.
- **Aplanado de promesas**: si cumples una promesa con otra promesa, la primera adopta el resultado de la segunda.
- **En serie**: una operación empieza solo cuando termina la anterior.
