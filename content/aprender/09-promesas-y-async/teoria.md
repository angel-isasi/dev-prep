## En una frase

JavaScript hace una sola cosa a la vez, así que el trabajo lento (una petición, un temporizador) queda **pendiente** mientras el resto sigue; una **promesa** es el objeto que representa ese resultado que llegará después, y `async`/`await` es la forma cómoda de esperarlo.

## Lo esencial

### El event loop, simplificado

1. Se ejecuta todo el código **síncrono**, línea por línea.
2. Después, **todas** las microtareas: callbacks de `.then`, `.catch`, `.finally` y lo que sigue a un `await`.
3. Después, **una** macrotarea: un callback de `setTimeout`, un evento del DOM. Y se vuelve al paso 2.

```js
console.log("A");
setTimeout(() => console.log("B"), 0);
Promise.resolve().then(() => console.log("C"));
console.log("D");
// A, D, C, B
```

`setTimeout(fn, 0)` no significa "ahora": significa "cuando termine el código síncrono y no queden microtareas".

### Callbacks: de dónde venimos

```js
setTimeout(() => console.log("listo"), 1000);
```

Un callback es una función que le pasas a otra para que la llame cuando termine. Funciona, pero si cada paso depende del anterior terminas con callbacks dentro de callbacks (el "callback hell"), y cada uno maneja sus errores por separado. Las promesas resuelven eso.

### Una promesa y sus tres estados

| Estado | Significa |
|---|---|
| `pending` | todavía no termina |
| `fulfilled` | terminó bien y tiene un **valor** |
| `rejected` | falló y tiene un **motivo** (normalmente un `Error`) |

Una vez que se cumple o se rechaza, ya no cambia más.

```js
function obtenerUsuario(id) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (id === 1) resolve({ id, nombre: "Ana" });
      else reject(new Error("No existe"));
    }, 100);
  });
}
```

La función que le pasas a `new Promise` se ejecuta **de inmediato**; lo que se demora es el `setTimeout` de adentro.

### `then`, `catch` y `finally`

```js
obtenerUsuario(1)
  .then((usuario) => usuario.nombre)               // lo que devuelves pasa al siguiente then
  .then((nombre) => console.log(nombre))           // "Ana"
  .catch((error) => console.log(error.message))    // atrapa errores de cualquier paso anterior
  .finally(() => console.log("fin"));              // corre siempre, haya error o no
```

Cada `.then` devuelve una promesa **nueva**. Si dentro de un `.then` devuelves otra promesa, la cadena la espera antes de seguir.

### `async` / `await` con `try` / `catch`

```js
async function mostrarUsuario(id) {
  try {
    const usuario = await obtenerUsuario(id);   // pausa ESTA función, no el programa
    console.log(usuario.nombre);
  } catch (error) {
    console.log("Error:", error.message);       // si la promesa se rechazó
  } finally {
    console.log("fin");
  }
}

mostrarUsuario(1);    // "Ana", "fin"
mostrarUsuario(99);   // "Error: No existe", "fin"
```

- Una función `async` **siempre devuelve una promesa**: `return 5` se convierte en una promesa que se cumple con 5, y un `throw` en una promesa rechazada.
- `await` solo funciona dentro de una función `async` (o en el nivel superior de un módulo).

### En serie o en paralelo

```js
// En serie: unos 200 ms, porque la segunda espera a la primera
const ana = await obtenerUsuario(1);
const otra = await obtenerUsuario(1);

// En paralelo: unos 100 ms, porque las dos arrancan a la vez
const [u1, u2] = await Promise.all([obtenerUsuario(1), obtenerUsuario(1)]);
```

Usa la serie cuando un paso necesita el resultado del anterior; si son independientes, en paralelo.

### `Promise.all`, `allSettled`, `race` y `any`

| Método | Se cumple cuando | Se rechaza cuando | Uso típico |
|---|---|---|---|
| `Promise.all` | **todas** se cumplen: arreglo de valores en el orden original | apenas **una** falla | cargar varias cosas que necesitas todas |
| `Promise.allSettled` | **todas terminan**, bien o mal: `[{ status, value }]` o `[{ status, reason }]` | nunca | saber cuáles fallaron sin cortar nada |
| `Promise.race` | la **primera que termina** se cumplió | la **primera que termina** falló | ponerle un tiempo límite a algo |
| `Promise.any` | la **primera que se cumple** | **todas** fallan: `AggregateError` | servidores de respaldo |

```js
const limite = (ms) =>
  new Promise((_, reject) => setTimeout(() => reject(new Error("Tiempo agotado")), ms));

await Promise.race([obtenerUsuario(1), limite(3000)]);   // falla si tarda más de 3 s
```

## Errores típicos

**1. Olvidar el `await`.** Trabajas con la promesa, no con su valor.

```js
async function nombreDe(id) {
  const usuario = obtenerUsuario(id);   // falta await
  return usuario.nombre;                // undefined: usuario es una Promise
}
```

**2. `forEach` con una función `async`.** `forEach` no espera promesas: las lanza y sigue.

```js
async function guardarTodos(ids) {
  ids.forEach(async (id) => {
    await guardar(id);
  });
  console.log("terminé");   // se imprime ANTES de que se guarde nada
}
```

En serie, usa `for (const id of ids) { await guardar(id); }`. En paralelo, `await Promise.all(ids.map((id) => guardar(id)))`.

**3. Olvidar el `return` dentro de un `.then`.** El siguiente `.then` recibe `undefined` y no espera nada.

```js
obtenerUsuario(1)
  .then((u) => {
    obtenerPedidos(u.id);              // sin return
  })
  .then((pedidos) => console.log(pedidos));   // undefined
```

**4. `try`/`catch` sin `await`.** El rechazo llega después de que el `try` ya terminó, así que el `catch` no lo ve.

```js
async function cargar() {
  try {
    obtenerUsuario(99);                // sin await
  } catch (error) {
    console.log("nunca llega aquí");
  }
}
```

**5. No manejar el rechazo.** Una promesa rechazada sin `.catch` ni `try`/`catch` muestra `Uncaught (in promise)` en el navegador, y en Node puede terminar el proceso.

**6. Esperar en serie cosas independientes.** Funciona, pero tarda la suma de todos los tiempos. Si no dependen entre sí, usa `Promise.all`.

## Chuleta

- Orden: código síncrono, luego **todas** las microtareas (`then`, después de `await`), luego **una** macrotarea (`setTimeout`).
- Una promesa está `pending`, `fulfilled` o `rejected`, y no cambia después de resolverse.
- El executor de `new Promise` corre de inmediato.
- `.then` devuelve una promesa nueva; lo que retornas pasa al siguiente. Un `.catch` al final atrapa todo.
- `async` siempre devuelve una promesa; `await` pausa solo esa función.
- Errores con `await`: `try`/`catch`. Sin `await`, el `catch` no se entera.
- `forEach` no espera: usa `for...of` (serie) o `Promise.all` + `map` (paralelo).
- `all` falla con una; `allSettled` nunca falla; `race` es la primera en terminar; `any` es la primera en cumplirse.

## En la entrevista

**¿Qué es el event loop?**
Es el mecanismo que permite a JavaScript, que tiene un solo hilo, manejar tareas asíncronas. Primero ejecuta el código síncrono; cuando la pila queda vacía, ejecuta todas las microtareas (promesas) y después toma una macrotarea (como un `setTimeout` o un evento), y repite. Por eso una promesa resuelta se ejecuta antes que un `setTimeout` de 0 ms.

**¿Qué es una promesa?**
Un objeto que representa un valor que todavía no está disponible. Empieza en `pending` y termina `fulfilled`, con un valor, o `rejected`, con un error. Con `.then` reaccionas al valor y con `.catch` al error, y se pueden encadenar.

**¿`async`/`await` reemplaza a las promesas?**
No: es una forma más legible de escribir código con promesas. Una función `async` devuelve una promesa, y `await` espera a que una promesa se resuelva. Los errores se manejan con `try`/`catch` en vez de `.catch`.

**¿Cuál es la diferencia entre `Promise.all` y `Promise.allSettled`?**
`Promise.all` se rechaza apenas una promesa falla, y si todas salen bien devuelve los valores en orden. `Promise.allSettled` espera a que todas terminen y devuelve el estado de cada una, sin rechazarse nunca. Uso `all` cuando necesito todo para continuar, y `allSettled` cuando quiero mostrar lo que sí cargó.

**Tienes que hacer tres peticiones, ¿cómo las haces?**
Si son independientes, en paralelo con `Promise.all`, para que el tiempo total sea el de la más lenta y no la suma. Si una necesita el resultado de la otra, en serie con `await`. Y siempre con manejo de errores.
