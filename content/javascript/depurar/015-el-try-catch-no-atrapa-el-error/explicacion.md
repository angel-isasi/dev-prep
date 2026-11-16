## Idea clave

Un `try/catch` solo atrapa errores que ocurren **mientras el `try` se está ejecutando**. `return guardar(datos)` devuelve la promesa sin esperarla, así que el `try` termina al instante. Cuando la promesa se rechaza después, el `try` ya no existe y el rechazo sale de la función sin pasar por el `catch`. Con `return await`, la función se queda **dentro** del `try` hasta que la promesa termina, y si se rechaza, `await` la convierte en un error que el `catch` atrapa.

## Paso a paso

1. **Lee el síntoma con su pista.** Un error inmediato se atrapa; un error de red no. La diferencia entre los dos es el **momento** en que ocurre el error.
2. **Reprodúcelo.** Con una función que rechaza después de 10 ms, `guardarSeguro` se rechaza en vez de devolver `{ ok: false, ... }`.
3. **Sigue el tiempo, línea por línea.**
   - Se entra al `try`, se llama a `guardar`, que devuelve una promesa pendiente.
   - `return` sale de la función con esa promesa. El `try` terminó sin errores.
   - 10 ms después, la promesa se rechaza. Ya no hay `try`: el rechazo llega directo a quien llamó a `guardarSeguro`.
4. **Agrega `await`.**

```js
try {
  return await guardar(datos);
} catch (error) {
  return { ok: false, mensaje: error.message };
}
```

## Por qué funciona

| | `return guardar(datos)` | `return await guardar(datos)` |
|---|---|---|
| ¿Cuándo termina el `try`? | al instante | cuando la promesa termina |
| Error lanzado al instante | lo atrapa | lo atrapa |
| Promesa rechazada después | **se escapa** | lo atrapa |

`await` "desenvuelve" la promesa: si se cumple, da su valor; si se rechaza, **lanza** el error en esa línea, y como esa línea está dentro del `try`, el `catch` lo recibe.

Fuera de un `try`, `return await x` y `return x` se comportan casi igual. Por eso muchas guías dicen que el `await` del `return` "sobra". Dentro de un `try/catch`, no sobra.

## Errores comunes

- **Poner `await` al llamar a `guardarSeguro`** desde el formulario. El rechazo seguiría saliendo, solo que ahora como excepción en otro lado. El `catch` de `guardarSeguro` sigue sin enterarse.
- **Agregar un `.catch()` en otro lugar "por si acaso".** Silencia el síntoma en la consola, pero el formulario no recibe `{ ok: false, mensaje }` y no muestra el mensaje.
- **Guardar en una variable sin `await`**: `const r = guardar(datos); return r;`. Es exactamente el mismo problema con una línea más.

## Otra forma de resolverlo

Con `.catch` de la promesa, sin `try/catch`:

```js
export function guardarSeguro(guardar, datos) {
  return Promise.resolve()
    .then(() => guardar(datos))
    .catch((error) => ({ ok: false, mensaje: error.message }));
}
```

El `Promise.resolve().then(...)` hace que un error lanzado al instante también se convierta en rechazo y lo atrape el `.catch`. Con `async/await` queda más legible.

## Cómo explicarlo en la entrevista

> "El `catch` atrapaba errores inmediatos pero no los de red, así que el problema era el tiempo. `return guardar(datos)` devolvía la promesa sin esperarla y el `try` terminaba antes de que la promesa fallara. Con `return await`, la función espera dentro del `try`, y si la promesa se rechaza, el `await` lanza el error y el `catch` lo atrapa. Es el caso donde `return await` no es redundante."

## Conceptos

- **Promesa rechazada**: una promesa que terminó con error; se maneja con `await` en un `try` o con `.catch`.
- **`await`**: si la promesa se cumple devuelve el valor; si se rechaza, lanza el error en esa línea.
- **`try/catch`**: atrapa errores lanzados mientras se ejecuta el bloque `try`.
- **`return await`**: necesario dentro de un `try` para que el `catch` alcance a la promesa.
- **Unhandled rejection**: una promesa rechazada que nadie atrapó; el navegador la muestra como `Uncaught (in promise)`.
