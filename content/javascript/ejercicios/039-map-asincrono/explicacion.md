## Idea clave

`lista.map(fnAsync)` ya lanza todas las llamadas a la vez, pero te devuelve un arreglo de **promesas**, no de valores. `Promise.all` toma ese arreglo y lo convierte en **una sola promesa** que se cumple con todos los valores, en el mismo orden.

## Paso a paso

1. **Aplica `fn` a cada elemento** con `lista.map(fn)`. Cada llamada empieza en ese instante y devuelve una promesa pendiente. Como `map` le pasa `(elemento, indice, arreglo)`, tu `fn` recibe también el índice sin que hagas nada.
2. **Junta las promesas** con `Promise.all(promesas)`. Devuelve una promesa que espera a que **todas** se cumplan.
3. **Devuelve esa promesa**. Quien haga `await mapAsync(...)` recibirá el arreglo de valores.

```js
export function mapAsync(lista, fn) {
  return Promise.all(lista.map(fn));
}
```

## Por qué funciona

Línea de tiempo con `mapAsync([1, 2, 3], lento)`, donde `lento(1)` tarda 30 ms, `lento(2)` 20 ms y `lento(3)` 10 ms:

| Momento | Qué pasa | Arreglo de `Promise.all` |
|---|---|---|
| t = 0 ms | `map` llama a `lento(1)`, `lento(2)` y `lento(3)`, una tras otra y **sin esperar**. Las tres corren a la vez. | `[pendiente, pendiente, pendiente]` |
| t = 10 ms | Termina `lento(3)`. `Promise.all` guarda su valor en la **posición 2**. | `[pendiente, pendiente, "listo 3"]` |
| t = 20 ms | Termina `lento(2)`: posición 1. | `[pendiente, "listo 2", "listo 3"]` |
| t = 30 ms | Termina `lento(1)`: posición 0. Ya están todas: `Promise.all` se cumple. | `["listo 1", "listo 2", "listo 3"]` |

Dos cosas que se ven en la tabla:

- **El orden se respeta** porque `Promise.all` guarda cada resultado en la posición de su promesa, no en el orden de llegada.
- **El tiempo total es el de la más lenta** (30 ms), no la suma (60 ms), porque corren en paralelo.

Si una se rechaza, `Promise.all` se rechaza **de inmediato** con ese error, sin esperar a las demás (que siguen corriendo, pero sus resultados se ignoran).

## Errores comunes

- **Devolver `lista.map(fn)` sin `Promise.all`.** Recibes `[Promise, Promise, Promise]`. Lo reconoces porque el test dice que esperaba `[2, 4, 6]` y recibió un arreglo de promesas (`Promise {}`).
- **Hacer `await` dentro del callback de `map`: `lista.map(async (x) => await fn(x))`.** No cambia nada: el callback es `async`, así que igual devuelve una promesa. El `await` de adentro no hace que `map` espere.
- **Usar `forEach` y `push`.** `forEach` no espera los callbacks `async`, así que devuelves un arreglo vacío; y si lo arreglas esperando aparte, el `push` deja los resultados en orden de llegada (`["listo 3", "listo 2", "listo 1"]`).
- **Hacerlo en serie con `for...of` + `await`.** El resultado es correcto, pero tarda la suma de todos los tiempos. Lo reconoces porque el test de paralelo dice "expected 1 to be 4": nunca hubo más de una corriendo.
- **Esperar que `Promise.all` cancele las demás cuando una falla.** No las cancela: solo deja de esperarlas. Si necesitas todos los resultados aunque algunos fallen, usa `Promise.allSettled`.

## Otra forma de resolverlo

Con `async/await`, más explícito:

```js
export async function mapAsync(lista, fn) {
  const promesas = lista.map((elemento, indice) => fn(elemento, indice));
  const resultados = await Promise.all(promesas);
  return resultados;
}
```

Es lo mismo en tres líneas. Pasar `(elemento, indice)` a mano en vez de `fn` directo tiene una ventaja: `map` también le pasa el arreglo completo como tercer argumento, y algunas funciones se portan raro si reciben argumentos que no esperan. Así controlas exactamente qué recibe `fn`.

Si quieres que no falle todo por un solo error, usa `Promise.allSettled`, que espera a todas y te dice cuál se cumplió y cuál no:

```js
const resultados = await Promise.allSettled(lista.map(fn));
// [{ status: "fulfilled", value: 2 }, { status: "rejected", reason: Error }, ...]
```

**¿Cuál conviene?** La versión de una línea es la más usada y la más clara para quien ya conoce `Promise.all`. La de tres líneas es mejor para explicarla en una entrevista paso a paso. Y si la lista es muy grande (cientos de llamadas a una API), ninguna de las dos: usa un límite de concurrencia como en el ejercicio "En paralelo con límite".

## Cómo explicarlo en la entrevista

> "Si hago `map` con una función `async` obtengo un arreglo de promesas, no de valores, aunque todas las llamadas ya empezaron en paralelo. Así que se lo paso a `Promise.all`, que espera a todas y me devuelve los valores en el mismo orden de la lista, sin importar cuál terminó primero. El tiempo total es el de la más lenta. Si alguna falla, `Promise.all` rechaza con ese error; si quisiera todos los resultados igual, usaría `Promise.allSettled`."

## Conceptos

- **`map` con función `async`**: devuelve un arreglo de promesas; las llamadas empiezan todas a la vez.
- **`Promise.all(promesas)`**: una promesa que se cumple con todos los valores en orden, o se rechaza con el primer error.
- **`Promise.allSettled(promesas)`**: espera a todas y devuelve el estado de cada una, sin rechazar.
- **En paralelo**: el tiempo total es el de la operación más lenta.
- **Orden de resultados**: `Promise.all` respeta el orden del arreglo de entrada, no el orden de llegada.
- **Argumentos de `map`**: el callback recibe `(elemento, indice, arreglo)`.
