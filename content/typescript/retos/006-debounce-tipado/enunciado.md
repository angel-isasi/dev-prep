Escribe `debounce(fn, ms)`: devuelve una versión de `fn` que **espera** a que pasen `ms` milisegundos **sin nuevas llamadas** antes de ejecutarse. Si la llamas otra vez antes de tiempo, la espera se reinicia. Así, en un buscador, en vez de pedir a la API con cada tecla, pides una sola vez cuando el usuario deja de escribir.

El reto de TypeScript: la función que devuelves debe aceptar **exactamente los mismos argumentos** que `fn`, con sus tipos. Si `fn` recibe `(x: number, y: number)`, llamar a la versión con espera con `("10", 20)` debe dar error de tipos.

## Reglas

- `debounce<F extends (...args: any[]) => void>(fn: F, ms: number)`.
- La función devuelta:
  - Recibe los mismos parámetros que `fn`. Usa el utility type **`Parameters<F>`**.
  - Cada vez que la llamas, cancela la espera anterior y empieza una nueva de `ms`.
  - Cuando la espera termina, llama a `fn` **una vez** con los argumentos de la **última** llamada.
  - Tiene un método `cancelar()` que descarta la llamada pendiente, si la hay.
- El tipo de retorno es `Debounced<F>`, que ya viene a medias en el archivo de inicio: completa la parte de los argumentos.

## Ejemplos

```ts
const buscar = (texto: string) => console.log("Buscando", texto);
const buscarConEspera = debounce(buscar, 300);

buscarConEspera("r");     // t = 0 ms
buscarConEspera("re");    // t = 100 ms: reinicia la espera
buscarConEspera("rea");   // t = 200 ms: reinicia la espera
// t = 500 ms: imprime "Buscando rea" (una sola vez)

buscarConEspera("vue");
buscarConEspera.cancelar();   // no imprime nada

const mover = (x: number, y: number) => {};
const moverConEspera = debounce(mover, 50);
moverConEspera(10, 20);     // bien
moverConEspera("10", 20);   // Error de TypeScript: x es number
```

## Cómo se prueba

Los tests no esperan de verdad: usan **relojes falsos** (`vi.useFakeTimers()`), que reemplazan a `setTimeout` por uno controlado. `vi.advanceTimersByTime(300)` hace "como si" pasaran 300 ms al instante. Es la forma estándar de testear código con temporizadores.

## Por qué importa

`debounce` es de las preguntas de código más repetidas en entrevistas frontend, junto con `throttle`. Con TypeScript le suman una capa: "¿cómo haces que conserve los tipos?". La respuesta (`Parameters<F>` y un genérico) demuestra que sabes usar los utility types sobre funciones, no solo sobre objetos.
