## Idea clave

`onClick` espera **una función**, que React llamará cuando ocurra el clic. `onClick={onQuitar(fav.id)}` no pasa una función: **ejecuta** `onQuitar` en ese instante, mientras React pinta la lista, y le pasa a `onClick` el resultado (`undefined`). Por eso todos se borran al abrir la página y los botones no hacen nada. La flecha `() => onQuitar(fav.id)` crea una función que se ejecuta recién en el clic.

## Paso a paso

1. **Lee el síntoma.** Algo que debería pasar al hacer clic pasa **sin clic**, al pintar. Eso casi siempre es una función que se llama en vez de pasarse.
2. **Lee la advertencia.** "Cannot update a component while rendering a different component" dice exactamente eso: mientras React pintaba `ListaFavoritos`, alguien actualizó el estado del padre (fue `onQuitar`).
3. **Reprodúcelo.** En el test, con un `vi.fn()` como `onQuitar`, después de `render` ya tiene 2 llamadas, una por favorito, sin ningún clic.
4. **Pasa una función, no su resultado.**

```jsx
<button onClick={() => onQuitar(fav.id)}>Quitar</button>
```

## Por qué funciona

| Código | Qué recibe `onClick` | Cuándo se llama `onQuitar` |
|---|---|---|
| `onClick={onQuitar(fav.id)}` | `undefined` (lo que devolvió) | al pintar, una vez por favorito |
| `onClick={() => onQuitar(fav.id)}` | una función | al hacer clic en ese botón |

Las llaves `{ }` de JSX **evalúan** lo que tienen adentro. `onQuitar(fav.id)` se evalúa llamando a la función. `() => onQuitar(fav.id)` se evalúa creando una función nueva, que guarda el `fav.id` de ese favorito gracias al closure.

Sin argumentos no hace falta la flecha: `onClick={onCerrar}` pasa la función tal cual. El problema aparece cuando quieres pasarle un dato, como el id.

## Errores comunes

- **Escribir `onClick={onQuitar}`.** Ya no se llama al pintar, pero React le pasará **el evento del clic**, no el id: el padre recibe un objeto `SyntheticEvent` en vez de `2`.
- **Poner `onClick="onQuitar(fav.id)"`** como en HTML. En React, `onClick` con un texto no funciona: necesita una función entre llaves.
- **Evitar el bucle con un `if` en el padre** para que no borre "durante el render". Escondes el síntoma; la causa es que la función se ejecuta en el lugar equivocado.

## Otra forma de resolverlo

Usar `bind`, que también crea una función nueva con el argumento ya fijado:

```jsx
<button onClick={onQuitar.bind(null, fav.id)}>Quitar</button>
```

O guardar el id en un atributo `data-id` y leerlo del evento (`e.currentTarget.dataset.id`). La flecha es lo más común y lo más fácil de leer.

## Cómo explicarlo en la entrevista

> "Los favoritos se borraban al pintar porque `onClick={onQuitar(fav.id)}` llamaba a la función en ese momento y le pasaba a `onClick` lo que devolvía, que era `undefined`. `onClick` necesita una función que React llame en el clic. Lo cambié por `() => onQuitar(fav.id)`, que crea esa función y recuerda el id de cada favorito."

## Conceptos

- **Manejador de eventos**: la función que React llama cuando ocurre el evento (clic, cambio, envío).
- **Pasar una función y llamarla**: `fn` es la función; `fn()` es su resultado.
- **Expresiones en JSX**: lo que va entre `{ }` se evalúa al pintar.
- **Función flecha como envoltorio**: `() => fn(dato)` retrasa la llamada hasta el evento.
- **Closure**: cada flecha recuerda el `fav.id` de la vuelta del `map` en la que se creó.
