## En una frase

Node ejecuta tu JavaScript en **un solo hilo**, pero no se queda esperando al disco o a la red: deja esas tareas encargadas y el **event loop** ejecuta tu código de respuesta cuando terminan.

## Lo esencial

### El event loop, explicado simple

Piensa en un mesero en una pollería: toma el pedido de la mesa 1, lo deja en cocina y **no se queda parado esperando**; va a la mesa 2. Cuando la cocina avisa "pedido listo", lo lleva. Un solo mesero atiende muchas mesas porque no espera sin hacer nada.

- El mesero es el **hilo** que corre tu JavaScript (solo hay uno).
- La cocina es el sistema operativo: lee archivos, espera respuestas de red, cuenta el tiempo de los timers.
- El **event loop** es el ciclo: "¿terminó algo? ejecuto su callback; ¿algo más? lo ejecuto...".

El orden de ejecución, simplificado:

1. Todo el código **sincrónico** de principio a fin.
2. Las **microtareas**: callbacks de promesas (`.then`, lo que sigue a un `await`).
3. Las **tareas**: timers (`setTimeout`), lecturas de archivos terminadas, peticiones que llegaron.

```js
console.log("1");
setTimeout(() => console.log("timeout"), 0);
Promise.resolve().then(() => console.log("promesa"));
console.log("2");
// 1, 2, promesa, timeout
```

Por eso un bucle sincrónico pesado (un `while` de varios segundos) **congela todo**: el mesero no puede ir a ninguna otra mesa.

### async/await en Node

Igual que en el navegador. `async` hace que la función devuelva una promesa; `await` pausa **esa función** (no todo Node) hasta que la promesa se resuelva.

```js
import { readFile } from "node:fs/promises";

async function contarLineas(ruta) {
  const texto = await readFile(ruta, "utf8");
  return texto.split("\n").length;
}

const total = await contarLineas("notas.txt"); // en ESM puedes usar await en el nivel superior
```

Los errores se atrapan con `try/catch` alrededor del `await`. Una promesa rechazada que nadie atrapa **termina el proceso** de Node con un error.

### Esperar varias cosas a la vez

```js
// En serie: una después de otra (la suma de los tiempos)
const a = await readFile("a.txt", "utf8");
const b = await readFile("b.txt", "utf8");

// En paralelo: arrancan juntas (el tiempo de la más lenta)
const [a2, b2] = await Promise.all([
  readFile("a.txt", "utf8"),
  readFile("b.txt", "utf8"),
]);
```

| | Si todas salen bien | Si una falla |
|---|---|---|
| `Promise.all` | Array de resultados, en el mismo orden | Se rechaza con el primer error |
| `Promise.allSettled` | Array de `{ status, value }` | Nunca se rechaza: esa queda `{ status: "rejected", reason }` |
| `Promise.race` | El primero que termine (bien o mal) | |
| `Promise.any` | El primero que salga bien | Falla solo si fallan todas |

```js
const resultados = await Promise.allSettled([leerA(), leerB()]);
const buenos = resultados.filter((r) => r.status === "fulfilled").map((r) => r.value);
```

Usa `all` cuando necesitas todo o nada, y `allSettled` cuando quieres aprovechar lo que salió bien.

### Timers

```js
const id = setTimeout(() => console.log("una vez, en 1 s"), 1000);
clearTimeout(id); // lo cancela

const intervalo = setInterval(() => console.log("cada 2 s"), 2000);
clearInterval(intervalo);

// Versión con promesas: esperar sin callbacks
import { setTimeout as esperar } from "node:timers/promises";
await esperar(500); // pausa esta función 500 ms
```

`setTimeout(fn, 1000)` significa "**no antes** de 1 segundo", no "exactamente a 1 segundo": si el hilo está ocupado, espera.

### EventEmitter: avisar que algo pasó

Muchas piezas de Node (servidores, streams) avisan cosas con **eventos**, como `addEventListener` en el DOM. Tú puedes crear los tuyos:

```js
import { EventEmitter } from "node:events";

const tienda = new EventEmitter();

tienda.on("venta", (producto, monto) => {        // escuchar (cada vez)
  console.log(`Vendido ${producto} por S/ ${monto}`);
});
tienda.once("abierto", () => console.log("¡Abrimos!")); // escuchar solo la primera vez

tienda.emit("abierto");                // ¡Abrimos!
tienda.emit("abierto");                // (nada, once ya se quitó)
tienda.emit("venta", "Inca Kola", 5);  // Vendido Inca Kola por S/ 5
```

- `emit` llama a los oyentes **sincrónicamente**, en el orden en que se registraron, y devuelve `true` si había alguno.
- `off(evento, fn)` quita un oyente (necesitas la misma referencia de la función).
- Un `emit("error")` sin oyente de `"error"` lanza el error y puede tumbar el programa.

## Errores típicos

**1. `await` dentro de `forEach`**

```js
archivos.forEach(async (a) => { await procesar(a); });
console.log("listo"); // se imprime ANTES de procesar
```
`forEach` no espera promesas. Usa `for...of` con `await` (en serie) o `await Promise.all(archivos.map(procesar))` (en paralelo).

**2. Poner en serie lo que podría ir en paralelo**

Tres `await` seguidos e independientes tardan la suma de los tres. Si no dependen entre sí, usa `Promise.all`.

**3. Creer que `setTimeout(fn, 0)` es inmediato**

Se ejecuta después de todo el código sincrónico y de las promesas pendientes.

**4. Olvidar el `catch`**

```js
leerConfig(); // si se rechaza: UnhandledPromiseRejection y Node se cierra
```
Pon `await` dentro de un `try/catch` o agrega `.catch(...)`.

**5. Quitar un oyente con otra función**

```js
emisor.on("x", () => hacer());
emisor.off("x", () => hacer()); // no quita nada: es otra función
```
Guarda la función en una constante y usa esa misma en `on` y `off`.

## Chuleta

- Orden: sincrónico → promesas (microtareas) → timers y E/S (tareas).
- Un solo hilo: no bloquees con bucles pesados ni funciones `Sync` en un servidor.
- `await` pausa solo la función `async` donde está.
- `Promise.all`: paralelo, todo o nada. `allSettled`: paralelo, nunca falla, revisa `status`.
- `for...of` + `await` = en serie. `Promise.all(lista.map(fn))` = en paralelo.
- `setTimeout` / `clearTimeout`, `setInterval` / `clearInterval`, `await esperar(ms)` de `node:timers/promises`.
- `EventEmitter`: `on`, `once`, `off`, `emit(evento, ...datos)`.

## En la entrevista

**¿Qué es el event loop?**
Es el mecanismo que permite que Node, con un solo hilo, atienda muchas tareas: las operaciones lentas (disco, red, timers) se delegan al sistema y, cuando terminan, el event loop ejecuta sus callbacks. Primero corre el código sincrónico, luego las microtareas (promesas) y luego las tareas (timers, E/S).

**Si Node tiene un solo hilo, ¿cómo atiende a miles de usuarios?**
Porque casi todo el trabajo de un servidor es esperar (base de datos, archivos, red) y esa espera no ocupa el hilo. Mientras una petición espera, el hilo atiende otras. Lo que sí lo frena es el cálculo pesado sincrónico.

**¿Qué diferencia hay entre `Promise.all` y `Promise.allSettled`?**
Las dos esperan varias promesas en paralelo. `all` se rechaza apenas una falla; `allSettled` siempre espera a todas y te devuelve el estado de cada una, así puedes usar las que salieron bien.

**¿Qué es un EventEmitter?**
Es una clase de Node para el patrón de eventos: un objeto emite eventos con `emit` y otras partes del código los escuchan con `on`. Es la misma idea que `addEventListener` en el navegador, y la usan servidores y streams de Node.
