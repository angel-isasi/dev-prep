## Idea clave

Una promesa empieza su trabajo **en el momento en que la creas**, no cuando la esperas. Para ir en paralelo arrancas todas las tareas de golpe con `map` y luego esperas el conjunto: `Promise.all` cuando necesitas todos los resultados (falla al primer error) y `Promise.allSettled` cuando te sirve lo que se pueda (nunca falla y te dice cómo terminó cada una).

## Paso a paso

1. **Arranca todas.** `tareas.map((tarea) => tarea())` llama a cada función en el acto. Ninguna espera a otra: Node lanza los tres temporizadores (o peticiones, o lecturas de disco) y sigue. Obtienes un arreglo de promesas pendientes.
2. **`cargarTodo`: espera con `Promise.all`.** Devuelve una promesa que:
   - se cumple con un arreglo de valores **en el orden de entrada**, no en el orden en que terminaron;
   - rechaza **apenas una rechaza**, con ese error.
3. **`cargarLoQueSePueda`: espera con `Promise.allSettled`.** Siempre se cumple, con un arreglo de objetos:
   - `{ status: "fulfilled", value }` para las que salieron bien;
   - `{ status: "rejected", reason }` para las que fallaron (`reason` es el error).
4. **Separa** recorriendo ese arreglo: los `value` a `exitos` y los `reason.message` a `fallos`.

```js
export async function cargarTodo(tareas) {
  const promesas = tareas.map((tarea) => tarea());
  return Promise.all(promesas);
}

export async function cargarLoQueSePueda(tareas) {
  const resultados = await Promise.allSettled(tareas.map((tarea) => tarea()));

  const exitos = [];
  const fallos = [];
  for (const r of resultados) {
    if (r.status === "fulfilled") exitos.push(r.value);
    else fallos.push(r.reason.message);
  }
  return { exitos, fallos };
}
```

## Por qué funciona

Recorrido del test "arranca todas las tareas" con `a` (30 ms), `b` (10 ms) y `c` (20 ms):

| Tiempo | Qué pasa | `registro` |
|---|---|---|
| 0 ms | `map` llama a `a`, `b` y `c` | `inicio a`, `inicio b`, `inicio c` |
| 10 ms | termina `b` | `+ fin b` |
| 20 ms | termina `c` | `+ fin c` |
| 30 ms | termina `a`; `Promise.all` se cumple | `+ fin a` |

Tiempo total: unos **30 ms** (el más lento). El resultado es `["a", "b", "c"]`, en el orden de las tareas, aunque terminaron `b`, `c`, `a`.

Compáralo con la versión en serie:

```js
const resultados = [];
for (const tarea of tareas) {
  resultados.push(await tarea()); // espera a cada una antes de arrancar la siguiente
}
```

| Tiempo | `registro` |
|---|---|
| 0 ms | `inicio a` |
| 30 ms | `fin a`, `inicio b` |
| 40 ms | `fin b`, `inicio c` |
| 60 ms | `fin c` |

Tarda **60 ms** (la suma) y el test detecta que `inicio b` aparece después de `fin a`.

## Errores comunes

- **`await` dentro de un `for`**: correcto pero en serie. Es el error más frecuente y el que más se pregunta en entrevistas: "¿cómo harías estas tres peticiones más rápido?".
- **Pasar las funciones a `Promise.all`** (`Promise.all(tareas)`): `Promise.all` trata los valores que no son promesas como ya cumplidos, así que te devuelve las **funciones** sin haberlas llamado.
- **`forEach` con `async`**: `tareas.forEach(async (t) => resultados.push(await t()))` no espera nada; la función termina antes de que lleguen los resultados y devuelves un arreglo vacío.
- **Usar `Promise.all` cuando te sirven resultados parciales**: un solo servicio caído tumba todo el panel.
- **Guardar `r.reason` en vez de `r.reason.message`** en `fallos`: guardas el objeto `Error`, y el test espera textos.
- **Pensar que `Promise.all` cancela las demás al fallar una**: las otras siguen corriendo; solo que su resultado se ignora.

## Otra forma de resolverlo

**Con `async/await` y desestructuración**, cuando sabes cuántas tareas son (lo más común en el día a día):

```js
const [usuario, pedidos, notificaciones] = await Promise.all([
  obtenerUsuario(id),
  obtenerPedidos(id),
  obtenerNotificaciones(id),
]);
```

Es lo mismo que `cargarTodo`, pero con nombres claros para cada resultado.

**`cargarLoQueSePueda` con `filter` y `map`:**

```js
const resultados = await Promise.allSettled(tareas.map((t) => t()));
return {
  exitos: resultados.filter((r) => r.status === "fulfilled").map((r) => r.value),
  fallos: resultados.filter((r) => r.status === "rejected").map((r) => r.reason.message),
};
```

Recorre el arreglo dos veces, pero se lee como una frase. Con pocas tareas da igual; usa la que te resulte más clara.

**¿Cuándo usar cada una?** `Promise.all`: los datos dependen unos de otros o no tiene sentido mostrar algo incompleto (crear un pedido y descontar stock). `Promise.allSettled`: los datos son independientes (un panel con widgets). Existen también `Promise.race` (gana la primera que termine, para ponerle un tiempo límite a algo) y `Promise.any` (la primera que se cumpla).

## Cómo explicarlo en la entrevista

> "Las promesas empiezan a trabajar cuando se crean, así que para ir en paralelo primero llamo a todas las tareas con map y después espero el conjunto. Con Promise.all obtengo los resultados en el orden original, y si una falla, falla todo con ese error; lo uso cuando necesito todos los datos. Con Promise.allSettled cada resultado viene con su status, y nunca rechaza; lo uso cuando me sirven resultados parciales, como en un panel donde un widget puede fallar sin tumbar al resto. El tiempo total es el de la tarea más lenta, en vez de la suma que tendría con await dentro de un for."

## Conceptos

- **Paralelo vs en serie**: en paralelo todas empiezan a la vez (tiempo = la más lenta); en serie una tras otra (tiempo = la suma).
- **Las promesas son "ansiosas"**: el trabajo arranca al crear la promesa, no al hacer `await`.
- **`Promise.all(promesas)`**: arreglo de valores en el orden de entrada; rechaza con el primer error.
- **`Promise.allSettled(promesas)`**: nunca rechaza; cada elemento es `{ status, value }` o `{ status, reason }`.
- **`Promise.race` y `Promise.any`**: la primera que termine, o la primera que se cumpla.
- **Función que devuelve una promesa**: pasar `() => tarea()` en vez de la promesa permite decidir **cuándo** empieza el trabajo.
- **`forEach` no espera promesas**: para esperar en un bucle usa `for...of` con `await`, o `map` + `Promise.all`.
