Escribe dos funciones asíncronas que reciban un arreglo de **tareas**. Una tarea es una función sin argumentos que, al llamarla, **arranca** un trabajo y devuelve una promesa con su resultado (por ejemplo, `() => fetch("/api/perfil")`).

- `secuencial(tareas)`: ejecuta las tareas **una detrás de otra**. No arranca la siguiente hasta que termina la anterior.
- `paralelo(tareas)`: **arranca todas a la vez** y espera a que terminen.

Las dos se cumplen con el arreglo de resultados, en el mismo orden de las tareas.

## Reglas

- En `secuencial`, si cada tarea tarda 30 ms, dos tareas tardan unos 60 ms en total.
- En `paralelo`, el tiempo total es el de la tarea **más lenta**: dos tareas de 30 ms tardan unos 30 ms.
- Con un arreglo vacío, las dos se cumplen con `[]`.
- Usa `async/await`.

## Ejemplos

```js
const esperar = (ms, valor) => new Promise((r) => setTimeout(() => r(valor), ms));
const tareas = [() => esperar(30, "a"), () => esperar(30, "b")];

await secuencial(tareas);   // ["a", "b"] después de ~60 ms
await paralelo(tareas);     // ["a", "b"] después de ~30 ms
```

## Por qué importa

Poner un `await` detrás de otro "porque se ve ordenado" es uno de los errores de rendimiento más comunes en código real: si las peticiones no dependen entre sí, la pantalla tarda el doble o el triple sin razón. En entrevistas te muestran un código con `await` seguidos y te preguntan cómo lo acelerarías.
