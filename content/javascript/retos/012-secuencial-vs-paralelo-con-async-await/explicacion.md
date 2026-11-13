## Idea clave

Lo que arranca el trabajo es **llamar a la tarea**; `await` solo espera. En secuencial llamas y esperas una por una, así que los tiempos se **suman**. En paralelo llamas a todas primero y esperas después con `Promise.all`, así que el tiempo total es el de la **más lenta**.

## Paso a paso

1. **`secuencial`**: crea `resultados = []`.
2. Recorre con `for...of`. En cada vuelta, `await tarea()` arranca la tarea y pausa la función hasta que termine.
3. Guarda el valor con `push` y sigue con la siguiente. Al final devuelve `resultados`.
4. **`paralelo`**: `tareas.map((tarea) => tarea())` llama a **todas** en el mismo instante y te da un arreglo de promesas ya en marcha.
5. `Promise.all(...)` espera a que todas se cumplan y te da los valores en el orden de las tareas.

```js
export async function secuencial(tareas) {
  const resultados = [];
  for (const tarea of tareas) {
    resultados.push(await tarea());
  }
  return resultados;
}

export async function paralelo(tareas) {
  return Promise.all(tareas.map((tarea) => tarea()));
}
```

## Por qué funciona

Línea de tiempo con dos tareas de 30 ms, `a` y `b`:

| Tiempo | `secuencial` | `paralelo` |
|---|---|---|
| 0 ms | arranca `a`, espera | arranca `a` **y** `b` |
| 30 ms | termina `a`; recién ahora arranca `b` | terminan las dos: se cumple con `["a", "b"]` |
| 60 ms | termina `b`: se cumple con `["a", "b"]` | |

En paralelo con tiempos distintos, `a` de 50 ms y `b` de 20 ms: `b` termina a los 20 ms pero `Promise.all` sigue esperando a `a`. A los 50 ms se cumple con `["a", "b"]`: el orden lo dan las tareas, no quién terminó primero.

¿Cuándo usar cada una? Si la segunda tarea **necesita** el resultado de la primera (por ejemplo, primero obtienes el id del usuario y luego sus pedidos), tiene que ser secuencial. Si son independientes (el perfil y las notificaciones), van en paralelo.

## Errores comunes

- **Usar `forEach` con `await` en `secuencial`.** `forEach` no espera a las funciones `async`: arranca todas a la vez y devuelve antes de que terminen. Lo reconoces porque recibes `[]` o porque `b` arranca antes de tiempo.
- **Escribir `paralelo` como `for` con `await` dentro.** Eso es secuencial: el test de "arranca todas de inmediato" ve que `b` no fue llamada.
- **Pasar las funciones a `Promise.all` sin llamarlas: `Promise.all(tareas)`.** `Promise.all` trata las funciones como valores normales y te devuelve las funciones mismas, no sus resultados.
- **Usar `push` en paralelo según van terminando.** Los resultados salen en orden de llegada: `["b", "a"]`.
- **Olvidar el `await` en `secuencial`: `resultados.push(tarea())`.** Guardas promesas en vez de valores, y además ya no es secuencial.

## Otra forma de resolverlo

`secuencial` con `reduce`, encadenando promesas sin `for` (así se hacía antes de `async/await`):

```js
export function secuencial(tareas) {
  return tareas.reduce(
    (cadena, tarea) => cadena.then((resultados) => tarea().then((valor) => [...resultados, valor])),
    Promise.resolve([]),
  );
}
```

Cada paso espera a la cadena anterior y recién entonces llama a la siguiente tarea. Funciona igual, pero el `for...of` con `await` es mucho más fácil de leer y de explicar. Es útil reconocer este patrón cuando lo veas en código antiguo.

Si tuvieras **muchas** tareas (por ejemplo, 500 peticiones), ni una cosa ni la otra: lo usual es paralelo **con límite**, de a 5 a la vez, para no saturar el servidor.

## Cómo explicarlo en la entrevista

> "Lo que arranca una petición es llamar a la función; el `await` solo espera. Si pongo un `await` detrás de otro, la segunda no empieza hasta que termina la primera y los tiempos se suman. Si las tareas son independientes, las arranco todas con `map` y espero con `Promise.all`: el tiempo total es el de la más lenta, y los resultados vuelven en el orden original. Si una depende del resultado de la otra, ahí sí van en secuencia, con `for...of` y `await`, nunca con `forEach`."

## Conceptos

- **`async/await`**: `await` pausa la función `async` hasta que la promesa se cumple.
- **Arrancar vs esperar**: llamar a la función inicia el trabajo; `await` solo espera su resultado.
- **`Promise.all`**: espera varias promesas que ya están en marcha y mantiene el orden.
- **`for...of` con `await`**: recorre esperando cada vuelta; `forEach` no espera.
- **Dependencia entre tareas**: si B necesita el resultado de A, deben ir en secuencia.
